import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-actions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-actions.component.html',
  styleUrls: ['./admin-actions.component.css']
})
export class AdminActionsComponent {

  constructor(private router: Router) { }

  modules = [
    { title: 'Create Employee', route: '/dashboard/admin/create-user', icon: '➕' },
    { title: 'Users', route: '/dashboard/admin/users', icon: '👥' },
    { title: 'Batches', route: '/dashboard/admin/batches', icon: '📚' },
    { title: 'Courses', route: '/dashboard/lms/courses', icon: '📘' },
    { title: 'Create Course', route: 'dashboard/lms/courses/create', icon: '📝' },
    { title: 'Bulk Course Upload', route: '/dashboard/admin/course-bulk', icon: '📦' },
    { title: 'Leads', route: '/admin/leads', icon: '📋' },
    { title: 'Bin', route: '/admin/bin', icon: '🗑️' },
    { title: 'Jobs', route: '/admin/jobs', icon: '💼' },
    { title: 'Companies', route: '/admin/companies', icon: '🏢' },
    { title: 'Certificates', route: '/admin/certificates', icon: '🎓' },
    { title: 'Questions', route: '/admin/questions', icon: '🧠' },
    { title: 'Invoices', route: '/admin/invoice', icon: '🧾' },
    { title: 'Analytics', route: '/invoice-analytics', icon: '📊' }
  ];

  navigate(route: string) {
    this.router.navigate([route]);
  }
}