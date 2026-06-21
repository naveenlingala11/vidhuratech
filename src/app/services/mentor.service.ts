import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface MentorProfile {
  userId: number;
  name: string;
  email: string;
  phone: string;
  profileImageUrl: string;
  currentCompany: string;
  currentRole: string;
  yearsOfExperience: number;
  biography: string;
  skills: string; // Comma-separated string
  languages: string; // Comma-separated string
  linkedinUrl: string;
  githubUrl: string;
  rating: number;
  reviewsCount: number;
  pricePerHour: number;
  pricePerWeek?: number;
  pricePerMonth?: number;
  availabilityDays?: string;
  availabilitySlots?: string;
  allowDailySessions?: boolean;
  featured: boolean;
  active: boolean;
  identityVerified?: boolean;
  companyVerified?: boolean;
  linkedinVerified?: boolean;
  certVerified?: boolean;
  termsVerified?: boolean;
  verificationDocumentUrl?: string;
  selectedPlanType?: 'trial' | 'monthly';
}

@Injectable({
  providedIn: 'root',
})
export class MentorService {
  private publicAPI = `${environment.apiUrl}/api/public/mentors`;
  private mentorAPI = `${environment.apiUrl}/api/mentor/profile`;
  private adminAPI = `${environment.apiUrl}/api/admin/mentors`;

  constructor(private http: HttpClient) {}

  getPublicMentors(search?: string): Observable<{ success: boolean; data: MentorProfile[] }> {
    let params = new HttpParams();
    if (search) {
      params = params.set('search', search);
    }
    return this.http.get<{ success: boolean; data: MentorProfile[] }>(this.publicAPI, { params });
  }

  getPublicMentorById(userId: number): Observable<{ success: boolean; data: MentorProfile }> {
    return this.http.get<{ success: boolean; data: MentorProfile }>(`${this.publicAPI}/${userId}`);
  }

  getMentorProfile(): Observable<{ success: boolean; data: MentorProfile }> {
    return this.http.get<{ success: boolean; data: MentorProfile }>(this.mentorAPI);
  }

  updateMentorProfile(data: any): Observable<{ success: boolean; data: MentorProfile }> {
    return this.http.put<{ success: boolean; data: MentorProfile }>(this.mentorAPI, data);
  }

  updateMentorStatus(userId: number, active?: boolean, featured?: boolean): Observable<any> {
    let params = new HttpParams();
    if (active !== undefined) {
      params = params.set('active', active.toString());
    }
    if (featured !== undefined) {
      params = params.set('featured', featured.toString());
    }
    return this.http.put(`${this.adminAPI}/${userId}/status`, null, { params });
  }

  getAllMentorsForAdmin(): Observable<{ success: boolean; data: MentorProfile[] }> {
    return this.http.get<{ success: boolean; data: MentorProfile[] }>(this.adminAPI);
  }

  promoteUserToMentor(userId: number): Observable<{ success: boolean; data: MentorProfile }> {
    return this.http.post<{ success: boolean; data: MentorProfile }>(`${this.adminAPI}/${userId}`, null);
  }

  demoteMentor(userId: number): Observable<any> {
    return this.http.delete(`${this.adminAPI}/${userId}`);
  }

  updateMentorVerification(userId: number, request: {
    identityVerified: boolean;
    companyVerified: boolean;
    linkedinVerified: boolean;
    certVerified: boolean;
    termsVerified: boolean;
    verificationDocumentUrl: string;
  }): Observable<{ success: boolean; data: MentorProfile }> {
    return this.http.put<{ success: boolean; data: MentorProfile }>(`${this.adminAPI}/${userId}/verification`, request);
  }

  applyAsMentor(application: any): Observable<{ success: boolean; data: MentorProfile }> {
    return this.http.post<{ success: boolean; data: MentorProfile }>(`${this.publicAPI}/apply`, application);
  }

  getMentorReviews(mentorId: number): Observable<any> {
    return this.http.get<any>(`${this.publicAPI}/${mentorId}/reviews`);
  }

  submitReview(data: { mentorId: number; rating: number; reviewText: string; sessionType: string }): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/api/student/mentors/reviews`, data);
  }

  createBookingRequest(data: { mentorId: number; topic: string; message: string; preferredPlan: string }): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/api/student/mentors/booking-requests`, data);
  }
}
