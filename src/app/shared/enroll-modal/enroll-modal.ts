import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, PLATFORM_ID } from '@angular/core';
import { ModalService } from '../../services/modal';
import { FormsModule } from '@angular/forms';
import { signal } from '@angular/core';
import { interval } from 'rxjs';
import { TimerService } from '../../services/timer';
import { environment } from '../../../environments/environment';
declare var bootstrap: any;

@Component({
  selector: 'app-enroll-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './enroll-modal.html',
  styleUrl: './enroll-modal.css',
})
export class EnrollModal {

  step = 1;
  submitted = false;

  nextStep() {
    if (this.step === 1) {
      if (!this.formData.name || !this.formData.phone) {
        alert('Please fill required fields');
        return;
      }
    }
    this.step++;
  }

  prevStep() {
    this.step--;
  }

  // ✅ KEEPING YOUR ORIGINAL FORM STRUCTURE (UNCHANGED)
  formData = {
    name: '',
    phone: '',
    email: '',
    course: 'Java Full Stack',
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
    private cd: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object,
    public timer: TimerService,
  ) { }

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.timer.startCountdown();

    const modalElement = document.getElementById('enrollModal');
    if (!modalElement) return;

    // ✅ INIT MODAL
    this.modalInstance = new bootstrap.Modal(modalElement);

    // ✅ OPEN MODAL
    this.subscription = this.modalService.modal$.subscribe((payload) => {
      if (payload?.course) {
        this.formData.course = payload.course;
      }

      setTimeout(() => {
        this.modalInstance.show();
      });
    });

    // ✅ AUTO SCROLL FIX
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

  ngOnInit() {
    this.formData.course = '';
    this.resetForm();
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  resetForm(form?: any) {

    this.formData = {
      name: '',
      phone: '',
      email: '',
      course: '',
      experience: '',
      city: '',
      message: '',
    };

    // 🔥 Angular form state reset
    form?.resetForm();

    this.isSubmitting = false;
  }

  submitForm() {

    if (this.isSubmitting) return;

    // ✅ Required
    if (!this.formData.name || !this.formData.phone) {
      alert('Please fill required fields');
      return;
    }

    // ✅ Phone
    if (!/^[6-9][0-9]{9}$/.test(this.formData.phone)) {
      alert('Enter valid mobile number');
      return;
    }

    // ✅ Email
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

        // 🔥 HANDLE BACKEND ERROR MESSAGE
        if (!res.ok) {
          const msg = await res.text();
          throw new Error(msg);
        }

        // ✅ STORE DATA FOR WHATSAPP
        this.lastSubmittedData = { ...this.formData };

        // ✅ Close modal
        this.modalInstance?.hide();

        // ✅ Success popup
        this.submitted = true;
        this.cd.detectChanges();

        // ✅ Reset form
        this.formData = {
          name: '',
          phone: '',
          email: '',
          course: '',
          experience: '',
          city: '',
          message: '',
        };

        setTimeout(() => {
          this.submitted = false;
          this.cd.detectChanges();
        }, 5000);
      })
      .catch((err) => {
        console.error(err);

        // 🔥 SHOW BACKEND MESSAGE (important)
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
