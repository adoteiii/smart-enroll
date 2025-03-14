"use client";

import Link from "next/link";
import {
  ArrowUpDown,
  Calendar,
  Clock,
  Copy,
  Edit,
  Eye,
  MoreHorizontal,
  Plus,
  Trash,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppSelector, useAppDispatch } from "@/redux/store";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { WorkshopComponentProps } from "@/lib/componentprops";
import Loader from "@/components/loader/Loader";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  doc,
  deleteDoc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { setAdminWorkshop } from "@/redux/features/admin/workshopSlice";
import {
  setAdminDrafts,
  deleteDraft,
} from "@/redux/features/admin/draftsSlice";

export default function WorkshopsPage() {
  const dispatch = useAppDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteWorkshopId, setDeleteWorkshopId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [allWorkshops, setAllWorkshops] = useState<WorkshopComponentProps[]>(
    []
  );

  // Get data from Redux store
  const organization = useAppSelector(
    (state) => state.OrganizationReducer.value
  );
  const dbuser = useAppSelector((state) => state.DBUserReducer.value);
  const drafts =
    useAppSelector((state) => state.AdminDraftsReducer.value);
  const workshops =
    useAppSelector((state) => state.AdminWorkshopReducer.value);

  // Fetch workshops and draft data when component mounts
  useEffect(() => {
    async function fetchData() {
      if (!dbuser?.organizationid || !organization) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch published workshops for this organization
        const workshopsQuery = query(
          collection(db, "workshops"),
          where("organization", "==", organization.docID)
        );
        const workshopsSnapshot = await getDocs(workshopsQuery);
        const publishedWorkshops = workshopsSnapshot.docs.map((doc) => ({
          ...doc.data(),
          docID: doc.id,
        })) as WorkshopComponentProps[];

        // Set workshops in Redux
        dispatch(setAdminWorkshop(publishedWorkshops));

        // Fetch drafts for this organization
        const draftsQuery = query(
          collection(db, "drafts"),
          where("organization", "==", organization.docID),
          where("deleted", "!=", true)
        );

        const draftsSnapshot = await getDocs(draftsQuery);
        const draftWorkshops = draftsSnapshot.docs.map((doc) => ({
          ...doc.data(),
          docID: doc.id,
          status: "draft", // Ensure it's marked as draft
        })) as WorkshopComponentProps[];

        // Set drafts in Redux
        dispatch(setAdminDrafts(draftWorkshops));

        // Combine published workshops and drafts for display
        const combinedWorkshops = [
          ...publishedWorkshops,
          ...draftWorkshops.filter((d) => !d.deleted),
        ];

        setAllWorkshops(combinedWorkshops);
      } catch (error) {
        console.error("Error fetching workshops data:", error);
        toast.error("Failed to load workshops");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [dbuser, organization, dispatch]);

  // Update combined workshops when Redux state changes
  useEffect(() => {
    const combinedWorkshops = [
      ...(workshops || []),
      ...(drafts?.filter((d) => !d.deleted) || []),
    ];

    setAllWorkshops(combinedWorkshops);
  }, [workshops, drafts]);

  // Filter workshops based on search term and status
  const filteredWorkshops = allWorkshops?.filter((workshop) => {
    const matchesSearch = workshop.title
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "published" && workshop.status !== "draft") ||
      (statusFilter === "draft" && workshop.status === "draft");
    return matchesSearch && matchesStatus;
  });

  // Handle deleting a workshop
  const handleDeleteWorkshop = async () => {
    if (!deleteWorkshopId) return;

    try {
      setIsDeleting(true);
      const workshopToDelete = allWorkshops?.find(
        (w) => w.docID === deleteWorkshopId
      );

      if (!workshopToDelete) {
        throw new Error("Workshop not found");
      }

      if (workshopToDelete.status === "draft") {
        // For drafts, we can either delete completely or mark as deleted
        const draftRef = doc(db, "drafts", deleteWorkshopId);

        // Option 1: Delete completely
        await deleteDoc(draftRef);

        // Option 2: Mark as deleted but keep the record
        // await setDoc(draftRef, { ...workshopToDelete, deleted: true }, { merge: true });

        // Update Redux state to remove the draft
        dispatch(deleteDraft(deleteWorkshopId));

        // Update local state
        setAllWorkshops((prev) =>
          prev.filter((w) => w.docID !== deleteWorkshopId)
        );
      } else {
        // Delete published workshop from Firestore
        await deleteDoc(doc(db, "workshops", deleteWorkshopId));

        // Update Redux workshops state
        if (workshops) {
          const updatedWorkshops = workshops.filter(
            (w) => w.docID !== deleteWorkshopId
          );
          dispatch(setAdminWorkshop(updatedWorkshops));
        }

        // Update local state
        setAllWorkshops((prev) =>
          prev.filter((w) => w.docID !== deleteWorkshopId)
        );
      }

      toast.success(
        workshopToDelete.status === "draft"
          ? "Draft deleted successfully"
          : "Workshop deleted successfully"
      );
    } catch (error) {
      console.error("Error deleting workshop:", error);
      toast.error("Failed to delete workshop");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setDeleteWorkshopId(null);
    }
  };

  // Handle loading state
  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Workshops</h1>
        <p className="text-muted-foreground">
          Create, manage, and track all your workshop events.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search workshops..."
            className="w-[300px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button asChild>
          <Link href="/dashboard/workshops/create">
            <Plus className="mr-2 h-4 w-4" /> Create Workshop
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Workshops</CardTitle>
          <CardDescription>
            A list of all your workshops and their current status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredWorkshops && filteredWorkshops.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">
                    <div className="flex items-center gap-1">
                      Title
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Speaker</TableHead>
                  <TableHead>Registrations</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWorkshops?.map((workshop) => (
                  <TableRow key={workshop.docID}>
                    <TableCell className="font-medium">
                      {workshop.title || "Untitled Workshop"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>
                            {workshop.startDate
                              ? format(
                                  new Date(workshop.startDate),
                                  "MMM d, yyyy"
                                )
                              : "No date"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {workshop.startDate && workshop.endDate
                              ? `${format(
                                  new Date(workshop.startDate),
                                  "h:mm a"
                                )} - ${format(
                                  new Date(workshop.endDate),
                                  "h:mm a"
                                )}`
                              : "No time specified"}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {workshop.speaker?.name || "No speaker"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>
                          {workshop.registeredCount || 0}/
                          {workshop.capacity || 0}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          workshop.status === "draft" ? "secondary" : "default"
                        }
                      >
                        {workshop.status === "draft"
                          ? "Draft"
                          : workshop.status.charAt(0).toUpperCase() +
                            workshop.status.slice(1)}
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

                          {workshop.status !== "draft" ? (
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/dashboard/workshops/${workshop.docID}`}
                              >
                                <Eye className="mr-2 h-4 w-4" /> View Details
                              </Link>
                            </DropdownMenuItem>
                          ) : null}

                          <DropdownMenuItem asChild>
                            <Link
                              href={
                                workshop.status === "draft"
                                  ? `/dashboard/workshops/create?draftId=${workshop.docID}`
                                  : `/dashboard/workshops/edit/${workshop.docID}`
                              }
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              {workshop.status === "draft"
                                ? "Continue Editing"
                                : "Edit Workshop"}
                            </Link>
                          </DropdownMenuItem>

                          {workshop.status !== "draft" && (
                            <DropdownMenuItem
                              onClick={() => {
                                const registrationLink = `${window.location.origin}/workshops/${workshop.docID}`;
                                navigator.clipboard.writeText(registrationLink);
                                toast("Link copied to clipboard");
                              }}
                            >
                              <Copy className="mr-2 h-4 w-4" /> Copy
                              Registration Link
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setDeleteWorkshopId(workshop.docID);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            {workshop.status === "draft"
                              ? "Delete Draft"
                              : "Delete Workshop"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">No workshops found</p>
              <Button className="mt-4" asChild>
                <Link href="/dashboard/workshops/create">
                  Create your first workshop
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteWorkshopId &&
              allWorkshops?.find((w) => w.docID === deleteWorkshopId)
                ?.status === "draft"
                ? "This will delete your draft workshop. This action cannot be undone."
                : "This will permanently delete this workshop and all associated data. This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteWorkshop}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting
                ? "Deleting..."
                : deleteWorkshopId &&
                  allWorkshops?.find((w) => w.docID === deleteWorkshopId)
                    ?.status === "draft"
                ? "Delete Draft"
                : "Delete Workshop"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
