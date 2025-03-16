"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppSelector, useAppDispatch } from "@/redux/store";
import { v4 as uuidv4 } from "uuid";
import { WorkshopComponentProps } from "@/lib/componentprops";
import {
  createWriteBatch,
  writeToBatch,
  commitBatch,
  getDoc,
  doc,
} from "@/lib/firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";
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
import { setAdminDraft } from "@/redux/features/admin/draftSlice";

// Import the workshop form components
import {
  WorkshopDetails,
  WorkshopSchedule,
  WorkshopRegistration,
  WorkshopPublish,
} from "@/components/adminworkshop";
import { db } from "@/lib/firebase/firebase";
import { addDraft, updateDraft } from "@/redux/features/admin/draftsSlice";
import { setAdminWorkshop } from "@/redux/features/admin/workshopSlice";
import StudentRegistration from "@/components/adminworkshop/StudentRegistration";
import dayjs from "dayjs";
import { createWorkshopNotification, NOTIFICATION_TYPES } from "@/lib/firebase/notifications";

function deepCleanUndefined(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};

  Object.entries(obj).forEach(([key, value]) => {
    // Skip undefined values
    if (value === undefined) {
      return;
    }

    // If value is array, clean each item
    if (Array.isArray(value)) {
      result[key] = value.map((item) =>
        typeof item === "object" && item !== null
          ? deepCleanUndefined(item as Record<string, any>)
          : item
      );
    }
    // If value is object, recursively clean it
    else if (typeof value === "object" && value !== null) {
      result[key] = deepCleanUndefined(value);
    }
    // Otherwise, include the value directly
    else {
      result[key] = value;
    }
  });

  return result;
}

