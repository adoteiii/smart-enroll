"use client";

import { useState, useEffect } from "react";
import {
  ArrowUpDown,
  Calendar,
  Check,
  Download,
  MoreHorizontal,
  Search,
  X,
  BarChart3,
  PieChart,
  LineChart,
  Users,
  Filter,
  CheckCheck,
  ChevronDown,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppSelector, useAppDispatch } from "@/redux/store";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { setAdminStudents } from "@/redux/features/admin/studentsSlice";
import {
  setAdminRegistrations,
  updateRegistration,
} from "@/redux/features/admin/registrationSlice";

import Link from "next/link";
import Loader from "@/components/loader/Loader";
import { Registration, Student } from "@/lib/componentprops";

// Add Dialog imports - add these to your existing imports
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { FormField, WorkshopComponentProps } from "@/lib/componentprops";
import { exportRegistrationsToCSV } from "@/lib/utils/csvExport";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import ResponseAnalytics from "@/components/analytics/ResponseAnalytics";
import { Mail } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  generateEmailTemplate,
  sendRegistrationEmail,
  EmailData,
} from "@/lib/communication/registrationEmails";

export default function RegistrationsPage() {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [workshopFilter, setWorkshopFilter] = useState("all-workshops");
  const [statusFilter, setStatusFilter] = useState("all-statuses");
  const [updatingRegistration, setUpdatingRegistration] = useState<
    string | null
  >(null);

  // Add these new state variables to your existing ones
  const [selectedRegistration, setSelectedRegistration] =
    useState<Registration | null>(null);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedWorkshop, setSelectedWorkshop] =
    useState<WorkshopComponentProps | null>(null);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [emailData, setEmailData] = useState<EmailData>({
    to: "",
    subject: "",
    html: "",
  });
  const [emailType, setEmailType] = useState<
    "confirmation" | "reminder" | "waitlist" | "cancelled" | "custom"
  >("custom");
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Get data from Redux store
  const organization = useAppSelector(
    (state) => state.OrganizationReducer.value
  );
  const dbuser = useAppSelector((state) => state.DBUserReducer.value);
  const workshops =
    useAppSelector((state) => state.AdminWorkshopReducer.value) || [];
  const registrations =
    useAppSelector((state) => state.AdminRegistrationReducer.value) || [];
  const students =
    useAppSelector((state) => state.AdminStudentsReducer.value) || [];

  // Fetch registrations and students data
  useEffect(() => {
    async function fetchData() {
      if (!dbuser?.organizationid || !organization) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch registrations for this organization's workshops
        const workshopsQuery = query(
          collection(db, "workshops"),
          where("organization", "==", organization.docID)
        );
        const workshopsSnapshot = await getDocs(workshopsQuery);
        const workshopIds = workshopsSnapshot.docs.map((doc) => doc.id);

        if (workshopIds.length === 0) {
          setIsLoading(false);
          return;
        }

        // Fetch all registrations for those workshops
        const registrationsQuery = query(
          collection(db, "registrations"),
          where("workshopId", "in", workshopIds)
        );
        const registrationsSnapshot = await getDocs(registrationsQuery);

        const regs = registrationsSnapshot.docs.map(
          (doc) =>
            ({
              docID: doc.id,
              ...doc.data(),
            } as Registration)
        );

        // Get unique student IDs from the registrations, filtering out guest/undefined IDs
        const studentIds = regs
          .map((reg) => reg.studentId)
          .filter(
            (id) => id !== undefined && id !== null && !id.startsWith("guest-")
          )
          .filter((id, index, arr) => arr.indexOf(id) === index);

        // Only fetch student data if there are valid student IDs
        let studentsData: Student[] = [];

        if (studentIds.length > 0) {
          // Fetch all student data
          const studentPromises = studentIds.map((studentId) =>
            getDoc(doc(db, "students", studentId))
          );

          const studentDocs = await Promise.all(studentPromises);
          studentsData = studentDocs
            .filter((doc) => doc.exists())
            .map(
              (doc) =>
                ({
                  docID: doc.id,
                  ...doc.data(),
                } as Student)
            );

          // Store students in Redux
          dispatch(setAdminStudents(studentsData));
        }

        // Add a convertTimestamp helper
        const convertTimestamp = (timestamp: any): number => {
          if (!timestamp) return 0;

          // Convert Firestore timestamp to milliseconds
          if (
            timestamp?.seconds !== undefined &&
            timestamp?.nanoseconds !== undefined
          ) {
            return timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000;
          }

          // Convert string to number if it's a date string
          if (typeof timestamp === "string") {
            const parsedDate = Date.parse(timestamp);
            return isNaN(parsedDate) ? 0 : parsedDate;
          }

          // Return as number
          return Number(timestamp) || 0;
        };

        // Enrich registrations with student and workshop data
        const enrichedRegistrations = regs.map((reg) => {
          // Handle both registered users and guest registrations
          let studentInfo;

          if (reg.studentId) {
            // For registered users, look up their info from the students collection
            const student = studentsData.find((s) => s.docID === reg.studentId);
            if (student) {
              studentInfo = {
                name: student.name,
                email: student.email,
                profileImage: student.profileImage || undefined,
              };
            }
          }

          // If no student info found (or it's a guest), use the embedded student info
          if (!studentInfo && reg.student) {
            studentInfo = {
              name: reg.student.name,
              email: reg.student.email,
              profileImage: reg.student.profileImage || undefined,
            };
          }

          const workshop = workshops.find((w) => w.docID === reg.workshopId);

          // Convert any timestamps to serializable format
          return {
            ...reg,
            registeredAt: reg.registeredAt,
            timestamp: reg.timestamp,
            student: studentInfo,
            workshop: workshop
              ? {
                  title: workshop.title,
                  startDate: convertTimestamp(workshop.startDate),
                  endDate: convertTimestamp(workshop.endDate),
                }
              : undefined,
          };
        });

        // Store registrations in Redux
        dispatch(setAdminRegistrations(enrichedRegistrations));
      } catch (error) {
        console.error("Error fetching registrations data:", error);
        toast.error("Failed to load registrations");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [dbuser, organization, workshops, dispatch]);

  // Filter registrations based on search and filters
  const filteredRegistrations = registrations.filter((registration) => {
    const matchesSearch =
      registration.student?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      registration.student?.email
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesWorkshop =
      workshopFilter === "all-workshops" ||
      registration.workshopId === workshopFilter;

    const matchesStatus =
      statusFilter === "all-statuses" ||
      registration.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesWorkshop && matchesStatus;
  });

  const prepareEmailSend = (registration: Registration) => {
    setSelectedRegistration(registration);

    // Get the workshop for this registration
    const workshop = workshops.find((w) => w.docID === registration.workshopId);

    // Determine default email type based on registration status
    let defaultEmailType:
      | "confirmation"
      | "reminder"
      | "waitlist"
      | "cancelled"
      | "custom";

    switch (registration.status) {
      case "confirmed":
        defaultEmailType = "confirmation";
        break;
      case "waitlist":
        defaultEmailType = "waitlist";
        break;
      case "cancelled":
        defaultEmailType = "cancelled";
        break;
      default:
        defaultEmailType = "custom";
    }

    setEmailType(defaultEmailType);
    setEmailData(
      generateEmailTemplate(registration, workshop, defaultEmailType)
    );
    setIsEmailDialogOpen(true);
  };

  // Handle status updates
  const handleStatusUpdate = async (
    registrationId: string,
    newStatus: string
  ) => {
    try {
      setUpdatingRegistration(registrationId);

      // Update in Firestore
      const regRef = doc(db, "registrations", registrationId);
      await updateDoc(regRef, {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });

      // Update in Redux
      const updatedReg = registrations.find((r) => r.docID === registrationId);
      if (updatedReg) {
        dispatch(
          updateRegistration({
            ...updatedReg,
            status: newStatus as any,
            updatedAt: new Date().toISOString(),
          })
        );
      }

      toast.success(`Registration ${newStatus}`);
    } catch (error) {
      console.error("Error updating registration:", error);
      toast.error("Failed to update registration");
    } finally {
      setUpdatingRegistration(null);
    }
  };

  const handleSendEmail = async () => {
    if (!selectedRegistration || !selectedRegistration.student?.email) {
      toast.error("No valid recipient email found");
      return;
    }

    try {
      setIsSendingEmail(true);

      await sendRegistrationEmail(emailData);

      const regRef = doc(db, "registrations", selectedRegistration.docID);
      await updateDoc(regRef, {
        lastEmailSent: {
          type: emailType,
          timestamp: new Date().toISOString(),
        },
        updatedAt: new Date().toISOString(),
      });

      const updatedReg = {
        ...selectedRegistration,
        lastEmailSent: {
          type: emailType,
          timestamp: new Date().toISOString(),
        },
        updatedAt: new Date().toISOString(),
      };
      dispatch(updateRegistration(updatedReg));

      toast.success(`Email sent to ${selectedRegistration.student.email}`);
      setIsEmailDialogOpen(false);
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Failed to send email");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const formatDate = (date: any, formatStr = "MMM d, yyyy") => {
    if (!date) return "No date";

    try {
      // Handle Firebase timestamp objects
      if (date && typeof date === "object" && date.seconds) {
        return format(new Date(date.seconds * 1000), formatStr);
      }

      // Handle numeric timestamps
      if (typeof date === "number") {
        return format(new Date(date), formatStr);
      }

      // Handle ISO strings and other date formats
      return format(new Date(date), formatStr);
    } catch {
      return "Invalid date";
    }
  };

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "default";
      case "pending":
        return "outline";
      case "waitlist":
        return "secondary";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  // Add this function to retrieve workshop form field definitions
  const getWorkshopFormDefinition = async (workshopId: string) => {
    try {
      // Check if we already have this workshop in Redux
      const workshopFromRedux = workshops.find((w) => w.docID === workshopId);

      if (workshopFromRedux) {
        setSelectedWorkshop(workshopFromRedux);
        return;
      }

      // If not in Redux, fetch from Firestore
      const workshopDoc = await getDoc(doc(db, "workshops", workshopId));

      if (workshopDoc.exists()) {
        const workshopData = {
          ...workshopDoc.data(),
          docID: workshopId,
        } as WorkshopComponentProps;

        setSelectedWorkshop(workshopData);
      } else {
        setSelectedWorkshop(null);
      }
    } catch (error) {
      console.error("Error fetching workshop data:", error);
      toast.error("Failed to load workshop details");
      setSelectedWorkshop(null);
    }
  };

  // Add this helper function to render form field values
  const renderFormValue = (field: FormField, value: any) => {
    if (value === undefined || value === null || value === "")
      return "Not provided";

    if (field.type === "checkbox" && Array.isArray(value)) {
      return value.join(", ");
    }

    return String(value);
  };

  // Handle loading state
  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Registrations</h1>
        <p className="text-muted-foreground">
          Manage student registrations for all your workshops.
        </p>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative w-full md:w-[300px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              className="pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={workshopFilter} onValueChange={setWorkshopFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filter by workshop" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-workshops">All Workshops</SelectItem>
              {workshops.map((workshop) => (
                <SelectItem key={workshop.docID} value={workshop.docID}>
                  {workshop.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-statuses">All Statuses</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="waitlist">Waitlist</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          className="gap-2"
          onClick={() =>
            exportRegistrationsToCSV(filteredRegistrations, workshops)
          }
        >
          <Download className="h-4 w-4" /> Export Data
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Registrations</CardTitle>
          <CardDescription>
            {filteredRegistrations.length} registration
            {filteredRegistrations.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRegistrations.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">
                    <div className="flex items-center gap-1">
                      Student
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead>Workshop</TableHead>
                  <TableHead>Workshop Date</TableHead>
                  <TableHead>Registered On</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRegistrations.map((registration) => (
                  <TableRow key={registration.docID}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          {registration.student?.profileImage ? (
                            <AvatarImage
                              src={registration.student.profileImage}
                              alt={registration.student?.name || "Student"}
                            />
                          ) : null}
                          <AvatarFallback>
                            {registration.student?.name?.charAt(0) || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {registration.student?.name || "Unknown Student"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {registration.student?.email || "No email"}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {registration.workshop?.title || "Unknown Workshop"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>
                          {registration.workshop?.startDate
                            ? formatDate(registration.workshop.startDate)
                            : "No date"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {registration.registeredAt
                        ? formatDate(
                            registration.registeredAt,
                            "MMM d, yyyy h:mm a"
                          )
                        : "Unknown"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(registration.status)}>
                        {registration.status.charAt(0).toUpperCase() +
                          registration.status.slice(1)}
                        {registration.status === "waitlist" &&
                        registration.waitlistPosition
                          ? ` (#${registration.waitlistPosition})`
                          : ""}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={
                              updatingRegistration === registration.docID
                            }
                          >
                            {updatingRegistration === registration.docID ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                            ) : (
                              <MoreHorizontal className="h-4 w-4" />
                            )}
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>

                          {/* Add View Form Response option */}
                          <DropdownMenuItem
                            onClick={async () => {
                              setSelectedRegistration(registration);
                              await getWorkshopFormDefinition(
                                registration.workshopId
                              );
                              setIsFormDialogOpen(true);
                            }}
                          >
                            View Form Response
                          </DropdownMenuItem>

                          <DropdownMenuItem asChild>
                            <Link
                              href={`/dashboard/workshops/${registration.workshopId}`}
                            >
                              View Workshop
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => prepareEmailSend(registration)}
                          >
                            <Mail className="mr-2 h-4 w-4" /> Send Email
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />

                          {registration.status === "pending" && (
                            <>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusUpdate(
                                    registration.docID,
                                    "confirmed"
                                  )
                                }
                              >
                                <Check className="mr-2 h-4 w-4 text-emerald-500" />{" "}
                                Confirm
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusUpdate(
                                    registration.docID,
                                    "cancelled"
                                  )
                                }
                              >
                                <X className="mr-2 h-4 w-4 text-destructive" />{" "}
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}

                          {registration.status === "waitlist" && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusUpdate(
                                  registration.docID,
                                  "confirmed"
                                )
                              }
                            >
                              <Check className="mr-2 h-4 w-4 text-emerald-500" />{" "}
                              Move to Confirmed
                            </DropdownMenuItem>
                          )}

                          {registration.status === "confirmed" && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusUpdate(
                                  registration.docID,
                                  "cancelled"
                                )
                              }
                              className="text-destructive focus:text-destructive"
                            >
                              <X className="mr-2 h-4 w-4" /> Cancel Registration
                            </DropdownMenuItem>
                          )}

                          {registration.status === "cancelled" && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusUpdate(
                                  registration.docID,
                                  "confirmed"
                                )
                              }
                            >
                              <Check className="mr-2 h-4 w-4 text-emerald-500" />{" "}
                              Restore Registration
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">No registrations found</p>
              {!workshops.length ? (
                <Button className="mt-4" variant="outline" asChild>
                  <Link href="/dashboard/workshops/create">
                    Create your first workshop
                  </Link>
                </Button>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Form Response Dialog */}
      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registration Form Response</DialogTitle>
            <DialogDescription>
              Form data submitted by{" "}
              {selectedRegistration?.student?.name || "participant"}
              {selectedRegistration?.registeredAt
                ? ` on ${format(
                    new Date(selectedRegistration.registeredAt),
                    "MMMM d, yyyy"
                  )}`
                : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Student Information Section */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Student Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">
                    {selectedRegistration?.student?.name || "N/A"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Email Address</p>
                  <p className="font-medium">
                    {selectedRegistration?.student?.email || "N/A"}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Registration Status
                  </p>
                  <Badge
                    variant={getStatusVariant(
                      selectedRegistration?.status || ""
                    )}
                  >
                    {selectedRegistration?.status
                      ? selectedRegistration.status.charAt(0).toUpperCase() +
                        selectedRegistration.status.slice(1)
                      : "Unknown"}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            {/* Workshop Information */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Workshop Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Workshop Title
                  </p>
                  <p className="font-medium">
                    {selectedRegistration?.workshop?.title ||
                      "Unknown Workshop"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Date & Time</p>
                  <p className="font-medium">
                    {selectedRegistration?.workshop?.startDate
                      ? format(
                          new Date(selectedRegistration.workshop.startDate),
                          "MMMM d, yyyy"
                        )
                      : "No date"}{" "}
                    {selectedRegistration?.workshop?.startDate &&
                    selectedRegistration?.workshop?.endDate
                      ? `(${format(
                          new Date(selectedRegistration.workshop.startDate),
                          "h:mm a"
                        )} - ${format(
                          new Date(selectedRegistration.workshop.endDate),
                          "h:mm a"
                        )})`
                      : ""}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Registered On</p>
                  <p className="font-medium">
                    {selectedRegistration?.registeredAt
                      ? format(
                          new Date(selectedRegistration.registeredAt),
                          "MMMM d, yyyy 'at' h:mm a"
                        )
                      : "Unknown"}
                  </p>
                </div>
                {selectedRegistration?.status === "waitlist" && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Waitlist Position
                    </p>
                    <p className="font-medium">
                      #{selectedRegistration?.waitlistPosition || "?"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Custom Form Responses */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Form Responses</h3>
              {selectedRegistration?.formData &&
              Object.keys(selectedRegistration.formData).length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {Object.entries(selectedRegistration.formData).map(
                    ([key, value]) => {
                      // Find the field definition from the workshop
                      const fieldDef =
                        selectedWorkshop?.customRegistrationFields?.find(
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
                          <p className="font-medium whitespace-pre-wrap break-words mt-1">
                            {fieldDef
                              ? renderFormValue(fieldDef, value)
                              : String(value || "Not provided")}
                          </p>
                          {fieldDef?.description && (
                            <p className="text-xs text-muted-foreground mt-1 italic">
                              {fieldDef.description}
                            </p>
                          )}
                        </div>
                      );
                    }
                  )}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No additional form data available
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Registration Analytics Section */}
      <div className="mt-6">
        <div className="flex flex-col gap-2 mb-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Registration Insights
          </h2>
          <p className="text-muted-foreground">
            Analytics and data visualization based on registration responses
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-4 ">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <TabsList>
              <TabsTrigger value="overview" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="responses" className="gap-2">
                <CheckCheck className="h-4 w-4" />
                <span className="hidden sm:inline">Response Analysis</span>
              </TabsTrigger>
              <TabsTrigger value="students" className="gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Student Breakdown</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Select
                  value={workshopFilter}
                  onValueChange={setWorkshopFilter}
                >
                  <SelectTrigger className="w-[180px] h-8">
                    <SelectValue placeholder="All Workshops" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-workshops">All Workshops</SelectItem>
                    {workshops.map((workshop) => (
                      <SelectItem key={workshop.docID} value={workshop.docID}>
                        {workshop.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <Filter className="h-3 w-3" />
                  Filters
                </Button>
              </div>
            </div>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Registrations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {registrations.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Across {workshops.length} workshops
                  </p>
                  <div className="mt-4 h-[100px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={workshops
                          .slice(0, 5)
                          .map((w) => ({
                            name:
                              w.title?.substring(0, 15) +
                              (w.title?.length > 15 ? "..." : ""),
                            count: registrations.filter(
                              (r) => r.workshopId === w.docID
                            ).length,
                          }))
                          .sort((a, b) => b.count - a.count)}
                      >
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 10 }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip
                          cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
                          contentStyle={{ fontSize: 12 }}
                        />
                        <Bar
                          dataKey="count"
                          fill="var(--primary)"
                          radius={[4, 4, 0, 0]}
                          barSize={40}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Registration Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between mb-2">
                    <div>
                      <div className="text-2xl font-bold">
                        {
                          registrations.filter((r) => r.status === "confirmed")
                            .length
                        }
                      </div>
                      <p className="text-xs text-muted-foreground">Confirmed</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">
                        {
                          registrations.filter((r) => r.status === "pending")
                            .length
                        }
                      </div>
                      <p className="text-xs text-muted-foreground">Pending</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">
                        {
                          registrations.filter((r) => r.status === "waitlist")
                            .length
                        }
                      </div>
                      <p className="text-xs text-muted-foreground">Waitlist</p>
                    </div>
                  </div>
                  <div className="mt-4 h-[100px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie
                          data={[
                            {
                              name: "Confirmed",
                              value: registrations.filter(
                                (r) => r.status === "confirmed"
                              ).length,
                            },
                            {
                              name: "Pending",
                              value: registrations.filter(
                                (r) => r.status === "pending"
                              ).length,
                            },
                            {
                              name: "Waitlist",
                              value: registrations.filter(
                                (r) => r.status === "waitlist"
                              ).length,
                            },
                            {
                              name: "Cancelled",
                              value: registrations.filter(
                                (r) => r.status === "cancelled"
                              ).length,
                            },
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={30}
                          outerRadius={50}
                          fill="#8884d8"
                          paddingAngle={1}
                          dataKey="value"
                        >
                          <Cell fill="var(--primary)" />
                          <Cell fill="var(--muted)" />
                          <Cell fill="var(--secondary)" />
                          <Cell fill="var(--destructive)" />
                        </Pie>
                        <Legend
                          layout="horizontal"
                          verticalAlign="bottom"
                          align="center"
                          wrapperStyle={{ fontSize: 10 }}
                        />
                      </RePieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Registration Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {
                      registrations.filter(
                        (r) =>
                          r.registeredAt &&
                          new Date(r.registeredAt).getTime() >
                            Date.now() - 7 * 24 * 60 * 60 * 1000
                      ).length
                    }
                  </div>
                  <p className="text-xs text-muted-foreground">
                    New registrations in the last 7 days
                  </p>
                  <div className="mt-4 h-[100px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={Array.from({ length: 7 }, (_, i) => {
                          const date = new Date();
                          date.setDate(date.getDate() - (6 - i));
                          return {
                            name: format(date, "EEE"),
                            count: registrations.filter(
                              (r) =>
                                r.registeredAt &&
                                format(
                                  new Date(r.registeredAt),
                                  "yyyy-MM-dd"
                                ) === format(date, "yyyy-MM-dd")
                            ).length,
                          };
                        })}
                      >
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 10 }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip
                          cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
                          contentStyle={{ fontSize: 12 }}
                        />
                        <Bar
                          dataKey="count"
                          fill="var(--primary)"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Response Analysis Tab */}
          <TabsContent value="responses" className="space-y-4">
            {workshopFilter === "all-workshops" ? (
              <div className="rounded-md bg-muted/50 p-4 text-center">
                <p>Select a specific workshop to analyze form responses</p>
                <div className="mt-2 max-w-[300px] mx-auto">
                  <Select
                    value={workshopFilter}
                    onValueChange={setWorkshopFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a workshop" />
                    </SelectTrigger>
                    <SelectContent>
                      {workshops.map((workshop) => (
                        <SelectItem key={workshop.docID} value={workshop.docID}>
                          {workshop.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <ResponseAnalytics
                registrations={registrations.filter(
                  (r) => r.workshopId === workshopFilter
                )}
                workshop={workshops.find((w) => w.docID === workshopFilter)}
              />
            )}
          </TabsContent>

          {/* Student Breakdown Tab */}
          <TabsContent value="students" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Student Response Breakdown</CardTitle>
                <CardDescription>
                  View individual student responses and participation data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  <Accordion type="single" collapsible className="w-full">
                    {/* Get unique students */}
                    {Array.from(
                      new Set(
                        registrations
                          .filter(
                            (r) =>
                              workshopFilter === "all-workshops" ||
                              r.workshopId === workshopFilter
                          )
                          .map((r) => r.student?.email)
                      )
                    )
                      .filter(Boolean)
                      .map((email) => {
                        const studentRegistrations = registrations.filter(
                          (r) => r.student?.email === email
                        );
                        const studentInfo = studentRegistrations[0]?.student;

                        return (
                          <AccordionItem key={email} value={email || "unknown"}>
                            <AccordionTrigger>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  {studentInfo?.profileImage ? (
                                    <AvatarImage
                                      src={studentInfo.profileImage}
                                      alt={studentInfo?.name || "Student"}
                                    />
                                  ) : null}
                                  <AvatarFallback>
                                    {studentInfo?.name?.charAt(0) || "?"}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">
                                  {studentInfo?.name || "Unknown Student"}
                                </span>
                                <span className="text-xs text-muted-foreground ml-2">
                                  {studentRegistrations.length} registration
                                  {studentRegistrations.length !== 1 ? "s" : ""}
                                </span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-4 pl-8">
                                {studentRegistrations.map((reg) => (
                                  <div
                                    key={reg.docID}
                                    className="border rounded-md p-3"
                                  >
                                    <div className="flex justify-between">
                                      <div>
                                        <h4 className="font-medium">
                                          {reg.workshop?.title ||
                                            "Unknown Workshop"}
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                          {reg.workshop?.startDate
                                            ? formatDate(reg.workshop.startDate)
                                            : "No date"}
                                        </p>
                                      </div>
                                      <Badge
                                        variant={getStatusVariant(reg.status)}
                                      >
                                        {reg.status.charAt(0).toUpperCase() +
                                          reg.status.slice(1)}
                                      </Badge>
                                    </div>

                                    {reg.formData &&
                                      Object.keys(reg.formData).length > 0 && (
                                        <div className="mt-3 pt-3 border-t">
                                          <h5 className="text-sm font-medium mb-2">
                                            Form Responses:
                                          </h5>
                                          <div className="space-y-2">
                                            {Object.entries(reg.formData)
                                              .filter(
                                                ([key]) =>
                                                  ![
                                                    "name",
                                                    "email",
                                                    "fullName",
                                                    "emailAddress",
                                                  ].includes(key.toLowerCase())
                                              )
                                              .map(([key, value]) => {
                                                const workshop = workshops.find(
                                                  (w) =>
                                                    w.docID === reg.workshopId
                                                );
                                                const field =
                                                  workshop?.customRegistrationFields?.find(
                                                    (f) => f.id === key
                                                  );

                                                return (
                                                  <div
                                                    key={key}
                                                    className="text-sm"
                                                  >
                                                    <span className="text-muted-foreground">
                                                      {field?.label || key}:
                                                    </span>{" "}
                                                    <span className="font-medium">
                                                      {Array.isArray(value)
                                                        ? value.join(", ")
                                                        : String(
                                                            value ||
                                                              "Not provided"
                                                          )}
                                                    </span>
                                                  </div>
                                                );
                                              })}
                                          </div>
                                        </div>
                                      )}
                                  </div>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        );
                      })}
                  </Accordion>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Email Dialog */}
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Send Email to {selectedRegistration?.student?.name}
            </DialogTitle>
            <DialogDescription>
              Send registration information or updates to the participant
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email-to">To</Label>
                <Input
                  id="email-to"
                  value={selectedRegistration?.student?.email || ""}
                  readOnly
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email-type">Email Template</Label>
                <Select
                  value={emailType}
                  onValueChange={(value) => {
                    setEmailType(
                      value as
                        | "confirmation"
                        | "reminder"
                        | "waitlist"
                        | "cancelled"
                        | "custom"
                    );
                    if (value !== "custom" && selectedRegistration) {
                      const workshop = workshops.find(
                        (w) => w.docID === selectedRegistration.workshopId
                      );
                      setEmailData(
                        generateEmailTemplate(
                          selectedRegistration,
                          workshop,
                          value as
                            | "confirmation"
                            | "reminder"
                            | "waitlist"
                            | "cancelled"
                        )
                      );
                    }
                  }}
                >
                  <SelectTrigger id="email-type" className="w-full">
                    <SelectValue placeholder="Select email type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="confirmation">
                      Registration Confirmation
                    </SelectItem>
                    <SelectItem value="reminder">Workshop Reminder</SelectItem>
                    <SelectItem value="waitlist">
                      Waitlist Notification
                    </SelectItem>
                    <SelectItem value="cancelled">
                      Registration Cancelled
                    </SelectItem>
                    <SelectItem value="custom">Custom Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email-subject">Subject</Label>
              <Input
                id="email-subject"
                value={emailData.subject}
                onChange={(e) =>
                  setEmailData({ ...emailData, subject: e.target.value })
                }
                placeholder="Email subject"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email-content">Email Content</Label>
              <Textarea
                id="email-content"
                value={emailData.html}
                onChange={(e) =>
                  setEmailData({ ...emailData, html: e.target.value })
                }
                placeholder="Enter the email content..."
                className="min-h-[300px] font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                HTML formatting is supported. You can use variables like{" "}
                {"{name}"}, {"{workshop.title}"}, etc.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEmailDialogOpen(false)}
              disabled={isSendingEmail}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendEmail}
              disabled={isSendingEmail}
              className="gap-2"
            >
              {isSendingEmail ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4" /> Send Email
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
