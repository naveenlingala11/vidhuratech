import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";

@Injectable({ providedIn: 'root' })
export class StudentService {

  private api = environment.apiUrl + '/api/student';

  constructor(private http: HttpClient) { }

  getDashboard() {
    return this.http.get(`${this.api}/dashboard`);
  }

  getCourses() {
    return this.http.get(`${this.api}/courses`);
  }

  getAssignments() {
    return this.http.get(`${this.api}/assignments`);
  }

  getCertificates() {
    return this.http.get(`${this.api}/certificates`);
  }

  getCurriculum(batchId: number) {
    return this.http.get(`${this.api}/batches/${batchId}/curriculum`);
  }

}