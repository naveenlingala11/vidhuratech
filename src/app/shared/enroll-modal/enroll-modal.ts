import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, PLATFORM_ID } from '@angular/core';
import { ModalService } from '../../services/modal';
import { FormsModule } from '@angular/forms';
import { TimerService } from '../../services/timer';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

declare var bootstrap: any;

@Component({
  selector: 'app-enroll-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './enroll-modal.html',
  styleUrl: './enroll-modal.css',
})
export class EnrollModal {

  step = 1;
  submitted = false;

  liveCourses: any[] = [];
  selectedLiveCourse: any = null;
  requestedCourse = '';

  formData = {
    name: '',
    phone: '',
    email: '',
    course: '',
    experience: '',
    city: '',
    message: '',
  };

  subscription: any;
  isSubmitting = false;
  lastSubmittedData: any = null;
  modalInstance: any;

  constructor(
    private modalService: ModalService,
    private http: HttpClient,
    private cd: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object,
    public timer: TimerService,
  ) { }

  ngOnInit() {
    this.resetForm();
    this.loadLiveCourses();
  }

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.timer.startCountdown();

    const modalElement = document.getElementById('enrollModal');
    if (!modalElement) return;

    this.modalInstance = new bootstrap.Modal(modalElement);

    this.subscription = this.modalService.modal$.subscribe((payload) => {
      this.requestedCourse = payload?.course || '';
      this.pickDefaultCourse();

      setTimeout(() => {
        this.modalInstance.show();
      });
    });

    modalElement.addEventListener('shown.bs.modal', () => {
      const inputs = modalElement.querySelectorAll('input, select, textarea');

      inputs.forEach((el: any) => {
        el.addEventListener('focus', () => {
          setTimeout(() => {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 300);
        });
      });
    });

    modalElement.addEventListener('hidden.bs.modal', () => {
      this.resetForm();
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  loadLiveCourses() {
    this.http.get<any>(`${environment.apiUrl}/api/public/courses`)
      .subscribe({
        next: (res) => {
          const list = res?.data || [];

          if (!list.length) {
            this.liveCourses = [];
            this.pickDefaultCourse();
            return;
          }

          const activeChecks: Observable<any | null>[] = list.map((course: any) =>
            this.http.get<any>(`${environment.apiUrl}/api/lms/batches/course/${course.id}/active`)
              .pipe(
                map(batchRes => ({
                  id: course.id,
                  title: course.title,
                  price: course.price,
                  activeBatch: batchRes?.data || null
                })),
                catchError(() => of(null))
              )
          );

          forkJoin(activeChecks).subscribe((courses: any[]) => {
            this.liveCourses = courses.filter(course =>
              course &&
              course.activeBatch &&
              course.activeBatch.status === 'ACTIVE'
            );

            this.pickDefaultCourse();
          });
        },
        error: () => {
          this.liveCourses = [];
          this.pickDefaultCourse();
        }
      });
  }

  pickDefaultCourse() {
    let match = null;

    if (this.requestedCourse) {
      match = this.liveCourses.find(course =>
        course.title === this.requestedCourse ||
        course.title.toLowerCase().includes(this.requestedCourse.toLowerCase()) ||
        this.requestedCourse.toLowerCase().includes(course.title.toLowerCase())
      );
    }

    this.selectedLiveCourse = match || this.liveCourses[0] || null;
    this.formData.course = this.selectedLiveCourse?.title || '';
    this.cd.detectChanges();
  }

  resetForm(form?: any) {
    this.step = 1;

    this.formData = {
      name: '',
      phone: '',
      email: '',
      course: this.selectedLiveCourse?.title || '',
      experience: '',
      city: '',
      message: '',
    };

    form?.resetForm(this.formData);
    this.isSubmitting = false;
  }

  submitForm() {
    if (this.isSubmitting) return;

    if (!this.selectedLiveCourse) {
      alert('No live course available right now');
      return;
    }

    this.formData.course = this.selectedLiveCourse.title;

    if (!this.formData.name || !this.formData.phone) {
      alert('Please fill required fields');
      return;
    }

    if (!/^[6-9][0-9]{9}$/.test(this.formData.phone)) {
      alert('Enter valid mobile number');
      return;
    }

    if (
      this.formData.email &&
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(this.formData.email)
    ) {
      alert('Enter valid email');
      return;
    }

    this.isSubmitting = true;

    fetch(`${environment.apiUrl}/api/leads/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(this.formData),
    })
      .then(async (res) => {
        if (!res.ok) {
          const msg = await res.text();
          throw new Error(msg);
        }

        this.lastSubmittedData = { ...this.formData };

        this.modalInstance?.hide();

        this.submitted = true;
        this.cd.detectChanges();

        this.resetForm();

        setTimeout(() => {
          this.submitted = false;
          this.cd.detectChanges();
        }, 5000);
      })
      .catch((err) => {
        console.error(err);
        alert(err.message || 'Error submitting form');
      })
      .finally(() => {
        this.isSubmitting = false;
      });
  }

  openWhatsApp() {

    const data = this.lastSubmittedData;

    if (!data) {
      alert('Please submit form first');
      return;
    }

    const message = `👋 Hello Vidhura Tech Team,

I have just registered for a demo class. Here are my details:

👤 Name: ${data.name}
📞 Phone: ${data.phone}
📧 Email: ${data.email}
📘 Course: ${data.course}
📍 City: ${data.city}
📘 Message: ${data.message}

📌 Could you please share more details about the course, schedule, and next steps?

Looking forward to your response 🙂

Thank you!`;

    const url = `https://api.whatsapp.com/send?phone=919108057464&text=${encodeURIComponent(message)}`;

    window.open(url, '_blank');
  }
}
