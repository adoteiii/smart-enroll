import {
  FormField,
  Registration,
  WorkshopComponentProps,
} from "@/lib/componentprops";
import { format } from "date-fns";

// Define an interface for the form data structure
interface FormDataRecord {
  [key: string]: string | string[] | number | boolean | null | undefined;
}

// Helper to format dates consistently
export const formatDate = (date: any, formatStr = "MMM d, yyyy") => {
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

// Helper to safely format values for CSV
const formatForCSV = (value: any): string => {
  if (value === undefined || value === null) return "";

  // Handle arrays (like multi-select checkboxes)
  if (Array.isArray(value)) {
    return `"${value.join(", ").replace(/"/g, '""')}"`;
  }

  // Handle strings and escape quotes
  return `"${String(value).replace(/"/g, '""')}"`;
};

// Get field labels from workshop definitions
export const getFieldLabels = (
  workshops: WorkshopComponentProps[],
  uniqueFieldIds: Set<string>
): Map<string, string> => {
  const labels = new Map<string, string>();

  workshops.forEach((workshop) => {
    if (workshop.customRegistrationFields) {
      workshop.customRegistrationFields.forEach((field) => {
        if (field.id && field.label && uniqueFieldIds.has(field.id)) {
          labels.set(field.id, field.label);
        }
      });
    }
  });

  return labels;
};

// Main export function
export const exportRegistrationsToCSV = (
  registrations: Registration[],
  workshops: WorkshopComponentProps[]
): void => {
  // Skip if no registrations
  if (!registrations.length) return;

  // Get all unique form field IDs across all registrations
  const allFormFields = new Set<string>();
  registrations.forEach((reg) => {
    if (reg.formData) {
      // Double type assertion to safely convert from FormData to FormDataRecord
      const formData = reg.formData as unknown as FormDataRecord;

      Object.keys(formData)
        // Filter out fields that might duplicate basic info
        .filter(
          (key) =>
            !["name", "fullName", "email", "emailAddress"].includes(
              key.toLowerCase()
            )
        )
        .forEach((fieldId) => {
          allFormFields.add(fieldId);
        });
    }
  });

  // Get field labels
  const formFieldLabels = getFieldLabels(workshops, allFormFields);

  // Basic headers that we always include
  const baseHeaders = [
    "Name",
    "Email",
    "Workshop",
    "Workshop Date",
    "Workshop Time",
    "Registered On",
    "Status",
  ];

  // Add form field headers with labels when available
  const formFieldHeaders = Array.from(allFormFields).map(
    (fieldId) => formFieldLabels.get(fieldId) || fieldId
  );

  // Combine headers
  const headers = [...baseHeaders, ...formFieldHeaders];

  // Create rows
  const rows = registrations.map((reg) => {
    // Basic registration data
    const basicData = [
      formatForCSV(reg.student?.name || "Unknown"),
      formatForCSV(reg.student?.email || "No email"),
      formatForCSV(reg.workshop?.title || "Unknown workshop"),
      reg.workshop?.startDate
        ? formatDate(reg.workshop.startDate, "yyyy-MM-dd")
        : "No date",
      reg.workshop?.startDate && reg.workshop?.endDate
        ? `${formatDate(reg.workshop.startDate, "h:mm a")} - ${formatDate(
            reg.workshop.endDate,
            "h:mm a"
          )}`
        : "No time",
      reg.registeredAt
        ? formatDate(reg.registeredAt, "yyyy-MM-dd HH:mm:ss")
        : "Unknown",
      reg.status,
    ];

    // Add form field data
    const formData = Array.from(allFormFields).map((fieldId) => {
      if (reg.formData) {
        // Double type assertion for the formData
        const typedFormData = reg.formData as unknown as FormDataRecord;

        if (typedFormData[fieldId] !== undefined) {
          return formatForCSV(typedFormData[fieldId]);
        }
      }
      return ""; // No value for this field
    });

    return [...basicData, ...formData];
  });

  // Create CSV content
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  // Create and download the file
  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `registrations_${new Date().toISOString().split("T")[0]}.csv`
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
