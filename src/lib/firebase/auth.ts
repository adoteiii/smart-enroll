import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged as _onAuthStateChanged,
  signInWithEmailAndPassword as _signInWithEmailAndPassword,
  createUserWithEmailAndPassword as _createUserWithEmailAndPassword,
  sendEmailVerification,
  deleteUser,
  User,
  sendPasswordResetEmail as _sendPasswordResetEmail,
  UserCredential,
  updateProfile,
} from "firebase/auth";
import { Credentials } from "../authtype";
// Get the firebase auth jwt
import { firebaseAuth as auth, db } from "./firebase";
import { collection, doc, getDoc } from "firebase/firestore";
import { DBUSER } from "../types";
import { writeToDoc } from "./firestore";
import { getDBUserFromServer, getDBUserFromServerEmail } from "./server";

export function onAuthStateChanged(cb: any) {
  return _onAuthStateChanged(auth, cb);
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();

  try {
    await signInWithPopup(auth, provider).then((u) => {
      console.log("user", u);
      getDoc(doc(collection(db, "dbuser"), u.user.uid))
        .then((du) => {
          let dbuser = du.exists()?du.data() as DBUSER:null
          console.log(dbuser, "dbuser");
          if (!dbuser) {
            const newDbuser: DBUSER = {
              uid: u.user.uid,
              email: u.user.email || "",
              displayName: u.user.displayName || "",
              role: "USER"
            };
            writeToDoc("dbuser", u.user.uid, newDbuser)
              .then(() => {})
              .catch(async () => {
                await signOut();
              });
          }
          return true;
        })
        .catch(async (error: any) => {
          // console.log("Error signing in with google")

          return {
            error: error?.message,
          };
        });
    });
    return true;
  } catch (error:any){
    console.log("Error signing in with google")
    return {
        error: error?.message
    }
  }
}

export async function signInWithEmailAndPassword(credentials: Credentials) {
  try {
    // console.log("Signing in with ", credentials);
    await _signInWithEmailAndPassword(
      auth,
      credentials.email || "",
      credentials.password || ""
    );
    return true;
  } catch (error:any){
    console.log("error signing in with email and password")
    return {
        error: error?.message
    }
  }
}

export async function signOut() {
  try {
    auth.signOut();
    return true;
  } catch (error:any){
    console.log('Error signing out')
    return {
        error: error?.message
    }
  }
}

export async function createUserWithEmailAndPassword(credentials: Credentials, update?: { displayName?: string }) {
  try {
    const dbuserInit = await getDBUserFromServerEmail(credentials.email);
    console.log("dbuserInit", dbuserInit);
    if (dbuserInit) {
      return {
        error: "User already exists",
      };
    }
    let userCred: UserCredential;
    try {
      userCred = await _createUserWithEmailAndPassword(
        auth,
        credentials.email.trim(),
        credentials.password
      );
      if (update) {
        if (update.displayName) {
          updateProfile(userCred.user, {
            displayName: update.displayName,
          });
        }
      }
    } catch (error: any) {
      // already exists but no user data. Try signing in.
      userCred = await _signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );
    }
    const dbuser = await getDBUserFromServer(userCred.user.uid);
    if (!dbuser) {
      const newDbuser: DBUSER = {
        uid: userCred.user.uid,
        email: userCred.user.email || "",
        displayName: userCred.user.displayName || "",
        role: "USER",
      };
      try {
        await writeToDoc("users", userCred.user.uid, newDbuser);
        sendEmailVerification(userCred.user);
      } catch {
        await signOut();
        throw new Error("Error creating user in database");
      }
    }
  } catch (error:any){
    return {
        error: error?.message
    }
  }
}

export async function sendPasswordResetEmail(email: string) {
  try {
    await _sendPasswordResetEmail(auth, email);
  } catch (error:any){
    return {
        error: error?.message
    }
  }
}


export async function deleteAccount(currentUser:User) {
    try {
        await deleteUser(currentUser)
    } catch (error:any){
        return {
            error: error?.message
        }
    }
}

export async function sendEmailVerificationLink(user: User){
  await sendEmailVerification(user);
}