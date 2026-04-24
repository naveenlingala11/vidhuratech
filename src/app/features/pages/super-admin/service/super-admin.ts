import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SuperAdminService {

  private API = `${environment.apiUrl}/api/super-admin`;

  constructor(private http: HttpClient) { }

  /* =====================================================
     DASHBOARD
  ===================================================== */

  getDashboardStats() {
    return this.http.get(`${this.API}/dashboard/stats`);
  }

  /* =====================================================
     USER MANAGEMENT
  ===================================================== */

  getUsers(
    page: number = 0,
    size: number = 10,
    search: string = '',
    role: string = '',
    active?: boolean
  ) {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    if (search) params = params.set('search', search);
    if (role) params = params.set('role', role);
    if (active !== undefined) params = params.set('active', active);

    return this.http.get(`${this.API}/users`, { params });
  }

  getUserById(id: number) {
    return this.http.get(`${this.API}/users/${id}`);
  }

  createInternalUser(data: any) {
    return this.http.post(`${this.API}/users`, data);
  }

  updateUser(id: number, data: any) {
    return this.http.put(`${this.API}/users/${id}`, data);
  }

  deleteUser(id: number) {
    return this.http.delete(`${this.API}/users/${id}`);
  }

  toggleUserStatus(id: number) {
    return this.http.patch(`${this.API}/users/${id}/toggle-status`, {});
  }

  resetPassword(id: number, newPassword: string) {
    return this.http.patch(
      `${this.API}/users/${id}/reset-password`,
      { password: newPassword }
    );
  }

  /* =====================================================
     ROLE / PERMISSIONS
  ===================================================== */

  getRoles() {
    return this.http.get(`${this.API}/roles`);
  }

  getPermissions() {
    return this.http.get(`${this.API}/permissions`);
  }

  updatePermissions(role: string, permissions: string[]) {
    return this.http.put(
      `${this.API}/permissions/${role}`,
      { permissions }
    );
  }

  /* =====================================================
     DEPARTMENTS
  ===================================================== */

  getDepartments() {
    return this.http.get(`${this.API}/departments`);
  }

  createDepartment(data: any) {
    return this.http.post(`${this.API}/departments`, data);
  }

  updateDepartment(id: number, data: any) {
    return this.http.put(`${this.API}/departments/${id}`, data);
  }

  deleteDepartment(id: number) {
    return this.http.delete(`${this.API}/departments/${id}`);
  }

  /* =====================================================
     TEAMS
  ===================================================== */

  getTeams() {
    return this.http.get(`${this.API}/teams`);
  }

  createTeam(data: any) {
    return this.http.post(`${this.API}/teams`, data);
  }

  updateTeam(id: number, data: any) {
    return this.http.put(`${this.API}/teams/${id}`, data);
  }

  deleteTeam(id: number) {
    return this.http.delete(`${this.API}/teams/${id}`);
  }

  /* =====================================================
     COURSES
  ===================================================== */

  getCourses() {
    return this.http.get(`${this.API}/courses`);
  }

  createCourse(data: any) {
    return this.http.post(`${this.API}/courses`, data);
  }

  updateCourse(id: number, data: any) {
    return this.http.put(`${this.API}/courses/${id}`, data);
  }

  deleteCourse(id: number) {
    return this.http.delete(`${this.API}/courses/${id}`);
  }

  /* =====================================================
     BATCHES
  ===================================================== */

  getBatches() {
    return this.http.get(`${this.API}/batches`);
  }

  createBatch(data: any) {
    return this.http.post(`${this.API}/batches`, data);
  }

  assignTrainer(batchId: number, trainerId: number) {
    return this.http.patch(
      `${this.API}/batches/${batchId}/assign-trainer`,
      { trainerId }
    );
  }

  /* =====================================================
     REPORTS / AUDIT LOGS
  ===================================================== */

  getAuditLogs(page = 0, size = 20) {
    return this.http.get(
      `${this.API}/audit-logs?page=${page}&size=${size}`
    );
  }

  getReports() {
    return this.http.get(`${this.API}/reports`);
  }

  /* =====================================================
     SYSTEM SETTINGS
  ===================================================== */

  getSettings() {
    return this.http.get(`${this.API}/settings`);
  }

  updateSettings(data: any) {
    return this.http.put(`${this.API}/settings`, data);
  }

  createUser(data: any) {
    return this.http.post(`${this.API}/users`, data);
  }

}