import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  Timestamp, 
  query, 
  where, 
  getDocs, 
  limit,
  orderBy 
} from "firebase/firestore";
import { db } from "./firebase";

// Notification types
export const NOTIFICATION_TYPES = {
  NEW_REGISTRATION: "new-registration",
  WORKSHOP_REMINDER: "workshop-reminder",
  CAPACITY_ALERT: "capacity-alert",
  FEEDBACK_RECEIVED: "feedback-received", 
  APPROVAL_REQUEST: "approval-request"
};

// Notification interface matching the Firestore structure
export interface FirebaseNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  link?: string;
  relatedId?: string; // Workshop ID, registration ID, etc.
  createdAt: Timestamp;
}

/**
 * Create a new notification in Firestore
 */
export const createNotification = async (notification: Omit<FirebaseNotification, 'id' | 'read' | 'createdAt'>) => {
  try {
    const notificationData = {
      ...notification,
      read: false,
      createdAt: Timestamp.now()
    };
    
    const docRef = await addDoc(collection(db, "notifications"), notificationData);
    return docRef.id;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

/**
 * Mark a notification as read
 */
export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const notificationRef = doc(db, "notifications", notificationId);
    await updateDoc(notificationRef, {
      read: true
    });
    return true;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

/**
 * Delete a notification
 */
export const deleteNotification = async (notificationId: string) => {
  try {
    const notificationRef = doc(db, "notifications", notificationId);
    await deleteDoc(notificationRef);
    return true;
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
};

/**
 * Get recent unread notifications for a user
 */
export const getUnreadNotifications = async (userId: string, count = 5) => {
  try {
    const notificationsRef = collection(db, "notifications");
    const q = query(
      notificationsRef,
      where("userId", "==", userId),
      where("read", "==", false),
      orderBy("createdAt", "desc"),
      limit(count)
    );
    
    const querySnapshot = await getDocs(q);
    const notifications: FirebaseNotification[] = [];
    
    querySnapshot.forEach((doc) => {
      notifications.push({
        id: doc.id,
        ...doc.data()
      } as FirebaseNotification);
    });
    
    return notifications;
  } catch (error) {
    console.error("Error getting unread notifications:", error);
    throw error;
  }
};

/**
 * Create a workshop registration notification
 */
export const createRegistrationNotification = async (
  adminUserId: string,
  studentName: string,
  workshopId: string,
  workshopTitle: string
) => {
  return createNotification({
    userId: adminUserId,
    title: "New Registration",
    message: `${studentName} has registered for "${workshopTitle}"`,
    type: NOTIFICATION_TYPES.NEW_REGISTRATION,
    relatedId: workshopId,
    link: `/dashboard/workshops/${workshopId}/registrations`
  });
};

/**
 * Create a capacity alert notification
 */
export const createCapacityAlertNotification = async (
  adminUserId: string,
  workshopId: string,
  workshopTitle: string,
  capacityPercentage: number
) => {
  return createNotification({
    userId: adminUserId,
    title: "Workshop Almost Full",
    message: `"${workshopTitle}" has reached ${capacityPercentage}% capacity`,
    type: NOTIFICATION_TYPES.CAPACITY_ALERT,
    relatedId: workshopId,
    link: `/dashboard/workshops/${workshopId}`
  });
};

/**
 * Create a workshop reminder notification
 */
export const createWorkshopReminderNotification = async (
  userId: string,
  workshopId: string,
  workshopTitle: string,
  startDate: Date
) => {
  const formattedDate = startDate.toLocaleDateString("en-US", {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  return createNotification({
    userId,
    title: "Workshop Reminder",
    message: `"${workshopTitle}" starts tomorrow at ${formattedDate}`,
    type: NOTIFICATION_TYPES.WORKSHOP_REMINDER,
    relatedId: workshopId,
    link: `/dashboard/workshops/${workshopId}`
  });
};

/**
 * Create an approval request notification
 */
export const createApprovalRequestNotification = async (
  adminUserId: string,
  studentName: string,
  workshopId: string,
  workshopTitle: string,
  registrationId: string
) => {
  return createNotification({
    userId: adminUserId,
    title: "Registration Approval Required",
    message: `${studentName} has requested to join "${workshopTitle}"`,
    type: NOTIFICATION_TYPES.APPROVAL_REQUEST,
    relatedId: registrationId,
    link: `/dashboard/workshops/${workshopId}/registrations?pending=true`
  });
};

/**
 * Create a feedback notification
 */
export const createFeedbackNotification = async (
  adminUserId: string,
  studentName: string,
  workshopId: string,
  workshopTitle: string
) => {
  return createNotification({
    userId: adminUserId,
    title: "New Feedback Received",
    message: `${studentName} has submitted feedback for "${workshopTitle}"`,
    type: NOTIFICATION_TYPES.FEEDBACK_RECEIVED,
    relatedId: workshopId,
    link: `/dashboard/workshops/${workshopId}/feedback`
  });
};