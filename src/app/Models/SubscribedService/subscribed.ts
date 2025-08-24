export interface ServiceHistoryResponse {
  responseType: string;
  dataContext: any;
  responseCode: number;
  requestedData: any;
  data: ServiceHistoryData;
}

export interface ServiceHistoryData {
  cvAccess: number;
  jobAccess: number;
  fullAccess: number;
  smsAccess: number;
  allPurchase: number;
  allJobs: number;
  restJobs: number;
  allCVs: number;
  restCVs: number;
  serviceHistoryLists: ServiceHistoryItem[];
}

export interface ServiceHistoryItem {
  id: number;
  serviceName: string;
  totalJob: number;
  restJob: number;
  duration: number;
  totalCV: number;
  restCV: number;
  totalPurchased: number;
  restSMS: number;
  isActive: boolean; 
  expireDate: string; 
}

export interface ServiceItem {
  id?: number;
  serviceName: string;
  usage: string;
  expireDate: string;
  subscriptionDuration: string;
  status: 'Active' | 'Expired';
  jobAdsUsed?: number;
  jobAdsTotal?: number;
  cvsUsed?: number;
  cvsTotal?: number;
}

export interface ServiceDetailsResponse {
  responseType: string;
  dataContext: any;
  responseCode: number;
  requestedData: any;
  data: ServiceDetailsData;
}

export interface ServiceDetailsData {
  serviceType: number;
  serviceName: string;
  startingDate: string;
  endingDate: string;
  dayLeft: number;
  servicesDuration: number;
  maxJob: number;
  postedJob: number;
  maxCV: number;
  viewedCV: number;
  maxStandOutJob: number;
  totalStandOutJobPostAfterAccess: number;
  maxPremiumJobs: number;
  totalPremiumJobsPostAfterAccess: number;
}

