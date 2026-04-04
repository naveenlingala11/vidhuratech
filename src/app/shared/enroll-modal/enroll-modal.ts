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
    batch: '',
    city: '',
    message: '',
  };

  subscription: any;

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
    this.subscription = this.modalService.modal$.subscribe(() => {
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
  }

  ngOnInit() {
    this.formData.course = ''; // 🔥 important
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  submitForm() {
    // ✅ Phone validation
    if (!/^[6-9][0-9]{9}$/.test(this.formData.phone)) {
      alert('Enter valid mobile number');
      return;
    }

    // ✅ Email validation (optional)
    if (this.formData.email &&
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(this.formData.email)) {
      alert('Enter valid email');
      return;
    }
    fetch(`${environment.apiUrl}/api/leads/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(this.formData),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed');

        this.modalInstance?.hide();

        this.submitted = true;
        this.cd.detectChanges();

        setTimeout(() => {
          this.submitted = false;
          this.cd.detectChanges();
        }, 5000);
      })
      .catch((err) => {
        console.error(err);
        alert('Error submitting form');
      });
  }
  openWhatsApp() {

    const message = `👋 Hello Vidhura Tech Team,

      I have just registered for a demo class. Here are my details:

      👤 Name: ${this.formData.name}
      📞 Phone: ${this.formData.phone}
      📧 Email: ${this.formData.email}
      📘 Course: ${this.formData.course}
      ⏰ Batch: ${this.formData.batch}
      📍 City: ${this.formData.city}

      📌 Could you please share more details about the course, schedule, and next steps?

      Looking forward to your response 🙂

      Thank you!`;

    const url = `https://api.whatsapp.com/send?phone=919108057464&text=${encodeURIComponent(message)}`;

    window.open(url, '_blank');
  }
}
