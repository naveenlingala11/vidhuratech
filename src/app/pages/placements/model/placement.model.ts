export interface PlacementStats {
  studentsPlaced: number;
  hiringCompanies: number;
  successRate: number;
  interviewsScheduled: number;
}

export interface PlacementStudent {
  id: number;
  studentName: string;
  companyName: string;
  role: string;
  packageAmount: string;
  image?: string;
  placedAt: string;
  testimonial?: string;
}

export interface HiringCompany {
  name: string;
  logo?: string;
  openings?: number;
}