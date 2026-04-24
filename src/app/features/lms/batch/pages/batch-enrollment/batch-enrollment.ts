import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BatchEnrollmentService } from '../../services/batch-enrollment';
import { finalize } from 'rxjs/operators';
import { Subject, debounceTime, distinctUntilChanged, switchMap, catchError, of } from 'rxjs';

@Component({
  selector: 'app-batch-enrollment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './batch-enrollment.html',
  styleUrls: ['./batch-enrollment.css']
})
export class BatchEnrollmentComponent implements OnInit {

  batchId!: number;

  batch: any = null;
  enrollments: any[] = [];
  students: any[] = [];

  keyword = '';
  loading = false;

  searchSubject = new Subject<string>();

  constructor(
    private route: ActivatedRoute,
    private service: BatchEnrollmentService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.batchId = Number(this.route.snapshot.paramMap.get('id'));

    this.loadBatch();
    this.loadEnrollments();
    // ✅ SMART SEARCH
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(keyword =>
        this.service.searchStudents(keyword).pipe(
          catchError(() => {
            this.toastr.error('Search failed');
            return of({ data: [] });
          })
        )
      )
    ).subscribe((res: any) => {
      this.students = Array.isArray(res.data)
        ? res.data
        : res.data?.content || [];
    });
  }
  onSearch() {
    if (!this.keyword.trim()) {
      this.students = [];
      return;
    }

    this.searchSubject.next(this.keyword);
  }
  loadBatch() {
    this.service.getBatch(this.batchId)
      .subscribe((res: any) => {
        this.batch = res.data;
        this.cdr.detectChanges(); // ✅ FIX NG0100
      });
  }

  loadEnrollments() {
    this.loading = true;

    this.service.getEnrollments(this.batchId)
      .subscribe({
        next: (res: any) => {
          this.enrollments = res.data || [];
          this.loading = false;   // ✅ move here
        },
        error: () => {
          this.toastr.error('Failed to load enrollments');
          this.loading = false;   // ✅ move here
        }
      });
  }

  searchStudents() {
    if (!this.keyword.trim()) {
      this.students = [];
      return;
    }

    this.service.searchStudents(this.keyword)
      .subscribe((res: any) => this.students = res.data || []);
  }

  enroll(studentId: number) {
    this.service.enrollStudent(this.batchId, studentId)
      .subscribe(() => {
        this.toastr.success('Student enrolled');
        this.students = [];
        this.keyword = '';
        this.loadEnrollments();
      });
  }

  remove(enrollmentId: number) {
    if (!confirm('Remove student from batch?')) return;

    this.service.removeEnrollment(enrollmentId)
      .subscribe(() => {
        this.toastr.success('Enrollment removed');
        this.loadEnrollments();
      });
  }
}