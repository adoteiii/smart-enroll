"use client";

import React from "react";
import { useState, useEffect } from "react";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { useDispatch } from "react-redux";
import { setWorkshop } from "@/redux/features/workshopSlice";
import { WorkshopComponentProps } from "@/lib/componentprops";
import dayjs from "dayjs";
import {
  collection,
  onSnapshot,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { toast } from "sonner";
import localforage from "localforage";

const WorkshopLayout = ({ children }: { children: React.ReactNode }) => {
  const store = localforage.createInstance({
    name: "smart-enroll",
    version: 2,
  });

  const workshops = useAppSelector((state) => state.WorkshopReducer.value);

  const [updatingWorkshop, setUpdatingWorkshop] = useState(true);
  const [lastModifiedWorkshop, setLastModifiedWorkshop] = useState<
    number | undefined
  >(undefined);
  const dispatch = useDispatch<AppDispatch>();

  // Listen for snapshots
  useEffect(() => {
    if (workshops !== undefined && lastModifiedWorkshop !== undefined) {
      setUpdatingWorkshop(false);
    }
  }, [workshops, lastModifiedWorkshop]);

  // Fetch all workshops initially if localforage is empty
  useEffect(() => {
    async function fetchAllWorkshops() {
      try {
        const workshopQuery = query(
          collection(db, "workshops"),
          where("deleted", "!=", true) // Get all non-deleted workshops
        );

        const workshopDocs = await getDocs(workshopQuery);

        if (workshopDocs.empty) {
          console.log("No workshops found in Firestore");
          dispatch(setWorkshop([]));
          return;
        }

        const workshopsData = workshopDocs.docs.map((doc) => ({
          ...doc.data(),
          docID: doc.id,
          lastModified: {
            seconds: doc.get("lastModified")?.seconds || 0,
            nanoseconds: doc.get("lastModified")?.nanoseconds || 0,
          },
        })) as WorkshopComponentProps[];

        console.log(
          "Initial Firestore fetch found workshops:",
          workshopsData.length
        );

        // Sort by last modified
        const sortedWorkshops = workshopsData.sort(
          (a, b) => b.lastModified?.seconds - a.lastModified?.seconds
        );

        // Store in Redux
        dispatch(setWorkshop(sortedWorkshops));

        // Save to localforage
        store.setItem("workshops", sortedWorkshops);

        // Set last modified timestamp
        if (sortedWorkshops.length > 0) {
          const latestTs = Math.floor(
            sortedWorkshops[0].lastModified.seconds * 1000 +
              sortedWorkshops[0].lastModified.nanoseconds / 1000000
          );
          store.setItem("workshop-lastmodified", latestTs);
          setLastModifiedWorkshop(latestTs);
        }
      } catch (error) {
        console.error("Error fetching all workshops:", error);
        toast.error("Failed to load workshops");
      }
    }

    // Initial load of workshops from localforage
    store
      .getItem("workshops")
      .then((workshopStorage: any) => {
        if (!workshopStorage || workshopStorage.length === 0) {
          // No locally stored workshops, fetch from Firestore
          console.log("No workshops in localforage, fetching from Firestore");
          fetchAllWorkshops();
        } else {
          // Use stored workshops
          console.log(
            "Using stored workshops from localforage:",
            workshopStorage.length
          );
          dispatch(setWorkshop(workshopStorage));

          store
            .getItem("workshop-lastmodified")
            .then((lastmodified: any) => {
              setLastModifiedWorkshop(lastmodified || 0);
            })
            .catch(() => {
              // Default to 0 if no last modified timestamp
              setLastModifiedWorkshop(0);
            });
        }
      })
      .catch(() => {
        // Error with localforage, fetch from Firestore
        console.log("Error accessing localforage, fetching from Firestore");
        fetchAllWorkshops();
      });
  }, [dispatch]);

  // Listen for updates to workshops
  useEffect(() => {
    if (updatingWorkshop) {
      // Don't do anything while updating
      return;
    }

    if (lastModifiedWorkshop === undefined) {
      return;
    }

    const ref = collection(db, "workshops");
    const ts = dayjs(lastModifiedWorkshop || 0).toDate();
    console.log("Workshop listener timestamp:", ts);

    const q = query(
      ref,
      where("lastModified", ">", ts),
      // Add filter for non-deleted workshops
      where("deleted", "!=", true)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log(
          "Workshop snapshot received:",
          snapshot.docs.length,
          "documents"
        );

        // Store in local storage the last timestamp
        // Merge results
        let data: WorkshopComponentProps[] = [];
        snapshot.docs.forEach((doc) => {
          data.push({
            ...doc.data(),
            docID: doc.id,
            lastModified: {
              seconds: doc.get("lastModified")?.seconds,
              nanoseconds: doc.get("lastModified")?.nanoseconds,
            },
          } as WorkshopComponentProps);
        });

        if (data === null || data === undefined) {
          return;
        }

        data = data?.sort(
          (a, b) => b.lastModified?.seconds - a.lastModified?.seconds
        );

        if (!data || data.length === 0) {
          return;
        }

        setUpdatingWorkshop(true);
        store.getItem("workshops").then((workshopStorage: any) => {
          let datamerged: WorkshopComponentProps[] = [];
          workshopStorage?.forEach((d: WorkshopComponentProps) => {
            datamerged.push(d);
          });

          let indexValue: any = {};
          datamerged.forEach((d, idx) => {
            indexValue[d.id] = idx;
          });

          data.forEach((result) => {
            if (indexValue[result.id] === undefined) {
              datamerged.push(result);
            } else {
              console.log("Updating existing workshop...", result);
              datamerged[indexValue[result.id]] = result;
            }
          });

          setLastModifiedWorkshop(undefined);
          store
            .setItem("workshops", datamerged)
            .then(() => {
              store.getItem("workshops").then((workshops: any) => {
                dispatch(setWorkshop(workshops || []));
              });

              const ts = Math.floor(
                data?.[0]?.lastModified.seconds * 1000 +
                  data?.[0].lastModified.nanoseconds / 1000000
              );

              store.setItem("workshop-lastmodified", ts).then(() => {
                setLastModifiedWorkshop(ts);
              });
            })
            .catch(() => setUpdatingWorkshop(false));
        });
      },
      (e) => {
        console.error("Workshop query error:", e.message);
        toast.error("Failed to load workshop updates");
      }
    );

    return unsubscribe;
  }, [lastModifiedWorkshop, updatingWorkshop, dispatch]);

  return <div className="w-full">{children}</div>;
};

export default WorkshopLayout;
