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
  OrganizationFormData,
  Speaker,
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
  query,
  where,
} from "firebase/firestore";
import dayjs from "dayjs";
import { db } from "@/lib/firebase/firebase";
import { setAdminDraft } from "@/redux/features/admin/draftSlice";
import { setOrganization } from "@/redux/features/admin/organizationSlice";
// Add this to your imports section
import { setAdminSpeakers } from "@/redux/features/admin/speakersSlice";
import { Message } from "@/lib/types";
import { setMessages } from "@/redux/features/messagesSlice";

const Layout = ({ children }: { children: ReactNode }) => {
  const { user } = useContext(Context);
  const [isLoading, setIsLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const dbuser = useAppSelector((state) => state.DBUserReducer.value);

  const store = localforage.createInstance({
    name: "smart-enroll",
    version: 2,
  });

  const organization = useAppSelector(
    (state) => state.OrganizationReducer.value
  );

  const workshop = useAppSelector((state) => state.AdminWorkshopReducer.value);
  const [updatingAdminWorkshop, setUpdatingAdminWorkshop] = useState(true);
  const [lastModifiedAdminWorkshop, setLastModifiedAdminWorkshop] = useState<
    number | undefined
  >(undefined);

  // draft
  const [lastModifiedDraft, setLastModifiedDraft] = useLocalStorage<
    undefined | number
  >("smart-enroll-draft-lastmodified", undefined);
  const [draftStorage, setDraftStorage] = useLocalStorage<
    undefined | WorkshopComponentProps | null
  >("smart-enroll-draft", undefined);

  useEffect(() => {
    if (!dbuser?.organizationid || !dbuser?.uid) {
      return;
    }
    const unsubscribe = onSnapshot(
      query(collection(db, "messages"), where("uid", "==", dbuser.uid)),
      (snapshot) => {
        const messages = snapshot.docs.map((doc) => doc.data() as Message);
        dispatch(setMessages(messages));
      }
    );
    return unsubscribe
  }, [dbuser]);

  // listeners for snapshots
  useEffect(() => {
    if (workshop !== undefined && lastModifiedAdminWorkshop !== undefined) {
      setUpdatingAdminWorkshop(false);
    }
  }, [workshop, lastModifiedAdminWorkshop]);

  useEffect(() => {
    if (!dbuser?.organizationid || !organization?.docID) {
      return;
    }
    const workshopsQuery = query(
      collection(db, "workshops"),
      where("organization", "==", organization.docID)
    );
    const unsubscribe = onSnapshot(workshopsQuery, (workshopsSnapshot) => {
      const workshopsData = workshopsSnapshot.docs.map((doc) => ({
        ...doc.data(),
        docID: doc.id,
        lastModified: {
          seconds: doc.get("lastModified")?.seconds,
          nanoseconds: doc.get("lastModified")?.nanoseconds,
        },
      })) as WorkshopComponentProps[]
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

          createdAt: "",
          updatedAt: "",
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

  // useEffect(() => {
  //   if (!dbuser?.organizationid) {
  //     return;
  //   }
  //   if (organization?.docID !== dbuser.organizationid) {
  //     return;
  //   }
  //   console.log("initial load... comp", lastModifiedAdminWorkshop);
  //   store
  //     .getItem("adminworksop")
  //     .then((adminWorksopStorage: any) => {
  //       console.log("stored already: ", adminWorksopStorage);
  //       dispatch(
  //         setAdminWorkshop(
  //           adminWorksopStorage
  //             ?.filter((i: any) => i.creator === dbuser?.organizationid)
  //             ?.filter((i: any) => !i?.deleted) || []
  //         )
  //       );

  //       store
  //         .getItem("adminworkshop-lastmodified")
  //         .then((lastmodified: any) => {
  //           setLastModifiedAdminWorkshop(lastmodified || 0);

  //           console.log("stored already ts: ", lastmodified);
  //         })
  //         .catch(() => {
  //           // I rather the user restarts
  //           setLastModifiedAdminWorkshop(0);
  //           console.log("stored already ts: ", 0);
  //         });
  //     })
  //     .catch(() => {
  //       dispatch(setAdminWorkshop([]));
  //       store
  //         .getItem("adminworkshop-lastmodified")
  //         .then((lastmodified: any) => {
  //           setLastModifiedAdminWorkshop(lastmodified || 0);
  //           // setUpdatingAdminCompetition(false);
  //         })
  //         .catch(() => {
  //           // I rather the user restarts
  //           setLastModifiedAdminWorkshop(0);
  //         });
  //     });
  // }, [dbuser, organization]);

  // useEffect(() => {
  //   if (!dbuser?.organizationid) {
  //     return;
  //   }
  //   if (organization?.docID !== dbuser.organizationid) {
  //     // not registered / accepted
  //     return;
  //   }
  //   if (updatingAdminWorkshop) {
  //     // dont do anything while updating
  //     // console.log("Busy with admin competitions");
  //     return;
  //   }
  //   if (lastModifiedAdminWorkshop === undefined) {
  //     return;
  //   }
  //   // console.log(lastModifiedAdminCompetitions, "last modified");
  //   // console.log("beginning update competition", lastModifiedAdminCompetitions);
  //   console.log(
  //     "listener for event: ",
  //     lastModifiedAdminWorkshop,
  //     dbuser?.organizationid
  //   );
  //   const ref = collection(db, "workshops");
  //   const ts = dayjs(lastModifiedAdminWorkshop || 0).toDate();
  //   // console.log("listener ts", ts);
  //   const q = query(
  //     ref,
  //     where("creator", "==", dbuser?.organizationid),
  //     where("lastModified", ">", ts)
  //   );
  //   const unsubscribe = onSnapshot(
  //     q,
  //     (snapshot) => {
  //       // store in local storage the last timestamp
  //       // merge results
  //       let data: WorkshopComponentProps[] = [];
  //       console.log("snapshot event", snapshot.docs, ts);
  //       snapshot.docs.forEach((doc) => {
  //         data.push({
  //           ...(doc.data() as WorkshopComponentProps),
  //           docID: doc.id,
  //           lastModified: {
  //             seconds: doc.get("lastModified")?.seconds,
  //             nanoseconds: doc.get("lastModified")?.nanoseconds,
  //           },
  //         });
  //       });
  //       // console.log(data, "snapshot data");
  //       if (data === null || data === undefined) {
  //         return;
  //       }
  //       data = data?.sort(
  //         (a, b) => b.lastModified?.seconds - a.lastModified?.seconds
  //       );
  //       if (data && data.length > 0) {
  //       } else {
  //         return;
  //       }
  //       setUpdatingAdminWorkshop(true);
  //       store.getItem("adminworkshop").then((AdminWorkshopStorage: any) => {
  //         let datamerged: WorkshopComponentProps[] = [];
  //         AdminWorkshopStorage?.forEach((d: WorkshopComponentProps) => {
  //           datamerged.push(d);
  //         });
  //         let indexValue: any = {};
  //         datamerged.forEach((d, idx) => {
  //           indexValue[d.id] = idx;
  //         });
  //         data.forEach((result, idx) => {
  //           if (indexValue[result.id] === undefined) {
  //             datamerged.push(result);
  //           } else {
  //             datamerged[indexValue[result.id]] = result;
  //           }
  //         });
  //         setLastModifiedAdminWorkshop(undefined);
  //         store
  //           .setItem("adminworkshop", datamerged)
  //           .then(() => {
  //             store.getItem("adminworkshop").then((admineworkshop: any) => {
  //               dispatch(
  //                 setAdminWorkshop(
  //                   admineworkshop
  //                     ?.filter((i: any) => i.creator === dbuser?.organizationid)
  //                     ?.filter((i: any) => !i?.deleted)
  //                 )
  //               );
  //             });
  //             const ts = Math.floor(
  //               data?.[0]?.lastModified.seconds * 1000 +
  //                 data?.[0].lastModified.nanoseconds / 1000000
  //             );
  //             // console.log("ts", ts);
  //             // console.log(dayjs(ts).toISOString());
  //             store.setItem("adminworkshop-lastmodified", ts).then(() => {
  //               setLastModifiedAdminWorkshop(ts);
  //             });
  //           })
  //           .catch(() => setUpdatingAdminWorkshop(false));
  //       });

  //       // setAdminCompetitionStorage(datamerged));
  //     },
  //     (e) => {
  //       console.log(e, "q not worked", e.message, " Events");

  //       toast.error("You may not have permission");
  //     }
  //   );
  //   return unsubscribe;
  // }, [lastModifiedAdminWorkshop, dbuser, updatingAdminWorkshop, organization]);

  useEffect(() => {
    if (draftStorage !== undefined) {
      // just get the last modified
      dispatch(setAdminDraft(draftStorage));
      return;
    }
  }, [dispatch, draftStorage]);

  // useEffect(() => {
  //   if (!dbuser?.organizationid) {
  //     // console.log("No uid");
  //     return;
  //   }
  //   // console.log(lastModifiedDraft, "last modified");
  //   if (organization?.docID !== dbuser.organizationid) {
  //     return;
  //   }

  //   if (dbuser?.role !== "ADMIN") {
  //     dispatch(setAdminDraft(null));
  //     return;
  //   }
  //   // console.log("listener", lastModifiedDraft);
  //   const ref = collection(db, "draft");
  //   const ts = lastModifiedDraft || 0;
  //   // console.log("listener ts", ts);
  //   const q = doc(ref, dbuser?.organizationid);
  //   const unsubscribe = onSnapshot(
  //     q,
  //     (snapshot) => {
  //       // store in local storage the last timestamp
  //       // merge results

  //       if (!dbuser?.organizationid) {
  //         return;
  //       }

  //       if (!snapshot.exists()) {
  //         setDraftStorage({
  //           creator: dbuser?.organizationid as string,
  //           id: dbuser?.organizationid as string,
  //           docID: dbuser?.organizationid as string,
  //           title: "",
  //           description: "",
  //           startDate: 0,
  //           endDate: 0,
  //           capacity: 0,

  //           createdAt: "",
  //           updatedAt: "",
  //           isFree: true,
  //           registeredStudents: [],
  //           attendance: {
  //             attended: 0,
  //             total: 0,
  //           },

  //           deleted: false,
  //           organization: "",
  //           organization_name: "",
  //           organization_photo: "",
  //           organization_address: "",
  //           organization_phone: "",
  //           timestamp: 0,

  //           lastModified: { seconds: 0, nanoseconds: 0 },
  //           location: "",
  //           workshopImage: [],
  //           registeredCount: 0,
  //           status: "upcoming",
  //           speaker: {
  //             docID: "",
  //             name: "",
  //             bio: "",
  //             email: "",
  //             status: "active",
  //             profileImage: "",
  //             createdAt: "",
  //             organizationId: "",
  //           },
  //           category: "",
  //           level: "",
  //           sendNotifications: false,
  //           requireApproval: false,
  //           enableWaitlist: false,
  //           waitlistCount: 0,
  //           waitlist: [],
  //           registrationCloses: "",
  //           additionalInformation: "",
  //         });
  //         return;
  //       }
  //       let data = { ...snapshot.data() } as WorkshopComponentProps;
  //       // console.log(data, "snapshot data");
  //       if (data === null || data === undefined) {
  //         return;
  //       }
  //       // console.log("d", data, "query worked draft");

  //       const ts = data?.timestamp;
  //       // console.log("ts", ts);
  //       // console.log(dayjs(ts).toISOString());
  //       setLastModifiedDraft(ts);

  //       // no merging required, just replacement on timestamp change. This will only cost one read per change. It would not use the cache.
  //       setDraftStorage(data);
  //     },
  //     (e) => {
  //       console.log(e, "q not worked", e.message, "draft");
  //       toast.error("You may not have permission");
  //     }
  //   );
  //   return unsubscribe;
  // }, [dbuser, organization]);

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

  const [updatingSpeakers, setUpdatingSpeakers] = useState(true);
  const [lastModifiedSpeakers, setLastModifiedSpeakers] = useState<
    number | undefined
  >(undefined);

  // Fetch speakers data
  useEffect(() => {
    if (!dbuser?.organizationid || !organization?.docID) {
      return;
    }

    try {
      // Fetch speakers for this organization
      const speakersQuery = query(
        collection(db, "speakers"),
        where("organizationId", "==", organization.docID)
      );

      const unsubscribe = onSnapshot(speakersQuery, (snapshot) => {
        const speakersData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            ...data,
            docID: doc.id,
            name: data.name || "",
            email: data.email || "",
            createdAt: data.createdAt || "",
            status: data.status || "active",
            organizationId: data.organizationId || "",
            lastModifiedSpeakers: data.lastModified || undefined,
          };
        });

        // Store speakers in Redux and local storage
        dispatch(setAdminSpeakers(speakersData as Speaker[]));
        store.setItem("speakers", speakersData);

        // Update last modified timestamp
        if (speakersData.length > 0) {
          const latestModified = Math.max(
            ...speakersData.map((speaker) =>
              speaker.lastModifiedSpeakers
                ? speaker.lastModifiedSpeakers.seconds * 1000 +
                  speaker.lastModifiedSpeakers.nanoseconds / 1000000
                : 0
            )
          );
          setLastModifiedSpeakers(latestModified);
          store.setItem("speakers-lastmodified", latestModified);
        }

        setUpdatingSpeakers(false);
      });

      return unsubscribe;
    } catch (error) {
      console.error("Error fetching speakers data:", error);
      setUpdatingSpeakers(false);
    }
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
