"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppSelector, useAppDispatch } from "@/redux/store";
import { Speaker, WorkshopComponentProps } from "@/lib/componentprops";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { setAdminWorkshop } from "@/redux/features/admin/workshopSlice";

// Import the workshop form components
import {
  WorkshopDetails,
  WorkshopSchedule,
  WorkshopRegistration,
  WorkshopPublish,
} from "@/components/adminworkshop";
import Loader from "@/components/loader/Loader";
import StudentRegistration from "@/components/adminworkshop/StudentRegistration";

export default function EditWorkshopPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const params = useParams();
  const workshopId = params.workshopid as string;

  const [activeTab, setActiveTab] = useState("details");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const dbuser = useAppSelector((state) => state.DBUserReducer.value);
  const organization = useAppSelector(
    (state) => state.OrganizationReducer.value
  );
  const storedWorkshops = useAppSelector(
    (state) => state.AdminWorkshopReducer.value
  );

  const speakers =
    useAppSelector((state) => state.AdminSpeakersReducer?.value) || [];

  // Check if user has permissions to edit workshops
  const hasPermission =
    !!dbuser?.organizationid &&
    organization !== null &&
    organization !== undefined &&
    dbuser.role === "ADMIN";

  // Workshop state
  const [workshop, setWorkshop] = useState<WorkshopComponentProps | null>(null);

  // Load workshop data
  useEffect(() => {
    async function loadWorkshopData() {
      if (!workshopId) {
        setIsLoading(false);
        return;
      }

      try {
        // First check if we have this workshop in Redux
        const storedWorkshop = storedWorkshops?.find(
          (w) => w.docID === workshopId
        );

        if (storedWorkshop) {
          setWorkshop(storedWorkshop);
          setIsLoading(false);
          return;
        }

        // Otherwise fetch from Firestore
        const workshopDoc = await getDoc(doc(db, "workshops", workshopId));

        if (!workshopDoc.exists()) {
          toast.error("Workshop not found");
          router.push("/dashboard/workshops");
          return;
        }

        // Set workshop data
        setWorkshop({
          ...workshopDoc.data(),
          docID: workshopId,
        } as WorkshopComponentProps);
      } catch (error) {
        console.error("Error loading workshop:", error);
        toast.error("Failed to load workshop data");
      } finally {
        setIsLoading(false);
      }
    }

    loadWorkshopData();
  }, [workshopId, storedWorkshops, router]);

  // Handle field changes
  const handleChange = (field: string, value: any) => {
    if (!workshop) return;

    setWorkshop((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        [field]: value,
      };
    });
  };

  // Navigate to the next tab
  const handleContinue = () => {
    if (activeTab === "details") {
      setActiveTab("schedule");
    } else if (activeTab === "schedule") {
      setActiveTab("registration");
    } else if (activeTab === "registration") {
      setActiveTab("form");
    } else if (activeTab === "form") {
      setActiveTab("publish");
    }
  };

  // Navigate to the previous tab
  const handlePrevious = () => {
    if (activeTab === "schedule") {
      setActiveTab("details");
    } else if (activeTab === "registration") {
      setActiveTab("schedule");
    } else if (activeTab === "form") {
      setActiveTab("registration");
    } else if (activeTab === "publish") {
      setActiveTab("form");
    }
  };

  // Save workshop changes
  const handleSave = async () => {
    if (!workshop || !hasPermission) {
      toast.error("You don't have permission to edit this workshop");
      return;
    }

    try {
      setIsSaving(true);

      // Prepare updated workshop data
      const updatedWorkshop = {
        ...workshop,
        updatedAt: new Date().toISOString(),
        lastModified: {
          seconds: Math.floor(Date.now() / 1000),
          nanoseconds: (Date.now() % 1000) * 1000000,
        },
      };

      // Update in Firestore
      await setDoc(doc(db, "workshops", workshopId), updatedWorkshop, {
        merge: true,
      });

      // Update in Redux
      if (storedWorkshops) {
        const updatedWorkshops = storedWorkshops.map((w) =>
          w.docID === workshopId ? { ...updatedWorkshop } : w
        );
        dispatch(setAdminWorkshop(updatedWorkshops));
      }

      toast.success("Workshop updated successfully");

      // Return to workshop details page
      router.push(`/dashboard/workshops/${workshopId}`);
    } catch (error) {
      console.error("Error updating workshop:", error);
      toast.error("Failed to update workshop");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle loading state
  if (isLoading || !workshop) {
    return <Loader />;
  }

  // Show permission error
  if (!hasPermission) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/dashboard/workshops/${workshopId}`}>
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Workshop</h1>
            <p className="text-muted-foreground">
              Update your workshop details.
            </p>
          </div>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Permission Denied</AlertTitle>
          <AlertDescription>
            You need to have admin privileges to edit workshops.
          </AlertDescription>
        </Alert>

        <Button asChild variant="outline">
          <Link href={`/dashboard/workshops/${workshopId}`}>
            Return to Workshop Details
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/dashboard/workshops/${workshopId}`}>
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Workshop</h1>
          <p className="text-muted-foreground">
            Update your workshop information.
          </p>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="details">Workshop Details</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="registration">Registration</TabsTrigger>
          <TabsTrigger value="form">Registration Form</TabsTrigger>
          <TabsTrigger value="publish">Publish</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <WorkshopDetails
            workshop={workshop}
            onChange={handleChange}
            onSaveDraft={() => {}} // Not applicable for editing
            onContinue={handleContinue}
            speakers={speakers
              .filter((speaker) => speaker.status === "active")
              .map((speaker) => ({
                id: speaker.docID,
                name: speaker.name,
                email: speaker.email || "",
                profileImage: speaker.profileImage || "",
              }))}
            isEditing={true}
          />
        </TabsContent>

        <TabsContent value="schedule">
          <WorkshopSchedule
            workshop={workshop}
            onChange={handleChange}
            onPrevious={handlePrevious}
            onContinue={handleContinue}
            isEditing={true}
          />
        </TabsContent>

        <TabsContent value="registration">
          <WorkshopRegistration
            workshop={workshop}
            onChange={handleChange}
            onPrevious={handlePrevious}
            onContinue={handleContinue}
            isEditing={true}
          />
        </TabsContent>

        <TabsContent value="form">
          <StudentRegistration
            workshop={workshop}
            onChange={handleChange}
            onPrevious={handlePrevious}
            onContinue={handleContinue}
            isEditing={true}
          />
        </TabsContent>

        <TabsContent value="publish">
          <Card>
            <CardHeader>
              <CardTitle>Update Workshop</CardTitle>
              <CardDescription>
                Review your changes and update this workshop.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-1">
                <h3 className="font-medium">Workshop Title</h3>
                <p className="text-sm text-muted-foreground">
                  {workshop.title}
                </p>
              </div>

              <div className="space-y-1">
                <h3 className="font-medium">Date & Time</h3>
                <p className="text-sm text-muted-foreground">
                  {workshop.startDate
                    ? new Date(workshop.startDate).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "No date set"}
                  {workshop.startDate && workshop.endDate
                    ? `, ${new Date(workshop.startDate).toLocaleTimeString(
                        "en-US",
                        {
                          hour: "numeric",
                          minute: "numeric",
                        }
                      )} - ${new Date(workshop.endDate).toLocaleTimeString(
                        "en-US",
                        {
                          hour: "numeric",
                          minute: "numeric",
                        }
                      )}`
                    : ""}
                </p>
              </div>

              <div className="space-y-1">
                <h3 className="font-medium">Location</h3>
                <p className="text-sm text-muted-foreground">
                  {workshop.location || "No location specified"}
                </p>
              </div>

              <div className="space-y-1">
                <h3 className="font-medium">Registration Capacity</h3>
                <p className="text-sm text-muted-foreground">
                  {workshop.capacity || "No limit"}
                  {workshop.enableWaitlist && " (with waitlist)"}
                </p>
              </div>

              <div className="space-y-1">
                <h3 className="font-medium">Registration Form</h3>
                <p className="text-sm text-muted-foreground">
                  {workshop.useDefaultRegistrationFields
                    ? "Using default registration fields"
                    : "Using custom registration form"}
                  {workshop.customRegistrationFields &&
                    workshop.customRegistrationFields.length > 0 &&
                    ` with ${workshop.customRegistrationFields.length} custom fields`}
                </p>
              </div>

              <Alert>
                <AlertDescription>
                  Updating this workshop will notify any registered participants
                  about the changes.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handlePrevious}>
                Back
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" asChild>
                  <Link href={`/dashboard/workshops/${workshopId}`}>
                    Cancel
                  </Link>
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
