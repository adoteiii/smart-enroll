export interface DBUSER {
  uid: string;
  organizationid?: string;
  email: string;
  displayName: string;
  role: "USER" | "ADMIN";
}



