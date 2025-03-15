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
  // const store = localforage.createInstance({
  //   name: "smart-enroll",
  //   version: 2,
  // });

  const workshops = useAppSelector((state) => state.WorkshopReducer.value);

  const dispatch = useDispatch<AppDispatch>();

  // Listen for snapshots
  // useEffect(() => {
  //   if (workshops !== undefined && lastModifiedWorkshop !== undefined) {
  //     setUpdatingWorkshop(false);
  //   }
  // }, [workshops, lastModifiedWorkshop]);

  // Fetch all workshops initially if localforage is empty
  useEffect(() => {
    const workshopQuery = query(
      collection(db, "workshops"),
      // Get all non-deleted workshops
    );
    const unsubscribe = onSnapshot(
      workshopQuery,
      (workshopsSnapshot) => {
        if (workshopsSnapshot.empty) {
          console.log("No workshops found in Firestore");
          dispatch(setWorkshop([]));
          return;
        }

        const workshopsData = workshopsSnapshot.docs.map((doc) => ({
          ...doc.data(),
          docID: doc.id,
          lastModified: {
            seconds: doc.get("lastModified")?.seconds || 0,
            nanoseconds: doc.get("lastModified")?.nanoseconds || 0,
          },
        } as WorkshopComponentProps)).filter((workshop) => !workshop?.deleted); 

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
      },
      (error) => {
        console.error("Error fetching all workshops:", error);
        toast.error("Failed to load workshops");
      }
    );
    return unsubscribe;
  }, []);

  

  return <div className="w-full">{children}</div>;
};

export default WorkshopLayout;
