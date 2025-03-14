export type OrganizationFormData = {
  logoUrl: string;
  logoFileName: string;
  name: string;
  phone: string;
  digitalAddress: string;
  country: string;
  dateSubmitted: number;
  creator: string;
  customRate: number;
  dbusers: string[];
  docID?: string;
};

export interface AccountVerifiedProps {
  docID: string;
  verifiedAt: string;
  status: string;
}

export interface WorkshopComponentProps {
  creator: string;
  docID: string;
  id: string;
  title: string;
  description: string;
  startDate: any;
  endDate: any;
  location: string;
  capacity: number;
  workshopImage: Array<string>;
  registeredCount: number;
  status: "upcoming" | "ongoing" | "completed" | "cancelled"| "draft";
  speaker?: Speaker;
  createdAt: string;
  updatedAt: string;
  lastModified: { seconds: number; nanoseconds: number };
  timestamp: number; 
  deleted?: boolean;
  isFree: boolean; 
  price?: number;
  organization: string;
  organization_name: string;
  organization_photo?: string;
  organization_address: string;
  organization_phone: string;
  registeredStudents: Student[];
  attendance: WorkshopAttendance;
  category: string;
  level: string;
  sendNotifications: boolean;
  requireApproval: boolean;
  enableWaitlist: boolean;
  waitlistCount: number;
  waitlist: Registration[];
  registrationCloses: string;
  additionalInformation: string;
  customRegistrationFields?: FormField[];
  useDefaultRegistrationFields?: boolean;
}

export interface Speaker {
  docID: string;
  name: string;
  email: string;
  expertise?: string;
  bio?: string;
  profileImage?: string;
  organization?: string;
  createdAt: string;
  updatedAt?: string;
  status: "active" | "pending" | "inactive";
  workshops?: number; // Count of workshops
  organizationId: string;
  lastModified?: {
    seconds: number;
    nanoseconds: number;
  }
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: FieldOption[]; // For select, checkbox, radio
  description?: string;
  defaultValue?: string;
  
}

export type FieldOption = 
  | string 
  | { value: string; label: string };



export type FieldType =
  | "text"
  | "email"
  | "phone"
  | "number"
  | "textarea"
  | "select"
  | "checkbox"
  | "radio"
  | "date";

export interface Student {
  docID: string;
  name: string;
  email: string;
  profileImage?: string;
  uid: string;
  organization?: string;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "superadmin" | "event_manager";
  permissions: string[]; // ["create_workshop", "edit_workshop", "manage_registrations"]
}

export interface Notification {
  id: string;
  type: "email" | "sms" | "system";
  recipientId: string;
  message: string;
  status: "sent" | "pending" | "failed";
  createdAt: string;
}

export interface AIQuery {
  id: string;
  question: string;
  response: string;
  createdAt: string;
}

export interface DashboardStats {
  totalRegistrations: number;
  totalWorkshops: number;
  upcomingWorkshops: number;
  recentEnrollments: Registration[];
}

export interface DashboardStats {
  totalRegistrations: number;
  registrationTrend: number;
  activeWorkshops: {
    count: number;
    startingSoon: number;
  };
  upcomingEvents: {
    count: number;
    nextEventDays: number | null;
  };
  attendanceRate: {
    average: number;
    trend: number;
  };
  popularWorkshops: {
    id: string;
    title: string;
    enrollmentRate: number;
  }[];
  recentRegistrations: {
    id: string;
    studentName: string;
    studentAvatar: string | null;
    workshopTitle: string;
    date: string;
  }[];
  registrationTrends: {
    date: string;
    value: number;
  }[];
}

// Also consider adding these types for better type safety:

export interface WorkshopAttendance {
  attended: number;
  total: number;
}

export interface Registration {
  docID: string;
  studentId: string;
  workshopId: string;
  status: "confirmed" | "pending" | "cancelled" | "waitlist";
  registeredAt: string;
  timestamp: number;
  notes?: string;
  waitlistPosition?: number;
  student?: {
    name: string;
    email: string;
    profileImage?: string;
  };
  workshop?: {
    title: string;
    startDate: string;
    endDate: string;
  };
  updatedAt: string;
  formData: FormData;
}

