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

    this.modalInstance = new bootstrap.Modal(modalElement);

    this.subscription = this.modalService.modal$.subscribe(() => {
      setTimeout(() => {
        this.modalInstance.show();
      });
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  submitForm() {
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
    const message = `🎓 New Demo Registration

👤 Name: ${this.formData.name}
📞 Phone: ${this.formData.phone}
📧 Email: ${this.formData.email}
📘 Course: ${this.formData.course}
⏰ Batch: ${this.formData.batch}
📍 City: ${this.formData.city}`;

    window.open(`https://wa.me/919108057464?text=${encodeURIComponent(message)}`);
  }
}
