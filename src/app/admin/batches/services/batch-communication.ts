import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
export interface BatchLite {
  id: number;
  name: string;
  whatsappGroupLink?: string;
  zoomJoinLink?: string;
  zoomMeetingId?: string;
  zoomPasscode?: string;
  zoomSchedule?: string;
  zoomTime?: string;
  zoomCalendarLink?: string;
}
export interface BatchCommunicationPayload {
  whatsappGroupLink: string;
  zoomJoinLink: string;
  zoomMeetingId: string;
  zoomPasscode: string;
  zoomSchedule: string;
  zoomTime: string;
  zoomCalendarLink: string;
}
@Injectable({ providedIn: 'root' })
export class BatchCommunicationService {
  private api = `${environment.apiUrl}/api/lms/admin/batches`;
  constructor(private http: HttpClient) { }
  getBatches() { return this.http.get<any[]>(`${this.api}/all-lite`); }
  getBatchById(id: number) { return this.http.get<any>(`${this.api}/${id}/communication`); }
  updateCommunication(id: number, payload: any) { return this.http.put(`${this.api}/${id}/communication`, payload); }
}
