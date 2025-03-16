import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebase";

export async function isEmailAlreadyRegistered(
  workshopId: string,
  email: string
): Promise<boolean> {
  if (!email || !workshopId) return false;

  try {
    const registrationsQuery = query(
      collection(db, "registrations"),
      where("workshopId", "==", workshopId),
      where("student.email", "==", email.toLowerCase().trim())
    );

    const registrationsSnapshot = await getDocs(registrationsQuery);

    if (!registrationsSnapshot.empty) {
      return true;
    }

    const formDataQuery = query(
      collection(db, "registrations"),
      where("workshopId", "==", workshopId),
      where("formData.email", "==", email.toLowerCase().trim())
    );

    const formDataSnapshot = await getDocs(formDataQuery);

    return !formDataSnapshot.empty;
  } catch (error) {
    console.error("Error checking for duplicate email:", error);
    return false; // In case of error, allow registration to continue
  }
}
