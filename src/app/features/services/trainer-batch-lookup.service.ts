import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TrainerBatchLookupService {
  private readonly baseUrl = `${environment.apiUrl}/api/lms/batches`;

  constructor(private http: HttpClient) {}

  getMyBatches() {
    return this.http.get(`${this.baseUrl}/trainer/my`);
  }
}