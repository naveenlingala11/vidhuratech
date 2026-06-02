import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AdminPlanAccessService {
  private readonly accessApi = `${environment.apiUrl}/api/admin/plan-access`;
  private readonly commercialApi = `${environment.apiUrl}/api/admin/commercial-control`;

  constructor(private http: HttpClient) {}

  list(search = ''): Observable<any> {
    let params = new HttpParams();

    if (search.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http.get<any>(this.accessApi, { params });
  }

  grant(payload: any): Observable<any> {
    return this.http.post<any>(this.accessApi, payload);
  }

  update(id: number, payload: any): Observable<any> {
    return this.http.put<any>(`${this.accessApi}/${id}`, payload);
  }

  revoke(id: number): Observable<any> {
    return this.http.patch<any>(`${this.accessApi}/${id}/revoke`, {});
  }

  people(search = ''): Observable<any> {
    let params = new HttpParams();

    if (search.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http.get<any>(`${this.commercialApi}/people`, { params });
  }

  pricing(): Observable<any> {
    return this.http.get<any>(`${this.commercialApi}/pricing`);
  }

  updatePricing(planCode: string, payload: any): Observable<any> {
    const code = encodeURIComponent(String(planCode || '').trim());
    return this.http.put<any>(`${this.commercialApi}/pricing/${code}`, payload);
  }

  discounts(): Observable<any> {
    return this.http.get<any>(`${this.commercialApi}/discounts`);
  }

  saveDiscount(payload: any): Observable<any> {
    return this.http.post<any>(`${this.commercialApi}/discounts`, payload);
  }

  projectControls(): Observable<any> {
    return this.http.get<any>(`${this.commercialApi}/project-controls`);
  }

  updateProjectControl(controlKey: string, payload: any): Observable<any> {
    const key = encodeURIComponent(String(controlKey || '').trim());
    return this.http.put<any>(`${this.commercialApi}/project-controls/${key}`, payload);
  }
}
