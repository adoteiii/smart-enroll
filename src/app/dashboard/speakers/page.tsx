"use client";

import { useState, useEffect } from "react";
import {
  ArrowUpDown,
  Edit,
  MoreHorizontal,
  Trash,
  UserPlus,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAppSelector, useAppDispatch } from "@/redux/store";
import {
  setAdminSpeakers,
  addSpeaker,
  updateSpeaker,
  removeSpeaker,
} from "@/redux/features/admin/speakersSlice";
import { db } from "@/lib/firebase/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { toast } from "sonner";
import Loader from "@/components/loader/Loader";
import { Speaker } from "@/lib/componentprops";
import { or } from 'firebase/firestore';

export default function SpeakersPage() {
  const dispatch = useAppDispatch();

  // Dialog state
  const [open, setOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Speaker form state
  const [newSpeaker, setNewSpeaker] = useState<Partial<Speaker>>({
    name: "",
    email: "",
    expertise: "",
    bio: "",
    status: "active",
  });

  const [currentSpeaker, setCurrentSpeaker] = useState<Speaker | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get data from Redux store
  const organization = useAppSelector(
    (state) => state.OrganizationReducer.value
  );
  const dbuser = useAppSelector((state) => state.DBUserReducer.value);
  const speakers =
    useAppSelector((state) => state.AdminSpeakersReducer.value) || [];
  const workshops =
    useAppSelector((state) => state.AdminWorkshopReducer.value) || [];

  // Fetch speakers data
  useEffect(() => {
    async function fetchSpeakers() {
      if (!dbuser?.organizationid || !organization) {
        setIsLoading(false);
        return;
      }

      try {
        const speakersQuery = query(
          collection(db, "speakers"),
          where("organization", "==", organization.docID)
        );

        const speakersSnapshot = await getDocs(speakersQuery);

        if (speakersSnapshot.empty) {
          dispatch(setAdminSpeakers([]));
          setIsLoading(false);
          return;
        }

        const speakersData = speakersSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            docID: doc.id,
            ...data,
            status: data.status || "active",
          } as Speaker;
        });

        // For each speaker, count the workshops they're assigned to
        const speakersWithWorkshopCount = await Promise.all(
          speakersData.map(async (speaker) => {
            // Count workshops by this speaker
            const workshopCount = workshops.filter(
              (w) =>
                w.speaker?.docID === speaker.docID ||
                w.speaker?.email === speaker.email
            ).length;

            return {
              ...speaker,
              workshops: workshopCount,
            };
          })
        );

        dispatch(setAdminSpeakers(speakersWithWorkshopCount));
      } catch (error) {
        console.error("Error fetching speakers:", error);
        toast.error("Failed to load speakers");
      } finally {
        setIsLoading(false);
      }
    }

    fetchSpeakers();
  }, [dbuser, organization, dispatch, workshops]);

  // Handle adding a new speaker
  const handleAddSpeaker = async () => {
    if (!newSpeaker.name || !newSpeaker.email) {
      toast.error("Name and email are required");
      return;
    }

    if (!organization?.docID) {
      toast.error("Organization not found");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create new speaker in Firestore
      const speakerRef = await addDoc(collection(db, "speakers"), {
        name: newSpeaker.name,
        email: newSpeaker.email,
        expertise: newSpeaker.expertise || "",
        bio: newSpeaker.bio || "",
        organization: organization.docID,
        createdAt: new Date().toISOString(),
        status: newSpeaker.status || "active",
      });

      // Add to Redux
      const newSpeakerWithId: Speaker = {
        docID: speakerRef.id,
        name: newSpeaker.name,
        email: newSpeaker.email,
        expertise: newSpeaker.expertise || "",
        bio: newSpeaker.bio || "",
        organization: organization.docID,
        createdAt: new Date().toISOString(),
        status: newSpeaker.status as "active" | "pending" | "inactive",
        organizationId: organization.docID,
        workshops: 0,
        lastModified: {
          seconds: Math.floor(Date.now() / 1000),
          nanoseconds: 0
        },
      };

      dispatch(addSpeaker(newSpeakerWithId));

      toast.success("Speaker added successfully");
      setOpen(false);

      // Reset form
      setNewSpeaker({
        name: "",
        email: "",
        expertise: "",
        bio: "",
        status: "active",
      });
    } catch (error) {
      console.error("Error adding speaker:", error);
      toast.error("Failed to add speaker");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle updating a speaker
  const handleUpdateSpeaker = async () => {
    if (!currentSpeaker || !currentSpeaker.docID) {
      toast.error("Speaker not found");
      return;
    }

    setIsSubmitting(true);

    try {
      // Update in Firestore
      const speakerRef = doc(db, "speakers", currentSpeaker.docID);
      await updateDoc(speakerRef, {
        name: currentSpeaker.name,
        email: currentSpeaker.email,
        expertise: currentSpeaker.expertise || "",
        bio: currentSpeaker.bio || "",
        status: currentSpeaker.status,
        updatedAt: new Date().toISOString(),
      });

      // Update in Redux
      dispatch(updateSpeaker(currentSpeaker));

      toast.success("Speaker updated successfully");
      setEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating speaker:", error);
      toast.error("Failed to update speaker");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle deleting a speaker
  const handleDeleteSpeaker = async (speakerId: string) => {
    if (!speakerId) {
      toast.error("Speaker not found");
      return;
    }

    // Check if speaker is used in any workshops
    const speakerWorkshops = workshops.filter(
      (w) => w.speaker?.docID === speakerId
    );

    if (speakerWorkshops.length > 0) {
      toast.error(
        `Cannot delete speaker. They are assigned to ${speakerWorkshops.length} workshop(s).`
      );
      return;
    }

    try {
      // Delete from Firestore
      await deleteDoc(doc(db, "speakers", speakerId));

      // Remove from Redux
      dispatch(removeSpeaker(speakerId));

      toast.success("Speaker removed successfully");
    } catch (error) {
      console.error("Error removing speaker:", error);
      toast.error("Failed to remove speaker");
    }
  };

  // Filter speakers based on search term
  const filteredSpeakers = speakers.filter(
    (speaker) =>
      speaker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      speaker.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (speaker.expertise &&
        speaker.expertise.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Show loading state
  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Speakers</h1>
        <p className="text-muted-foreground">
          Manage speakers for your workshops.
        </p>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="relative w-full md:w-[300px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search speakers..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" /> Add Speaker
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Speaker</DialogTitle>
              <DialogDescription>
                Add a new speaker to your workshop platform.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter speaker's full name"
                  value={newSpeaker.name}
                  onChange={(e) =>
                    setNewSpeaker({ ...newSpeaker, name: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter speaker's email"
                  value={newSpeaker.email}
                  onChange={(e) =>
                    setNewSpeaker({ ...newSpeaker, email: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="expertise">Areas of Expertise</Label>
                <Input
                  id="expertise"
                  placeholder="e.g. React, JavaScript, Web Development"
                  value={newSpeaker.expertise}
                  onChange={(e) =>
                    setNewSpeaker({ ...newSpeaker, expertise: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Enter speaker's bio"
                  value={newSpeaker.bio}
                  onChange={(e) =>
                    setNewSpeaker({ ...newSpeaker, bio: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button onClick={handleAddSpeaker} disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Speaker"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Speaker Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Speaker</DialogTitle>
              <DialogDescription>Update speaker information.</DialogDescription>
            </DialogHeader>
            {currentSpeaker && (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Full Name *</Label>
                  <Input
                    id="edit-name"
                    placeholder="Enter speaker's full name"
                    value={currentSpeaker.name}
                    onChange={(e) =>
                      setCurrentSpeaker({
                        ...currentSpeaker,
                        name: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-email">Email *</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    placeholder="Enter speaker's email"
                    value={currentSpeaker.email}
                    onChange={(e) =>
                      setCurrentSpeaker({
                        ...currentSpeaker,
                        email: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-expertise">Areas of Expertise</Label>
                  <Input
                    id="edit-expertise"
                    placeholder="e.g. React, JavaScript, Web Development"
                    value={currentSpeaker.expertise || ""}
                    onChange={(e) =>
                      setCurrentSpeaker({
                        ...currentSpeaker,
                        expertise: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-bio">Bio</Label>
                  <Textarea
                    id="edit-bio"
                    placeholder="Enter speaker's bio"
                    value={currentSpeaker.bio || ""}
                    onChange={(e) =>
                      setCurrentSpeaker({
                        ...currentSpeaker,
                        bio: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <select
                    id="edit-status"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                    value={currentSpeaker.status}
                    onChange={(e) =>
                      setCurrentSpeaker({
                        ...currentSpeaker,
                        status: e.target.value as
                          | "active"
                          | "pending"
                          | "inactive",
                      })
                    }
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateSpeaker} disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Speaker"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Speakers</CardTitle>
          <CardDescription>
            Showing {filteredSpeakers.length} speaker
            {filteredSpeakers.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredSpeakers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">
                    <div className="flex items-center gap-1">
                      Speaker
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead>Expertise</TableHead>
                  <TableHead>Workshops</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSpeakers.map((speaker) => (
                  <TableRow key={speaker.docID}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          {speaker.profileImage ? (
                            <AvatarImage
                              src={speaker.profileImage}
                              alt={speaker.name}
                            />
                          ) : null}
                          <AvatarFallback>
                            {speaker.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium">{speaker.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {speaker.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {speaker.expertise || "Not specified"}
                    </TableCell>
                    <TableCell>{speaker.workshops || 0}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          speaker.status === "active"
                            ? "default"
                            : speaker.status === "pending"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {speaker.status.charAt(0).toUpperCase() +
                          speaker.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => {
                              setCurrentSpeaker(speaker);
                              setEditDialogOpen(true);
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" /> Edit Speaker
                          </DropdownMenuItem>
                          {speaker.workshops && speaker.workshops > 0 ? (
                            <DropdownMenuItem>
                              View Workshops ({speaker.workshops})
                            </DropdownMenuItem>
                          ) : null}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteSpeaker(speaker.docID)}
                            disabled={
                              (speaker.workshops && speaker.workshops > 0) ||
                              undefined
                            }
                          >
                            <Trash className="mr-2 h-4 w-4" /> Remove Speaker
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-muted-foreground">No speakers found</p>
              <p className="text-sm text-muted-foreground mt-1">
                {searchTerm
                  ? "Try a different search term"
                  : "Add your first speaker to get started"}
              </p>
              {!searchTerm && (
                <Button
                  className="mt-4"
                  variant="outline"
                  onClick={() => setOpen(true)}
                >
                  <UserPlus className="mr-2 h-4 w-4" /> Add Your First Speaker
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
