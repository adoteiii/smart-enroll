export interface DBUSER {
  uid: string;
  organizationid?: string;
  email: string;
  displayName: string;
  role: "USER" | "ADMIN";
}

export interface OrganizationSummary {
  revenue: number;
  workshops: number; // number of workshops
  workshopSummary: {
    [workshopid: string]: {
      revenue: number; // in value
      students: number;
    };
  };
  lastModified?: {
    seconds: number;
    nanoseconds: number;
  };
}

export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  uid: string;
}