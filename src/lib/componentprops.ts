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
    dbusers: string[]
    docID?: string;
  };
  
  export interface AccountVerifiedProps {
    docID: string;
    verifiedAt: string;
    status: string;
  }