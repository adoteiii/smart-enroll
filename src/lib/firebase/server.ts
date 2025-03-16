"use server";

import { cert } from "firebase-admin/app";
import { getApps, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

import { collection, getDocs, query, where } from "firebase/firestore";
import { DBUSER, OrganizationSummary } from "../types";
import { AccountVerifiedProps, OrganizationFormData } from "../componentprops";

var credentials = {
  type: process.env.ADMIN_TYPE,
  project_id: process.env.ADMIN_PROJECT_ID,
  private_key_id: process.env.ADMIN_PRIVATE_KEY_ID,
  private_key: process.env.ADMIN_PRIVATE_KEY,
  client_email: process.env.ADMIN_CLIENT_EMAIL,
  client_id: process.env.ADMIN_CLIENT_ID,
  auth_uri: process.env.ADMIN_AUTH_URI,
  token_uri: process.env.ADMIN_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.ADMIN_AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: process.env.ADMIN_CLIENT_CERT_URL,
  universe_domain: process.env.ADMIN_UNIVERSE_DOMAIN,
};

const apps = getApps();
const serverapps = apps.filter((item) =>
  item.name === "[DEFAULT]" ? true : false
);
if (!serverapps.length) {
  initializeApp({
    credential: cert(credentials as any),
  });
} else {
  // console.log("Already init");
}

const db = getFirestore();

export async function existsDocServer(
  collectionName: string,
  documentName: string
) {
  return (await db.collection(collectionName).doc(documentName).get()).exists;
}

export async function createOrganization(formData: OrganizationFormData) {
  try {
    const organizationRef = db.collection("organization").doc();
    await organizationRef.set(formData);
    return organizationRef.id;
  } catch (error) {
    console.error("Error creating organization:", error);
    return "";
  }
}

export async function getOrganization(uid: string) {
  try {
    console.log("org", uid);
    const organizationRef = db.collection("organization").doc(uid);
    const snapshot = await organizationRef.get();
    if (snapshot.exists) {
      return snapshot.data() as OrganizationFormData;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting organization:", error);
    return null;
  }
}

export async function getDBUserFromServer(uid: string) {
  const user = await db.collection("dbuser").doc(uid).get();
  console.log("user", user);
  if (!user.exists) {
    return null;
  }
  return user.data() as DBUSER;
}

export async function getDBUserFromServerEmail(email: string) {
  const user = await db
    .collection("dbuser")
    .where("email", "==", email.trim())
    .get();
  console.log(user.empty, user.docs);
  if (user.empty) {
    return null;
  }
  return user.docs[0].data() as DBUSER;
}

export async function updateMessageStatus(messageId: string, deleted: boolean) {
  try {
    const messageRef = db.collection("messages").doc(messageId);
    await messageRef.update({ deleted });
  } catch (error) {
    console.error("Error updating message status:", error);
  }
}

export async function createAccountVerification(data: AccountVerifiedProps) {
  try {
    const verificationRef = db.collection("accountVerifications").doc();
    await verificationRef.set(data);
    return verificationRef.id;
  } catch (error) {
    console.error("Error creating account verification:", error);
    return "";
  }
}

export async function getAccountVerification(uid: string) {
  try {
    const verificationRef = db.collection("accountVerifications").doc(uid);
    const verificationDoc = await verificationRef.get();
    if (verificationDoc.exists) {
      return verificationDoc.data() as AccountVerifiedProps;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting account verification:", error);
    return null;
  }
}

export async function MakeAdmin(uid: string) {
  const userRef = db.collection("dbuser").doc(uid);
  await userRef.update({ role: "ADMIN" });
}

export async function initializeOrganizationSummary(
  summaryName: string,
  organizationID: string
) {
  await db
    .collection(summaryName)
    .doc(organizationID)
    .set({
      revenue: 0,
      workshops: 0,
      workshopSummary: {},
      lastModified: FieldValue.serverTimestamp() as unknown as {
        seconds: number;
        nanoseconds: number;
      },
    } as OrganizationSummary);
}
