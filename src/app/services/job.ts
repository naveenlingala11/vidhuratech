import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// ✅ FIXED MODEL (matches backend DTO)
export interface Job {
  id: number;

  title: string;
  role: string;

  companyName: string; // 🔥 FIX (THIS WAS MISSING)

  location: string;
  experience: string;

  jobType: string;
  category: string;
  employmentType: string;

  description: string;
  salary: string;

  skills: string[];

  remote: boolean;

  applyLink: string;
  source: string;

  postedAt: string;
}

export interface PageResponse {
  content: Job[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root',
})
export class JobService {
  private API = `${environment.apiUrl}/jobs`;

  constructor(private http: HttpClient) {}

  getJobs(page = 0): Observable<PageResponse> {
    return this.http.get<PageResponse>(`${this.API}?page=${page}&size=15`);
  }

  getAdvanced(filters: any, page = 0): Observable<PageResponse> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', 15)
      .set('sort', filters.sort || 'latest');

    if (filters.location?.length) {
      filters.location.forEach((l: string) => {
        params = params.append('locations', l);
      });
    }

    if (filters.company?.length) {
      filters.company.forEach((c: string) => {
        params = params.append('companies', c);
      });
    }

    if (filters.skill?.length) {
      filters.skill.forEach((s: string) => {
        params = params.append('skills', s);
      });
    }

    if (filters.experience?.length) {
      params = params.set('experience', filters.experience.join(','));
    }

    if (filters.remote === true) {
      params = params.set('remote', 'true');
    }

    if (filters.date) {
      params = params.set('dateFilter', filters.date);
    }

    // 🔥 ADD THIS
    console.log('🔥 FINAL PARAMS:', params.toString());
    return this.http.get<PageResponse>(`${this.API}/advanced`, { params });
  }

  getById(id: number): Observable<Job> {
    return this.http.get<Job>(`${this.API}/${id}`);
  }

  getFilters(): Observable<any> {
    return this.http.get(`${this.API}/filters`);
  }
}