export default function CreateWorkshopPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const draftId = searchParams.get("draftId");

  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState("details");
  const [isLoadingDraft, setIsLoadingDraft] = useState(!!draftId);
  const dbuser = useAppSelector((state) => state.DBUserReducer.value);
  const organization = useAppSelector(
    (state) => state.OrganizationReducer.value
  );
  const drafts =
    useAppSelector((state) => state.AdminDraftsReducer.value) || [];
  const workshops = useAppSelector((state) => state.AdminWorkshopReducer.value);
  const speakers =
    useAppSelector((state) => state.AdminSpeakersReducer?.value) || [];

  // Check if user has permissions to create a workshop
  const hasPermission =
    !!dbuser?.organizationid &&
    organization !== null &&
    organization !== undefined &&
    dbuser.role === "ADMIN";

  // Load specific draft if draftId is provided - direct approach
  useEffect(() => {
    async function loadDraft() {
      if (!draftId) {
        setIsLoadingDraft(false);
        return;
      }

      setIsLoadingDraft(true);

      try {
        // Always fetch directly from Firestore for consistency
        const draftDoc = await getDoc(doc(db, "drafts", draftId));

        if (draftDoc.exists()) {
          const draftData = draftDoc.data();

          if (!draftData.deleted) {
            // Helper function to convert timestamps
            const convertTimestamps = (obj: any): any => {
              if (!obj) return obj;

              if (Array.isArray(obj)) {
                return [...obj].map((item) => convertTimestamps(item));
              }

              if (typeof obj === "object") {
                // Check if it's a Firestore timestamp
                if (
                  obj?.seconds !== undefined &&
                  obj?.nanoseconds !== undefined
                ) {
                  return obj.seconds * 1000 + obj.nanoseconds / 1000000;
                }

                // Process object properties
                const result: Record<string, any> = {};
                for (const key in obj) {
                  if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    result[key] = convertTimestamps(obj[key]);
                  }
                }
                return result;
              }

              return obj;
            };

            // Convert all timestamps in the document
            const convertedData = convertTimestamps(draftData);

            const formattedDraftData = {
              ...convertedData,
              docID: draftId,
              // Ensure these specific fields are numeric timestamps
              createdAt:
                typeof convertedData.createdAt === "number"
                  ? convertedData.createdAt
                  : dayjs(convertedData.createdAt).valueOf() || Date.now(),
              updatedAt:
                typeof convertedData.updatedAt === "number"
                  ? convertedData.updatedAt
                  : dayjs(convertedData.updatedAt).valueOf() || Date.now(),
              timestamp:
                typeof convertedData.timestamp === "number"
                  ? convertedData.timestamp
                  : dayjs(convertedData.timestamp).valueOf() || Date.now(),
              lastModified:
                typeof convertedData.lastModified === "number"
                  ? convertedData.lastModified
                  : convertedData.lastModified?.seconds
                  ? convertedData.lastModified.seconds * 1000 +
                    convertedData.lastModified.nanoseconds / 1000000
                  : Date.now(),
            } as WorkshopComponentProps;

            // Set the workshop state with the loaded draft
            setWorkshop(formattedDraftData);

            // Also update Redux for consistency
            dispatch(updateDraft(formattedDraftData));
          } else {
            toast.error("This draft has been deleted");
            router.push("/dashboard/workshops");
          }
        } else {
          toast.error("Draft not found");
          router.push("/dashboard/workshops");
        }
      } catch (error) {
        console.error("Error loading draft:", error);
        toast.error("Failed to load draft");
      } finally {
        setIsLoadingDraft(false);
      }
    }

    loadDraft();
  }, [draftId, dispatch, router]);

  // Workshop state - initialize with a new workshop if no draft is being edited
  const [workshop, setWorkshop] = useState<Partial<WorkshopComponentProps>>(
    () => {
      if (draftId) {
        // If editing a draft, start with empty object
        // It will be populated by the loadDraft effect
        return {};
      }

      const timestamp = Date.now();

      // Always start with a fresh workshop when creating new
      return {
        title: "",
        description: "",
        category: "",
        level: "",
        location: "",
        capacity: 30,
        isFree: true,
        price: 0,
        requireApproval: false,
        enableWaitlist: false,
        registeredCount: 0,
        waitlistCount: 0,
        status: "draft", // Start as a draft
        sendNotifications: true,
        registrationCloses: "start",
        docID: uuidv4(), // Generate a new ID for the workshop
        id: uuidv4(), // Generate a new ID
        creator: dbuser?.uid || "",
        organization: organization?.docID || "",
        organization_name: organization?.name || "",
        organization_photo: organization?.logoUrl || "",
        organization_address: organization?.digitalAddress || "",
        organization_phone: organization?.phone || "",
        registeredStudents: [],
        waitlist: [],
        useDefaultRegistrationFields: true,
        customRegistrationFields: [],
        createdAt: timestamp, // Use numeric timestamp
        updatedAt: timestamp, // Use numeric timestamp
        timestamp: timestamp, // Use numeric timestamp
        lastModified: {
          seconds: Math.floor(timestamp / 1000),
          nanoseconds: (timestamp % 1000) * 1000000,
        }, // Create a timestamp object with seconds and nanoseconds
      };
    }
  );

  // Set organization data when it becomes available
  useEffect(() => {
    if (organization && dbuser && !draftId) {
      setWorkshop((prev) => ({
        ...prev,
        creator: dbuser.uid,
        organization: organization.docID || "",
        organization_name: organization.name || "",
        organization_photo: organization.logoUrl || "",
        organization_address: organization.digitalAddress || "",
        organization_phone: organization.phone || "",
      }));
    }
  }, [organization, dbuser, draftId]);

  // Handle field changes
  const handleChange = (field: string, value: any) => {
    setWorkshop((prev) => ({
      ...prev,
      [field]: value,
    }));
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

  // Save as draft
  const handleSaveDraft = async () => {
    if (!hasPermission) {
      toast.error(
        "You must be logged in as an admin and part of an organization to create a workshop"
      );
      return;
    }

    try {
      const timestamp = Date.now();

      // Deep clean the workshop data
      const cleanWorkshopData = deepCleanUndefined(
        workshop as Record<string, any>
      );

      // Prepare the workshop data with consistent timestamp handling
      const workshopData = {
        ...cleanWorkshopData,
        status: "draft", // Draft status
        createdAt: workshop.createdAt || timestamp, // Use timestamp if not exists
        updatedAt: timestamp, // Always update this timestamp
        timestamp: timestamp, // Consistent timestamp for all operations
        deleted: false,
        lastModified: {
          seconds: Math.floor(timestamp / 1000),
          nanoseconds: (timestamp % 1000) * 1000000,
        }, // Create a timestamp object with seconds and nanoseconds
        customRegistrationFields:
          cleanWorkshopData.customRegistrationFields || [],
        useDefaultRegistrationFields:
          cleanWorkshopData.useDefaultRegistrationFields || true,
      };

      // Special handling for form fields
      if (!workshopData.customRegistrationFields) {
        workshopData.customRegistrationFields = [];
      }

      // Ensure useDefaultRegistrationFields has a boolean value
      if (workshopData.useDefaultRegistrationFields === undefined) {
        workshopData.useDefaultRegistrationFields = true;
      }

      // Get the document ID to use (either existing draft ID or workshop ID)
      const docId = draftId || workshop.docID;

      // Create batch
      const batch = createWriteBatch();

      // Save draft to "drafts" collection with unique ID
      writeToBatch(batch, "drafts", docId as string, {
        ...workshopData,
        docID: docId, // Store the document ID in the draft data
      });

      await commitBatch(batch);

      // Update Redux store - add or update this draft
      if (draftId) {
        dispatch(
          updateDraft({
            ...workshopData,
            docID: docId,
          } as WorkshopComponentProps)
        );
      } else {
        dispatch(
          addDraft({
            ...workshopData,
            docID: docId,
          } as WorkshopComponentProps)
        );
      }

      toast.success("Workshop saved as draft");
      router.push("/dashboard/workshops");
    } catch (error) {
      console.error("Error saving workshop draft:", error);
      toast.error(`Failed to save workshop draft: ${(error as Error).message}`);
    }
  };

  // Publish workshop
  const handlePublish = async () => {
    if (!hasPermission) {
      toast.error(
        "You must be logged in as an admin and part of an organization to create a workshop"
      );
      return;
    }

    // Validate required fields
    if (!workshop.title) {
      toast.error("Workshop title is required");
      setActiveTab("details");
      return;
    }

    if (!workshop.startDate || !workshop.endDate) {
      toast.error("Workshop start and end times are required");
      setActiveTab("schedule");
      return;
    }

    try {
      const timestamp = Date.now();

      // Deep clean the workshop data to remove all undefined values
      const cleanWorkshopData = deepCleanUndefined(
        workshop as Record<string, any>
      );

      // Add required timestamps and status using numeric timestamps consistently
      const workshopData = {
        ...cleanWorkshopData,
        status: "upcoming", // Published status
        createdAt: workshop.createdAt || timestamp, // Use existing or create new
        updatedAt: timestamp, // Always update this timestamp
        timestamp: timestamp, // Consistent timestamp for all operations
        deleted: false, // deleted flag
        lastModified: {
          seconds: Math.floor(timestamp / 1000),
          nanoseconds: (timestamp % 1000) * 1000000,
        }, // Create a timestamp object with seconds and nanoseconds
        customRegistrationFields:
          cleanWorkshopData.customRegistrationFields || [],
        useDefaultRegistrationFields:
          cleanWorkshopData.useDefaultRegistrationFields || true,
      };

      // Special handling for form fields - ensure customRegistrationFields is an array
      if (!workshopData.customRegistrationFields) {
        workshopData.customRegistrationFields = [];
      }

      // Ensure useDefaultRegistrationFields has a boolean value
      if (workshopData.useDefaultRegistrationFields === undefined) {
        workshopData.useDefaultRegistrationFields = true;
      }

      // Generate docID if needed
      const docID = workshop.docID || uuidv4();

      // Create batch
      const batch = createWriteBatch();

      // Save to "workshops" collection
      writeToBatch(batch, "workshops", docID, workshopData);

      // Mark draft as deleted if we're publishing from a draft
      if (draftId) {
        writeToBatch(batch, "drafts", draftId, {
          ...workshopData,
          deleted: true, // Mark as deleted
        });
      }
      
      await createWorkshopNotification(dbuser.uid, docID, workshop.title, dayjs(workshop.timestamp).toDate(), organization.docID||"", NOTIFICATION_TYPES.WORKSHOP_PUBLISHED, );
      await commitBatch(batch);
      // create notification for you
      

      // Update Redux state - update drafts & workshops
      if (draftId) {
        dispatch(
          updateDraft({
            ...workshopData,
            deleted: true,
            docID: draftId,
          } as WorkshopComponentProps)
        );
      }

      // Update the workshops array in Redux
      if (workshops) {
        const updatedWorkshops = [...workshops];
        const existingIndex = updatedWorkshops.findIndex(
          (w) => w.docID === docID
        );

        if (existingIndex >= 0) {
          updatedWorkshops[existingIndex] = {
            ...workshopData,
            docID,
          } as WorkshopComponentProps;
        } else {
          updatedWorkshops.push({
            ...workshopData,
            docID,
          } as WorkshopComponentProps);
        }

        dispatch(setAdminWorkshop(updatedWorkshops));
      }

      toast.success("Workshop published successfully");
      router.push("/dashboard/workshops");
    } catch (error) {
      console.error("Error publishing workshop:", error);
      toast.error(`Failed to publish workshop: ${(error as Error).message}`);
    }
  };

  // If loading state or checking permissions
  if (dbuser === undefined || organization === undefined || isLoadingDraft) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Show permission error
  if (!hasPermission) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Create Workshop
            </h1>
            <p className="text-muted-foreground">
              Set up a new workshop event for students to register.
            </p>
          </div>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Permission Denied</AlertTitle>
          <AlertDescription>
            {!dbuser?.organizationid
              ? "You need to create an organization before creating workshops."
              : "You need to have admin privileges to create workshops."}
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
            <CardDescription>
              Follow these steps to create workshops
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!dbuser?.organizationid ? (
              <div className="space-y-2">
                <h3 className="font-medium">Create an Organization</h3>
                <p className="text-sm text-muted-foreground">
                  Before you can create workshops, you need to set up your
                  organization profile.
                </p>
                <Button asChild className="mt-2">
                  <Link href="/dashboard/settings?tab=organization">
                    Create Organization
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <h3 className="font-medium">Request Admin Access</h3>
                <p className="text-sm text-muted-foreground">
                  Contact your organization administrator to grant you admin
                  privileges.
                </p>
                <Button asChild variant="outline" className="mt-2">
                  <Link href="/dashboard">Return to Dashboard</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/workshops">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {draftId ? "Edit Draft Workshop" : "Create Workshop"}
          </h1>
          <p className="text-muted-foreground">
            Set up a new workshop event for students to register.
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
            onSaveDraft={handleSaveDraft}
            onContinue={handleContinue}
            speakers={speakers
              .filter((speaker) => speaker.status === "active")
              .map((speaker) => ({
                id: speaker.docID,
                name: speaker.name,
                email: speaker.email || "",
                profileImage: speaker.profileImage || "",
              }))}
          />
        </TabsContent>

        <TabsContent value="schedule">
          <WorkshopSchedule
            workshop={workshop}
            onChange={handleChange}
            onPrevious={handlePrevious}
            onContinue={handleContinue}
          />
        </TabsContent>

        <TabsContent value="registration">
          <WorkshopRegistration
            workshop={workshop}
            onChange={handleChange}
            onPrevious={handlePrevious}
            onContinue={handleContinue}
          />
        </TabsContent>

        <TabsContent value="form">
          <StudentRegistration
            workshop={workshop}
            onChange={handleChange}
            onPrevious={handlePrevious}
            onContinue={handleContinue}
          />
        </TabsContent>

        <TabsContent value="publish">
          <WorkshopPublish
            workshop={workshop}
            onChange={handleChange}
            onSaveDraft={handleSaveDraft}
            onPublish={handlePublish}
            onPrevious={handlePrevious}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
