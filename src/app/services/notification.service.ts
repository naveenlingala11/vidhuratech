import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private API = `${environment.apiUrl}/api/notifications`;

  constructor(private http: HttpClient) {}

  getNotifications() {
    return this.http.get<any>(this.API);
  }

  getUnreadCount() {
    return this.http.get<any>(`${this.API}/unread-count`);
  }

  markRead(id: number) {
    return this.http.patch<any>(`${this.API}/${id}/read`, {});
  }

  getPreferences() {
    return this.http.get<any>(`${this.API}/preferences`);
  }

  updatePreferences(notificationsEnabled: boolean) {
    return this.http.put<any>(`${this.API}/preferences`, { notificationsEnabled });
  }
}
