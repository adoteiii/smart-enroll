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
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  speaker?: SpeakerComponeentProps;
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
  registeredStudents: StudentComponentProps[];
  attendance: WorkshopAttendance;
}

export interface SpeakerComponeentProps {
  id: string;
  name: string;
  bio?: string;
  email: string;
  phone?: string;
  profileImage?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
}

export interface RegistrationComponentProps {
  id: string;
  student: StudentComponentProps;
  workshopId: string;
  status: "pending" | "confirmed" | "cancelled";
  registeredAt: string;

}

export interface StudentComponentProps {
  id: string;
  name: string;
  email: string;
  phone?: string;
  institution?: string;
  registeredWorkshops: string[];
  registrations: RegistrationComponentProps[];
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
  recentEnrollments: RegistrationComponentProps[];
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

export interface RegistrationData {
  id: string;
  studentId: string;
  workshopId: string;
  registrationDate: string;
  // Add other properties as needed
}

