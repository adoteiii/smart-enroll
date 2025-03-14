"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  Edit,
  MapPin,
  User,
  Users,
  FileText,
  BarChart3,
  Copy,
  Download,
  X,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import {
  Registration,
  WorkshopComponentProps,
  FormField,
} from "@/lib/componentprops";
import { toast } from "sonner";
import { format } from "date-fns";
import { useAppSelector } from "@/redux/store";
import Loader from "@/components/loader/Loader";

// Helper function to format date and time
const formatDateTime = (dateString: string) => {
  try {
    return format(new Date(dateString), "MMMM d, yyyy 'at' h:mm a");
  } catch {
    return "Invalid date";
  }
};

export default function WorkshopDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const workshopId = params.workshopid as string;
  const [workshop, setWorkshop] = useState<WorkshopComponentProps | null>(null);

  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [waitlist, setWaitlist] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedRegistration, setSelectedRegistration] =
    useState<Registration | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Get Redux state
  const storedWorkshops = useAppSelector(
    (state) => state.AdminWorkshopReducer.value
  );

  useEffect(() => {
    async function fetchWorkshopData() {
      if (!workshopId) return;

      try {
        // First check if the workshop data is already in Redux
        const storedWorkshop = storedWorkshops?.find(
          (w) => w.docID === workshopId
        );

        if (storedWorkshop) {
          setWorkshop(storedWorkshop);
        } else {
          // If not in Redux, fetch from Firestore
          const workshopDoc = await getDoc(doc(db, "workshops", workshopId));

          if (!workshopDoc.exists()) {
            toast.error("Workshop not found");
            router.push("/dashboard/workshops");
            return;
          }

          setWorkshop({
            ...workshopDoc.data(),
            docID: workshopId,
          } as WorkshopComponentProps);
        }

        // Fetch registrations
        const registrationsQuery = query(
          collection(db, "registrations"),
          where("workshopId", "==", workshopId)
        );

        const registrationsSnapshot = await getDocs(registrationsQuery);
        const registrationsData = registrationsSnapshot.docs.map((doc) => ({
          docID: doc.id,
          ...doc.data(),
        })) as Registration[];

        // Split into confirmed registrations and waitlist
        setRegistrations(
          registrationsData.filter((reg) => reg.status !== "waitlist")
        );
        setWaitlist(
          registrationsData.filter((reg) => reg.status === "waitlist")
        );
      } catch (error) {
        console.error("Error fetching workshop data:", error);
        toast.error("Failed to load workshop details");
      } finally {
        setIsLoading(false);
      }
    }

    fetchWorkshopData();
  }, [workshopId, router, storedWorkshops]);

  // Helper function to render form field values
  const renderFormValue = (field: FormField, value: any) => {
    if (!value) return "Not provided";

    if (field.type === "checkbox" && Array.isArray(value)) {
      return value.join(", ");
    }

    return String(value);
  };

  // Show loading state
  if (isLoading) {
    return <Loader />;
  }

  // Handle workshop not found
  if (!workshop) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center">
          <Button variant="outline" size="icon" asChild className="mr-4">
            <Link href="/dashboard/workshops">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            Workshop Not Found
          </h1>
        </div>

        <Card>
          <CardContent className="pt-6">
            <p>
              The requested workshop could not be found. It may have been
              deleted or you don't have permission to view it.
            </p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/workshops">Return to Workshops</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center">
          <Button variant="outline" size="icon" asChild className="mr-4">
            <Link href="/dashboard/workshops">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {workshop.title}
            </h1>
            <p className="text-muted-foreground">
              Workshop details and registrations
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => {
            const registrationLink = `${window.location.origin}/workshops/${workshop.docID}`;
            navigator.clipboard.writeText(registrationLink);
            toast("Registration link copied to clipboard");
          }}
        >
          <Copy className="mr-2 h-4 w-4" /> Copy Registration Link
        </Button>
        <Button asChild>
          <Link href={`/dashboard/workshops/edit/${workshop.docID}`}>
            <Edit className="mr-2 h-4 w-4" /> Edit Workshop
          </Link>
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="registrations">
            Registrations ({registrations.length})
          </TabsTrigger>
          {workshop.enableWaitlist && (
            <TabsTrigger value="waitlist">
              Waitlist ({waitlist.length})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Workshop Details</CardTitle>
                <CardDescription>
                  Information about this workshop
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-2">Description</h3>
                    <p className="text-muted-foreground whitespace-pre-line">
                      {workshop.description || "No description provided"}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Workshop Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {workshop.category && (
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Category
                            </p>
                            <p>{workshop.category}</p>
                          </div>
                        </div>
                      )}

                      {workshop.level && (
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Level
                            </p>
                            <p>{workshop.level}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Registration Capacity
                          </p>
                          <p>
                            {workshop.registeredCount || 0} /{" "}
                            {workshop.capacity || "Unlimited"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Pricing
                          </p>
                          <p>
                            {workshop.isFree
                              ? "Free"
                              : `$${workshop.price?.toFixed(2)}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {workshop.additionalInformation && (
                    <div>
                      <h3 className="font-medium mb-2">
                        Additional Information
                      </h3>
                      <p className="text-muted-foreground whitespace-pre-line">
                        {workshop.additionalInformation}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Date & Time</p>
                      <p className="text-sm text-muted-foreground">
                        {workshop.startDate
                          ? format(new Date(workshop.startDate), "MMMM d, yyyy")
                          : "No date"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {workshop.startDate && workshop.endDate
                          ? `${format(
                              new Date(workshop.startDate),
                              "h:mm a"
                            )} - ${format(
                              new Date(workshop.endDate),
                              "h:mm a"
                            )}`
                          : "No time specified"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">
                        {workshop.location || "No location specified"}
                      </p>
                    </div>
                  </div>

                  {workshop.speaker?.name && (
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Speaker</p>
                        <p className="text-sm">{workshop.speaker.name}</p>
                        {workshop.speaker.bio && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {workshop.speaker.bio}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Workshop Status</span>
                    <Badge>
                      {workshop.status?.charAt(0).toUpperCase() +
                        workshop.status?.slice(1)}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Registration Status</span>
                    <Badge
                      variant={
                        workshop.registeredCount >= workshop.capacity
                          ? "destructive"
                          : "outline"
                      }
                    >
                      {workshop.registeredCount >= workshop.capacity
                        ? "Full"
                        : "Open"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Approval Required</span>
                    <Badge variant="outline">
                      {workshop.requireApproval ? "Yes" : "No"}
                    </Badge>
                  </div>

                  {workshop.enableWaitlist && (
                    <div className="flex items-center justify-between">
                      <span>Waitlist</span>
                      <Badge variant="outline">Enabled</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="registrations">
          <Card>
            <CardHeader>
              <CardTitle>Registered Participants</CardTitle>
              <CardDescription>
                {registrations.length}{" "}
                {registrations.length === 1 ? "person" : "people"} registered
                for this workshop
              </CardDescription>
            </CardHeader>
            <CardContent>
              {registrations.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Registered On</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registrations.map((reg) => (
                      <TableRow key={reg.docID}>
                        <TableCell className="font-medium">
                          {reg.student?.name}
                        </TableCell>
                        <TableCell>{reg.student?.email}</TableCell>
                        <TableCell>
                          {reg.timestamp
                            ? format(
                                new Date(reg.timestamp),
                                "MMM d, yyyy 'at' h:mm a"
                              )
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={reg.status ? "default" : "secondary"}>
                            {reg.status ? "Confirmed" : "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedRegistration(reg);
                              setIsDialogOpen(true);
                            }}
                          >
                            View Data
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center py-6 text-muted-foreground">
                  No registrations yet.
                </p>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="ml-auto">
                <Download className="mr-2 h-4 w-4" /> Export Participants List
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {workshop.enableWaitlist && (
          <TabsContent value="waitlist">
            <Card>
              <CardHeader>
                <CardTitle>Waitlist</CardTitle>
                <CardDescription>
                  {waitlist.length}{" "}
                  {waitlist.length === 1 ? "person" : "people"} on the waitlist
                </CardDescription>
              </CardHeader>
              <CardContent>
                {waitlist.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Joined Waitlist</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {waitlist.map((reg, index) => (
                        <TableRow key={reg.docID}>
                          <TableCell className="font-medium">
                            {reg.student?.name}
                          </TableCell>
                          <TableCell>{reg.student?.email}</TableCell>
                          <TableCell>
                            {reg.timestamp
                              ? format(
                                  new Date(reg.timestamp),
                                  "MMM d, yyyy 'at' h:mm a"
                                )
                              : "N/A"}
                          </TableCell>
                          <TableCell>#{index + 1}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedRegistration(reg);
                                setIsDialogOpen(true);
                              }}
                              className="mr-2"
                            >
                              View Data
                            </Button>
                            <Button variant="ghost" size="sm">
                              Promote
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center py-6 text-muted-foreground">
                    No one is on the waitlist yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registration Details</DialogTitle>
            <DialogDescription>
              Form data submitted by{" "}
              {selectedRegistration?.student?.name || "participant"}
              on{" "}
              {selectedRegistration?.timestamp
                ? format(
                    new Date(selectedRegistration.timestamp),
                    "MMMM d, yyyy"
                  )
                : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Personal Information</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p>{selectedRegistration?.student?.name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p>{selectedRegistration?.student?.email || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge
                    variant={
                      selectedRegistration?.status === "waitlist"
                        ? "secondary"
                        : "default"
                    }
                  >
                    {selectedRegistration?.status === "waitlist"
                      ? "Waitlist"
                      : "Registered"}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            {selectedRegistration?.formData &&
            Object.keys(selectedRegistration.formData).length > 0 ? (
              <div className="space-y-4">
                <h3 className="font-medium text-lg">Form Responses</h3>
                <div className="grid grid-cols-1 gap-3">
                  {Object.entries(selectedRegistration.formData).map(
                    ([key, value]) => {
                      // Find the field definition to know how to display the value
                      const fieldDef = workshop?.customRegistrationFields?.find(
                        (f) => f.id === key
                      ) as FormField | undefined;

                      return (
                        <div key={key} className="border p-3 rounded-md">
                          <p className="text-sm text-muted-foreground">
                            {fieldDef?.label || key}
                            {fieldDef?.required && (
                              <span className="text-red-500 ml-1">*</span>
                            )}
                          </p>
                          <p className="whitespace-pre-wrap break-words">
                            {Array.isArray(value)
                              ? value.join(", ")
                              : value?.toString() || "Not provided"}
                          </p>
                          {fieldDef?.description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {fieldDef.description}
                            </p>
                          )}
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No additional form data available.
              </div>
            )}

            <div className="space-y-4">
              <h3 className="font-medium text-lg">Registration Information</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Registered On</p>
                  <p>
                    {selectedRegistration?.timestamp
                      ? format(
                          new Date(selectedRegistration.timestamp),
                          "MMMM d, yyyy 'at' h:mm a"
                        )
                      : "N/A"}
                  </p>
                </div>
                {selectedRegistration?.status === "waitlist" && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Waitlist Position
                    </p>
                    <p>
                      #
                      {waitlist.findIndex(
                        (w) => w.docID === selectedRegistration.docID
                      ) + 1}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
