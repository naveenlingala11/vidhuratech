import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
@Injectable({ providedIn: 'root' })
export class TrainerInterviewQuestionService {
  private API = `${environment.apiUrl}/api/trainer/interview-questions`;

  constructor(private http: HttpClient) {}

  list() {
    return this.http.get<any>(this.API);
  }

  create(payload: any) {
    return this.http.post<any>(this.API, payload);
  }

  bulk(payload: any[]) {
    return this.http.post<any>(`${this.API}/bulk`, payload);
  }

  update(id: number, payload: any) {
    return this.http.put<any>(`${this.API}/${id}`, payload);
  }

  delete(id: number) {
    return this.http.delete<any>(`${this.API}/${id}`);
  }
}
