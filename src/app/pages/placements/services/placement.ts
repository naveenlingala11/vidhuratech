import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class PlacementService {
  private API = `${environment.apiUrl}/placements`;
  constructor(private http: HttpClient) {}
  getStats(): Observable<any> {
    return this.http.get(`${this.API}/stats`);
  }
  getRecentPlacements(): Observable<any> {
    return this.http.get(`${this.API}/recent`);
  }
  getCompanies(): Observable<any> {
    return this.http.get(`${this.API}/companies`);
  }
}