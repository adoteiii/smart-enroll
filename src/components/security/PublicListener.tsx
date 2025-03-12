"use client";

import { db } from "@/lib/firebase/firebase";
import { DBUSER } from "@/lib/types";
import { Context } from "@/lib/userContext";
import { setDBUser } from "@/redux/features/dbuserSlice";
import { AppDispatch } from "@/redux/store";
import { collection, doc, onSnapshot } from "firebase/firestore";
import React, { useContext, useEffect } from "react";
import { useDispatch } from "react-redux";

function PublicListener() {
  const { user, loading } = useContext(Context);
  const dispatch = useDispatch<AppDispatch>()

  // DB USER LISTENER FOR ALL USERS
  // DIFFERENTIATE ROLES ACCROSS APPLICATION
  useEffect(() => {
    if (loading) {
      return;
    }
    if (user === null && !loading) {
      return;
    }
    const unsubscribe = onSnapshot(
      doc(collection(db, "dbuser"), user?.uid),
      (doc) => {
        console.log('doc dbuser', doc.data());
        if (!doc.exists()) {
          dispatch(setDBUser(null));
          return;
        }

        dispatch(setDBUser(doc.data() as DBUSER));
      }
    );
    return unsubscribe;
  }, [user, loading]);

  return <></>;
}

export default PublicListener;
