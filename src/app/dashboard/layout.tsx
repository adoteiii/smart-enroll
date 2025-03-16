"use client";

import type React from "react";

import { ReactNode, useContext, useState, useEffect } from "react";
import { Mail } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Context } from "@/lib/userContext";
import { sendEmailVerificationLink } from "@/lib/firebase/auth";
import { toast } from "sonner";

import AppSidebar from "@/components/dashboard/dashboard-sidebar";
import DashboardNavbar from "@/components/dashboard/dashboard-navbar";
import { Protected } from "@/components/security/Protected";
import localforage from "localforage";
import { useDispatch } from "react-redux";
import { AppDispatch, useAppSelector } from "@/redux/store";
import {
  FirebaseNotification,
  OrganizationFormData,
  Registration,
  Speaker,
  Student,
  WorkshopComponentProps,
} from "@/lib/componentprops";
import { useLocalStorage } from "usehooks-ts";
import { setAdminWorkshop } from "@/redux/features/admin/workshopSlice";
import {
  and,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  or,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import dayjs from "dayjs";
import { db } from "@/lib/firebase/firebase";
import { setAdminDraft } from "@/redux/features/admin/draftSlice";
import { setOrganization } from "@/redux/features/admin/organizationSlice";
// Add this to your imports section
import { setAdminSpeakers } from "@/redux/features/admin/speakersSlice";
import { DBUSER, Message } from "@/lib/types";
import { setMessages } from "@/redux/features/messagesSlice";
import { setNotifications } from "@/redux/features/notificationSlice";
import { setAdminRegistrations } from "@/redux/features/admin/registrationSlice";
import { setAdminStudents } from "@/redux/features/admin/studentsSlice";

const Layout = ({ children }: { children: ReactNode }) => {
  const { user } = useContext(Context);
  const [isLoading, setIsLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const dbuser = useAppSelector((state) => state.DBUserReducer.value);
  const workshops = useAppSelector((state) => state.AdminWorkshopReducer.value);
  const registrations = useAppSelector(
    (state) => state.AdminRegistrationReducer.value
  );
  const organization = useAppSelector(
    (state) => state.OrganizationReducer.value
  );

  // draft
  const [draftStorage, setDraftStorage] = useLocalStorage<
    undefined | WorkshopComponentProps | null
  >("smart-enroll-draft", undefined);

  useEffect(() => {
    if (!dbuser?.organizationid || !dbuser?.uid) {
      return;
    }
    const unsubscribe = onSnapshot(
      query(
        collection(db, "messages"),
        where("uid", "==", dbuser.uid),
        orderBy("timestamp")
      ),
      (snapshot) => {
        const messages = snapshot.docs.map((doc) => doc.data() as Message);
        dispatch(setMessages(messages));
      }
    );
    return unsubscribe;
  }, [dbuser]);

  useEffect(() => {
    if (!dbuser?.organizationid || !organization?.docID) {
      return;
    }
    const workshopsQuery = query(
      collection(db, "workshops"),
      where("organization", "==", organization.docID)
    );
    const unsubscribe = onSnapshot(workshopsQuery, (workshopsSnapshot) => {
      const workshopsData = workshopsSnapshot.docs.map((doc) => {
        const data = doc.data();

        // Helper function to convert timestamps recursively
        const convertTimestamps = (obj: any): any => {
          if (!obj) return obj;

          // Handle arrays
          if (Array.isArray(obj)) {
            return obj.map((item) => convertTimestamps(item));
          }

          // Handle objects
          if (typeof obj === "object") {
            // Check if it's a Firestore timestamp
            if (obj?.seconds !== undefined && obj?.nanoseconds !== undefined) {
              return obj.seconds * 1000 + obj.nanoseconds / 1000000;
            }

            // Recursively process object properties
            const result: Record<string, any> = {};
            for (const key in obj) {
              result[key] = convertTimestamps(obj[key]);
            }
            return result;
          }

          return obj;
        };

        // Convert all timestamps in the document
        const convertedData = convertTimestamps(data);

        return {
          ...convertedData,
          docID: doc.id,
          // Convert lastModified timestamp explicitly if it exists
          lastModified: data.lastModified
            ? data.lastModified.seconds * 1000 +
              data.lastModified.nanoseconds / 1000000
            : undefined,
        };
      }) as WorkshopComponentProps[];

      dispatch(setAdminWorkshop(workshopsData));
    });
    return unsubscribe;
  }, [dbuser, organization]);

  useEffect(() => {
    if (!dbuser?.organizationid || !organization?.docID) {
      return;
    }

    const draftQuery = doc(collection(db, "draft"), dbuser.organizationid);
    const unsubscribe = onSnapshot(draftQuery, (draftSnapshot) => {
      if (!draftSnapshot.exists()) {
        setDraftStorage({
          creator: dbuser?.organizationid as string,
          id: dbuser?.organizationid as string,
          docID: dbuser?.organizationid as string,
          title: "",
          description: "",
          startDate: 0,
          endDate: 0,
          capacity: 0,

          createdAt: 0,
          updatedAt: 0,
          isFree: true,
          registeredStudents: [],
          attendance: {
            attended: 0,
            total: 0,
          },

          deleted: false,
          organization: "",
          organization_name: "",
          organization_photo: "",
          organization_address: "",
          organization_phone: "",
          timestamp: 0,

          lastModified: { seconds: 0, nanoseconds: 0 },
          location: "",
          workshopImage: [],
          registeredCount: 0,
          status: "upcoming",
          speaker: {
            docID: "",
            name: "",
            bio: "",
            email: "",
            status: "active",
            profileImage: "",
            createdAt: "",
            organizationId: "",
          },
          category: "",
          level: "",
          sendNotifications: false,
          requireApproval: false,
          enableWaitlist: false,
          waitlistCount: 0,
          waitlist: [],
          registrationCloses: "",
          additionalInformation: "",
        });
        return;
      }
      const draftData = draftSnapshot.data() as WorkshopComponentProps;
      dispatch(setAdminDraft(draftData));
    });
    return unsubscribe;
  }, [dbuser, organization]);

  useEffect(() => {
    if (draftStorage !== undefined) {
      // just get the last modified
      dispatch(setAdminDraft(draftStorage));
      return;
    }
  }, [dispatch, draftStorage]);

  useEffect(() => {
    if (!dbuser) {
      return;
    }
    if (!dbuser?.organizationid) {
      dispatch(setOrganization(null));
      return;
    }
    // console.log(lastModifiedWithdrawalMethod, "last modified withdrawal method");
    console.log("organization", dbuser.organizationid, dbuser);
    // console.log("listener", lastModifiedWithdrawalMethod);
    const organizationRef = collection(db, "organization");
    // console.log("listener ts", ts);
    const q = doc(organizationRef, dbuser.organizationid);
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        // store in local storage the last timestamp
        // merge results
        let data = {
          ...snapshot?.data(),
          docID: snapshot.id,
        } as OrganizationFormData;
        // console.log(data, "snapshot data with meth");
        if (data === null || data === undefined) {
          return;
        }
        console.log("d", data, "query worked org ");
        dispatch(setOrganization(data));
      },
      (e) => {
        console.log(e, "q not worked", "organization");
        // toast({
        //   description: "You may not have internet connection.",
        //   variant: "destructive",
        //   title: "Error",
        // });
        dispatch(setOrganization(null));
      }
    );
    return unsubscribe;
  }, [dbuser]);

  // Fetch speakers data
  useEffect(() => {
    if (!dbuser?.organizationid || !organization?.docID) {
      return;
    }

    const speakersQuery = query(
      collection(db, "speakers"),
      where("organization", "==", organization.docID) // correct query
    );

    const unsubscribe = onSnapshot(
      speakersQuery,
      (snapshot) => {
        const speakersData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            ...data,
            docID: doc.id,
            name: data.name || "",
            email: data.email || "",
            createdAt: data.createdAt || "",
            status: data.status || "active",
            organization: data.organization || "",
            organizationId: data.organization || "",
            lastModifiedSpeakers: data.lastModified || undefined,
          };
        });

        // Store speakers in Redux and local storage
        dispatch(setAdminSpeakers(speakersData as Speaker[]));
      },
      (error) => {
        console.error("Error fetching speakers data:", error);
      }
    );
    return unsubscribe;
  }, [dbuser, organization, dispatch]);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode");

    if (savedDarkMode !== null) {
      setIsDarkMode(savedDarkMode === "true");
    } else {
      // Check for system preference
      setIsDarkMode(window.matchMedia("(prefers-color-scheme: dark)").matches);
    }

    // Apply the dark mode class if needed
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem("darkMode", String(newMode));
    document.documentElement.classList.toggle("dark", newMode);
  };

  const handleSendEmailVerificationLink = () => {
    setIsLoading(true);
    sendEmailVerificationLink(user)
      .then(() => {
        toast("Your email verification link has been sent to " + user.email);
        setIsLoading(false);
        setLoaded(true);
      })
      .catch(() => {
        setIsLoading(false);
        toast.error("Your email verification link could not been sent.");
      });
  };

  useEffect(() => {
    if (!user?.uid) return;
    if (!organization?.docID) return;
    const notificationsRef = collection(db, "notifications");
    const q = query(
      notificationsRef,
      where("organizationId", "==", organization.docID),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const notificationsData: FirebaseNotification[] = [];
        console.log("notifications", querySnapshot.docs);
        querySnapshot.forEach((doc) => {
          notificationsData.push({
            id: doc.id,
            ...doc.data(),
          } as FirebaseNotification);
        });
        dispatch(
          setNotifications(
            notificationsData.filter((n) => !n.deleted[user.uid])
          )
        );
      },
      (error) => {
        console.log(error);
        dispatch(setNotifications(null));
      }
    );
    return unsubscribe;
  }, [user, organization]);

  // Fetch registrations and students data
  useEffect(() => {
    if (!dbuser?.organizationid || workshops === undefined) {
      return;
    }

    // Fetch registrations for this organization's workshops

    const workshopIds = workshops?.map((doc) => doc.docID);

    if (workshopIds?.length === 0) {
      return;
    }

    console.log("workshopIds", workshopIds);

    // Fetch all registrations for those workshops
    const registrationsQuery = query(
      collection(db, "registrations"),
      where("workshopId", "in", workshopIds)
    );
    const unsubscribe = onSnapshot(
      registrationsQuery,
      (registrationsSnapshot) => {
        const regs = registrationsSnapshot.docs.map(
          (doc) =>
            ({
              docID: doc.id,
              ...doc.data(),
            } as Registration)
        );

        // Get unique student IDs from the registrations, filtering out guest/undefined IDs

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

          // If no student info found (or it's a guest), use the embedded student info
          if (reg.student) {
            studentInfo = {
              id: reg.studentId,
              name: reg.student.name,
              email: reg.student.email,
              profileImage: reg.student.profileImage || undefined,
            };
          } else {
            studentInfo = {
              id: reg.studentId,
              name:  "Guest",
              email: "",
              profileImage: undefined,
            }
          }

          const workshop = workshops?.find((w) => w.docID === reg.workshopId);

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
      },
      (error) => {
        console.error("Error fetching registrations data:", error);
        toast.error("Failed to load registrations");
        dispatch(setAdminRegistrations(null));
      }
    );
    return unsubscribe;
  }, [workshops]);

  useEffect(() => {
    if (!registrations) return;
    const studentIds = registrations
      .map((reg) => reg.studentId)
      .filter(
        (id) => id !== undefined && id !== null && !id.startsWith("guest-")
      )
      .filter((id, index, arr) => arr.indexOf(id) === index);
    if (studentIds.length === 0) {
      dispatch(setAdminStudents([]));
      return;
    }
    const unsubscribe = onSnapshot(
      query(collection(db, "dbuser"), where("uid", "in", studentIds)),
      (snapshot) => {
        const studentsData: Student[] = snapshot.docs.map((doc) => {
          const data = doc.data() as DBUSER;
          return {
            docID: doc.id,
            uid: data.uid,
            name: data.displayName,
            email: data.email,
            createdAt: dayjs().valueOf(),
            profileImage: "",
          };
        });
        dispatch(setAdminStudents(studentsData));
      },
      (error) => {
        console.error("Error fetching students data:", error);
        toast.error("Failed to load students");
        setAdminStudents(null);
      }
    );
    return unsubscribe;
    // Only fetch student data if there are valid student IDs
    
  }, [registrations]);

  return (
    <Protected>
      {!user?.emailVerified ? (
        <div className="h-screen w-full flex items-center justify-center">
          <Card className="w-full max-w-md mx-4">
            <CardHeader className="space-y-1">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-6 w-6 text-blue-500" />
              </div>
              <CardTitle className="text-2xl text-center">
                Verify your email
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-500 text-center">
                To ensure the security of your account, we need to verify your
                email address. Click below to receive a verification link.
              </p>
              <Button
                className="w-full"
                onClick={handleSendEmailVerificationLink}
                disabled={isLoading || loaded}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Mail className="h-4 w-4 animate-spin" />
                    Sending verification...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Send verification link
                  </span>
                )}
              </Button>
              <p className="text-sm text-gray-400 text-center">
                Didn&apos;t receive the email? Check your spam folder or contact
                support.
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="min-h-screen w-full bg-background">
          <SidebarProvider defaultOpen={true}>
            <div className="flex h-screen w-full overflow-hidden">
              <AppSidebar />
              <div className="flex flex-1 flex-col w-full overflow-hidden">
                <DashboardNavbar
                  isDarkMode={isDarkMode}
                  toggleDarkMode={toggleDarkMode}
                />
                <main className="flex-1 w-full overflow-y-auto p-4 md:p-6">
                  <div className="w-full">{children}</div>
                </main>
              </div>
            </div>
          </SidebarProvider>
        </div>
      )}
    </Protected>
  );
};

export default Layout;
