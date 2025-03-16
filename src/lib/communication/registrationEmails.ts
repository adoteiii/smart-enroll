"use client";

import { Registration, WorkshopComponentProps } from "@/lib/componentprops";
import { format } from "date-fns";

// Types for email data
export interface EmailData {
  to: string;
  subject: string;
  html: string;
}

// Generate default email content based on registration status
export function generateEmailTemplate(
  registration: Registration,
  workshop: WorkshopComponentProps | undefined,
  emailType:
    | "confirmation"
    | "reminder"
    | "waitlist"
    | "cancelled"
    | "custom" = "custom"
): EmailData {
  const studentName = registration.student?.name || "Participant";
  const workshopTitle =
    workshop?.title || registration.workshop?.title || "Workshop";
  const workshopDate = registration.workshop?.startDate
    ? formatDate(registration.workshop.startDate, "MMMM d, yyyy")
    : "the scheduled date";
  const workshopTime =
    registration.workshop?.startDate && registration.workshop?.endDate
      ? `${formatDate(
          registration.workshop.startDate,
          "h:mm a"
        )} - ${formatDate(registration.workshop.endDate, "h:mm a")}`
      : "the scheduled time";

  let subject = "";
  let html = "";

  switch (emailType) {
    case "confirmation":
      subject = `Confirmed: Your registration for ${workshopTitle}`;
      html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Registration Confirmed</h2>
          <p>Hello ${studentName},</p>
          <p>Your registration for <strong>${workshopTitle}</strong> has been confirmed!</p>
          
          <div style="margin: 20px 0; padding: 15px; border-left: 4px solid #4CAF50; background-color: #f9f9f9;">
            <p><strong>Workshop:</strong> ${workshopTitle}</p>
            <p><strong>Date:</strong> ${workshopDate}</p>
            <p><strong>Time:</strong> ${workshopTime}</p>
            ${
              workshop?.location
                ? `<p><strong>Location:</strong> ${workshop.location}</p>`
                : ""
            }
          </div>
          
          <p>We look forward to seeing you at the event!</p>
          <p>If you have any questions or need to make changes to your registration, please contact us.</p>
        </div>
      `;
      break;

    case "reminder":
      subject = `Reminder: ${workshopTitle} is coming up`;
      html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Workshop Reminder</h2>
          <p>Hello ${studentName},</p>
          <p>This is a friendly reminder that <strong>${workshopTitle}</strong> is coming up soon.</p>
          
          <div style="margin: 20px 0; padding: 15px; border-left: 4px solid #2196F3; background-color: #f9f9f9;">
            <p><strong>Workshop:</strong> ${workshopTitle}</p>
            <p><strong>Date:</strong> ${workshopDate}</p>
            <p><strong>Time:</strong> ${workshopTime}</p>
            ${
              workshop?.location
                ? `<p><strong>Location:</strong> ${workshop.location}</p>`
                : ""
            }
          </div>
          
          <p>We look forward to seeing you there!</p>
        </div>
      `;
      break;

    case "waitlist":
      subject = `Waitlist Status: ${workshopTitle}`;
      html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Waitlist Status</h2>
          <p>Hello ${studentName},</p>
          <p>This email is regarding your waitlist status for <strong>${workshopTitle}</strong>.</p>
          
          <div style="margin: 20px 0; padding: 15px; border-left: 4px solid #FF9800; background-color: #f9f9f9;">
            <p><strong>Workshop:</strong> ${workshopTitle}</p>
            <p><strong>Date:</strong> ${workshopDate}</p>
            <p><strong>Time:</strong> ${workshopTime}</p>
            <p><strong>Current waitlist position:</strong> #${
              registration.waitlistPosition || "N/A"
            }</p>
          </div>
          
          <p>We will notify you if a spot becomes available.</p>
        </div>
      `;
      break;

    case "cancelled":
      subject = `Cancelled: Your registration for ${workshopTitle}`;
      html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Registration Cancelled</h2>
          <p>Hello ${studentName},</p>
          <p>Your registration for <strong>${workshopTitle}</strong> has been cancelled.</p>
          
          <div style="margin: 20px 0; padding: 15px; border-left: 4px solid #F44336; background-color: #f9f9f9;">
            <p><strong>Workshop:</strong> ${workshopTitle}</p>
            <p><strong>Date:</strong> ${workshopDate}</p>
            <p><strong>Time:</strong> ${workshopTime}</p>
          </div>
          
          <p>If you believe this is in error or have questions, please contact us.</p>
        </div>
      `;
      break;

    case "custom":
    default:
      subject = `Regarding your registration for ${workshopTitle}`;
      html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Workshop Registration</h2>
          <p>Hello ${studentName},</p>
          <p>This message is regarding your registration for <strong>${workshopTitle}</strong>.</p>
          
          <div style="margin: 20px 0; padding: 15px; border-left: 4px solid #9C27B0; background-color: #f9f9f9;">
            <p><strong>Workshop:</strong> ${workshopTitle}</p>
            <p><strong>Date:</strong> ${workshopDate}</p>
            <p><strong>Time:</strong> ${workshopTime}</p>
            <p><strong>Status:</strong> ${
              registration.status.charAt(0).toUpperCase() +
              registration.status.slice(1)
            }</p>
          </div>
          
          <p>If you have any questions about your registration, please contact us.</p>
        </div>
      `;
      break;
  }

  return {
    to: registration.student?.email || "",
    subject,
    html,
  };
}

// Helper function to format dates consistently
const formatDate = (date: any, formatStr = "MMM d, yyyy") => {
  if (!date) return "No date";

  try {
    // Handle Firebase timestamp objects
    if (date && typeof date === "object" && date.seconds) {
      return format(new Date(date.seconds * 1000), formatStr);
    }

    // Handle numeric timestamps
    if (typeof date === "number") {
      return format(new Date(date), formatStr);
    }

    // Handle ISO strings and other date formats
    return format(new Date(date), formatStr);
  } catch {
    return "Invalid date";
  }
};

// Function to send an email via API route
export async function sendRegistrationEmail(
  emailData: EmailData
): Promise<boolean> {
  try {
    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}
