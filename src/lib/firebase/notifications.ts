import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  limit,
  orderBy,
  setDoc,
  WriteBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import dayjs from "dayjs";
import { FirebaseNotification } from "../componentprops";
import { v4 } from "uuid";
import { sendMail, sendMailViaUID } from "../communication/email";
import { sendSMS } from "../communication/sms";

// Notification types
export const NOTIFICATION_TYPES = {
  NEW_REGISTRATION: "new-registration",
  WORKSHOP_REMINDER: "workshop-reminder",
  CAPACITY_ALERT: "capacity-alert",
  FEEDBACK_RECEIVED: "feedback-received",
  APPROVAL_REQUEST: "approval-request",
};

// Notification interface matching the Firestore structure

/**
 * Create a new notification in Firestore
 */
export const createNotification = async (
  notification: Omit<FirebaseNotification, "id" | "read" | "createdAt">,
  batch?: WriteBatch
) => {
  try {
    let id = v4();
    const notificationData = {
      ...notification,
      id,
      read: false,
      createdAt: dayjs().valueOf(),
    };
    if (batch) {
      batch.set(doc(collection(db, "notifications"), id), notificationData);
      return id;
    }
    await setDoc(doc(collection(db, "notifications"), id), notificationData);
    return id;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

/**
 * Mark a notification as read
 */
export const markNotificationAsRead = async (
  notificationId: string,
  uid: string
) => {
  try {
    const notificationRef = doc(db, "notifications", notificationId);
    await updateDoc(notificationRef, { [`viewed.${uid}`]: true });
    return true;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

/**
 * Delete a notification
 */
export const deleteNotification = async (
  notificationId: string,
  uid: string
) => {
  try {
    const notificationRef = doc(db, "notifications", notificationId);
    await updateDoc(notificationRef, { [`deleted.${uid}`]: true });
    return true;
    return true;
  } catch (error) {
    console.error("Error deleting notification:", error);
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
  workshopTitle: string,
  organizationid: string,
  attendee: { name: string; uid: string; email: string; phone?: string },
  workshopDetails: {
    startDate: string | Date;
    endDate?: string | Date;
    location?: string;
    description?: string;
    instructorName?: string;
    virtualMeetingLink?: string;
    requirements?: string;
    contactEmail?: string;
    contactPhone?: string;
    level?: string;
    category?: string;
  },
  batch?: WriteBatch
) => {
  const notification = createNotification(
    {
      organizationId: organizationid,
      viewed: {},
      userId: adminUserId,
      title: "New Registration",
      message: `${studentName} has registered for "${workshopTitle}"`,
      type: NOTIFICATION_TYPES.NEW_REGISTRATION,
      relatedId: workshopId,
      link: `/dashboard/workshops/${workshopId}?tab=registrations`,
      deleted: {},
    },
    batch
  );

  const startDate =
    typeof workshopDetails.startDate === "string"
      ? new Date(workshopDetails.startDate)
      : workshopDetails.startDate;

  const endDate = workshopDetails.endDate
    ? typeof workshopDetails.endDate === "string"
      ? new Date(workshopDetails.endDate)
      : workshopDetails.endDate
    : null;

  const formattedStartDate =
    startDate instanceof Date
      ? startDate.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "Date not available";

  const formattedStartTime =
    startDate instanceof Date
      ? startDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      : "";

  const formattedEndDate =
    endDate instanceof Date
      ? endDate.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "";

  const formattedEndTime =
    endDate instanceof Date
      ? endDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      : "";

  // Shorter date format for SMS
  const shortDate =
    startDate instanceof Date
      ? startDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "Date not available";

  const shortTime =
    startDate instanceof Date
      ? startDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      : "";

  // Send SMS if phone number is available
  if (attendee.phone) {
    try {
      // Create a concise SMS message with essential details
      let smsMessage = `✅ Registration confirmed for: "${workshopTitle}"\n`;
      smsMessage += `📅 ${shortDate} at ${shortTime}\n`;

      if (workshopDetails.location) {
        smsMessage += `📍 ${workshopDetails.location}\n`;
      }

      if (workshopDetails.instructorName) {
        smsMessage += `👨‍🏫 Instructor: ${workshopDetails.instructorName}\n`;
      }

      if (workshopDetails.virtualMeetingLink) {
        smsMessage += `🔗 Join online: ${workshopDetails.virtualMeetingLink}\n`;
      }

      smsMessage += `\nCheck your email for complete details.\n`;

      if (workshopDetails.contactPhone) {
        smsMessage += `Questions? Call ${workshopDetails.contactPhone}`;
      }

      // Send the SMS asynchronously
      sendSMS(attendee.phone, smsMessage);
    } catch (error) {
      console.error("Error sending registration SMS:", error);
      // Continue with email even if SMS fails
    }
  }

  // send email (unchanged)
  sendMail(
    attendee.email,
    `Registration Confirmation: ${workshopTitle}`,
    `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Workshop Registration Confirmation</h2>
        <p style="color: #666;">Dear ${attendee.name},</p>
        <p style="color: #666;">You have successfully registered for the following workshop:</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #4CAF50;">
          <h3 style="color: #333; margin: 0 0 10px 0;">${workshopTitle}</h3>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: bold; width: 120px;">Date:</td>
              <td style="padding: 8px 0; color: #666;">${formattedStartDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: bold;">Time:</td>
              <td style="padding: 8px 0; color: #666;">
                ${formattedStartTime}${
      endDate
        ? ` to ${
            formattedStartDate === formattedEndDate
              ? formattedEndTime
              : `${formattedEndDate} ${formattedEndTime}`
          }`
        : ""
    }
              </td>
            </tr>
            ${
              workshopDetails.location
                ? `
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: bold;">Location:</td>
              <td style="padding: 8px 0; color: #666;">${workshopDetails.location}</td>
            </tr>
            `
                : ""
            }
            ${
              workshopDetails.level
                ? `
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: bold;">Level:</td>
              <td style="padding: 8px 0; color: #666;">${workshopDetails.level}</td>
            </tr>
            `
                : ""
            }
            ${
              workshopDetails.category
                ? `
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: bold;">Category:</td>
              <td style="padding: 8px 0; color: #666;">${workshopDetails.category}</td>
            </tr>
            `
                : ""
            }
            ${
              workshopDetails.instructorName
                ? `
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: bold;">Instructor:</td>
              <td style="padding: 8px 0; color: #666;">${workshopDetails.instructorName}</td>
            </tr>
            `
                : ""
            }
          </table>
        </div>
        
        ${
          workshopDetails.description
            ? `
        <div style="margin: 20px 0;">
          <h4 style="color: #333; margin: 0 0 10px 0;">Workshop Description:</h4>
          <p style="color: #666; line-height: 1.5;">${workshopDetails.description}</p>
        </div>
        `
            : ""
        }
        
        ${
          workshopDetails.virtualMeetingLink
            ? `
        <div style="margin: 20px 0; background-color: #e8f5e9; padding: 15px; border-radius: 5px;">
          <h4 style="color: #2e7d32; margin: 0 0 10px 0;">Virtual Meeting Access:</h4>
          <p style="margin: 0;">
            <a href="${workshopDetails.virtualMeetingLink}" style="color: #2e7d32; font-weight: bold; text-decoration: none;">
              Click here to join the workshop online
            </a>
          </p>
          <p style="color: #666; font-size: 12px; margin-top: 5px;">
            Save this email to access the link when the workshop starts.
          </p>
        </div>
        `
            : ""
        }
        
        ${
          workshopDetails.requirements
            ? `
        <div style="margin: 20px 0;">
          <h4 style="color: #333; margin: 0 0 10px 0;">Workshop Requirements:</h4>
          <p style="color: #666; line-height: 1.5;">${workshopDetails.requirements}</p>
        </div>
        `
            : ""
        }
        
        <div style="margin: 30px 0; padding-top: 15px; border-top: 1px solid #eee;">
          <h4 style="color: #333; margin: 0 0 10px 0;">Need help?</h4>
          ${
            workshopDetails.contactEmail
              ? `
          <p style="color: #666; margin: 5px 0;">
            Email: <a href="mailto:${workshopDetails.contactEmail}" style="color: #4CAF50; text-decoration: none;">${workshopDetails.contactEmail}</a>
          </p>
          `
              : ""
          }
          ${
            workshopDetails.contactPhone
              ? `
          <p style="color: #666; margin: 5px 0;">
            Phone: ${workshopDetails.contactPhone}
          </p>
          `
              : ""
          }
        </div>
        
        <p style="color: #666; margin-top: 30px;">Thank you for using Smart Enroll!</p>
        
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">This is an automated message. Please save or print this confirmation for your records.</p>
      </div>
    `
  );

  // Admin email remains unchanged
  sendMailViaUID(
    adminUserId,
    `New Registration for ${workshopTitle}`,
    `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">New Workshop Registration</h2>
        <p style="color: #666;">A new registration has been received for your workshop.</p>
        <div style="background-color: #f5f5f5; padding: 15px; margin: 15px 0; border-radius: 5px;">
          <h3 style="color: #333; margin: 0;">${workshopTitle}</h3>
          <p style="color: #666; margin: 10px 0 0 0;">Registrant: ${attendee.name}</p>
        </div>
        <p style="color: #666;">You can view the complete registration details on your Smart Enroll dashboard.</p>
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">This is an automated message from Smart Enroll.</p>
      </div>
    `
  );

  return notification;
};

export const createCapacityAlertNotification = async (
  adminUserId: string,
  workshopId: string,
  workshopTitle: string,
  capacityPercentage: number,
  organizationid: string
) => {
  const notification = createNotification({
    userId: adminUserId,
    title: "Workshop Almost Full",
    message: `"${workshopTitle}" has reached ${capacityPercentage}% capacity`,
    type: NOTIFICATION_TYPES.CAPACITY_ALERT,
    relatedId: workshopId,
    link: `/dashboard/workshops/${workshopId}`,
    viewed: {},
    deleted: {},
    organizationId: organizationid,
  });
  // send email
  sendMailViaUID(
    adminUserId,
    `Workshop Capacity Alert: ${workshopTitle}`,
    `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Workshop Capacity Alert</h2>
        <p style="color: #666;">Your workshop is nearing full capacity.</p>
        <div style="background-color: #f5f5f5; padding: 15px; margin: 15px 0; border-radius: 5px;">
          <h3 style="color: #333; margin: 0;">${workshopTitle}</h3>
          <p style="color: #666; margin: 10px 0 0 0;">Current Capacity: ${capacityPercentage}%</p>
        </div>
        <p style="color: #666;">You may want to consider:</p>
        <ul style="color: #666;">
          <li>Increasing the workshop capacity if possible</li>
          <li>Creating a waiting list</li>
          <li>Planning an additional session</li>
        </ul>
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">This is an automated message from Smart Enroll.</p>
      </div>
    `
  );
  return notification;
};

/**
 * Create a workshop reminder notification
 */
export const createWorkshopReminderNotification = async (
  userId: string,
  workshopId: string,
  workshopTitle: string,
  startDate: Date,
  organizationid: string
) => {
  const formattedDate = startDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const notification = createNotification({
    userId,
    title: "Workshop Reminder",
    message: `"${workshopTitle}" starts tomorrow at ${formattedDate}`,
    type: NOTIFICATION_TYPES.WORKSHOP_REMINDER,
    relatedId: workshopId,
    link: `/dashboard/workshops/${workshopId}`,
    viewed: {},
    deleted: {},
    organizationId: organizationid,
  });
  sendMailViaUID(
    userId,
    `Reminder: Your Workshop Tomorrow - ${workshopTitle}`,
    `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Workshop Reminder</h2>
        <p style="color: #666;">Your workshop is scheduled for tomorrow!</p>
        <div style="background-color: #f5f5f5; padding: 15px; margin: 15px 0; border-radius: 5px;">
          <h3 style="color: #333; margin: 0;">${workshopTitle}</h3>
          <p style="color: #666; margin: 10px 0 0 0;">Start Time: ${formattedDate}</p>
        </div>
        <p style="color: #666;">Don't forget to:</p>
        <ul style="color: #666;">
          <li>Review any pre-workshop materials</li>
          <li>Prepare any required equipment or supplies</li>
          <li>Check your calendar and set a reminder</li>
        </ul>
        <p style="color: #666;">You can view the complete workshop details on your Smart Enroll dashboard.</p>
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">This is an automated reminder from Smart Enroll.</p>
      </div>
    `
  );
  return notification;
};

/**
 * Create an approval request notification
 */
export const createApprovalRequestNotification = async (
  adminUserId: string,
  studentName: string,
  workshopId: string,
  workshopTitle: string,
  registrationId: string,
  organizationid: string
) => {
  const notification = createNotification({
    userId: adminUserId,
    title: "Registration Approval Required",
    message: `${studentName} has requested to join "${workshopTitle}"`,
    type: NOTIFICATION_TYPES.APPROVAL_REQUEST,
    relatedId: registrationId,
    link: `/dashboard/workshops/${workshopId}/registrations?pending=true`,
    viewed: {},
    deleted: {},
    organizationId: organizationid,
  });
  sendMailViaUID(
    adminUserId,
    `New Workshop Registration Request - ${workshopTitle}`,
    `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Registration Approval Required</h2>
        <p style="color: #666;">A new registration request requires your approval.</p>
        <div style="background-color: #f5f5f5; padding: 15px; margin: 15px 0; border-radius: 5px;">
          <h3 style="color: #333; margin: 0;">${workshopTitle}</h3>
          <p style="color: #666; margin: 10px 0 0 0;">Requested by: ${studentName}</p>
        </div>
        <p style="color: #666;">Actions needed:</p>
        <ul style="color: #666;">
          <li>Review the registration details</li>
          <li>Approve or decline the request</li>
          <li>Check workshop capacity and requirements</li>
        </ul>
        <p style="color: #666;">You can manage this request through your Smart Enroll dashboard.</p>
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">This is an automated message from Smart Enroll.</p>
      </div>
    `
  );
  return notification;
};

/**
 * Create a feedback notification
 */
export const createFeedbackNotification = async (
  adminUserId: string,
  studentName: string,
  workshopId: string,
  workshopTitle: string,
  organizationid: string
) => {
  const notification = createNotification({
    userId: adminUserId,
    title: "New Feedback Received",
    message: `${studentName} has submitted feedback for "${workshopTitle}"`,
    type: NOTIFICATION_TYPES.FEEDBACK_RECEIVED,
    relatedId: workshopId,
    link: `/dashboard/workshops/${workshopId}/feedback`,
    viewed: {},
    deleted: {},
    organizationId: organizationid,
  });
  sendMailViaUID(
    adminUserId,
    `New Workshop Feedback - ${workshopTitle}`,
    `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">New Workshop Feedback</h2>
        <p style="color: #666;">A participant has submitted feedback for your workshop.</p>
        <div style="background-color: #f5f5f5; padding: 15px; margin: 15px 0; border-radius: 5px;">
          <h3 style="color: #333; margin: 0;">${workshopTitle}</h3>
          <p style="color: #666; margin: 10px 0 0 0;">Feedback from: ${studentName}</p>
        </div>
        <p style="color: #666;">Actions to take:</p>
        <ul style="color: #666;">
          <li>Review the feedback details</li>
          <li>Consider participant suggestions</li>
          <li>Plan any necessary improvements</li>
        </ul>
        <p style="color: #666;">You can view the complete feedback through your Smart Enroll dashboard.</p>
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">This is an automated message from Smart Enroll.</p>
      </div>
    `
  );
  return notification;
};
