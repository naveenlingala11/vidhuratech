import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, PLATFORM_ID } from '@angular/core';
import { ModalService } from '../../services/modal';
import { FormsModule } from '@angular/forms';
import { signal } from '@angular/core';
import { interval } from 'rxjs';
declare var bootstrap: any;

@Component({
  selector: 'app-enroll-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './enroll-modal.html',
  styleUrl: './enroll-modal.css',
})
export class EnrollModal {
  days = signal(0);
  hours = signal(0);
  minutes = signal(0);
  seconds = signal(0);

  progress = signal(100);
  seats = signal(25);

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
  ) {}

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.startCountdown(); // ✅ ADD THIS

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
    const url =
      'https://script.google.com/macros/s/AKfycbzOV6HBZGLI-wpoioth6XYR1yVQS7UyosjoutdUzVgy3LgUZ-0_z0mhRUjBmgPUh-AeYQ/exec';

    const formData = new FormData();

    formData.append('name', this.formData.name);
    formData.append('phone', this.formData.phone);
    formData.append('email', this.formData.email);
    formData.append('course', this.formData.course);
    formData.append('experience', this.formData.experience);
    formData.append('batch', this.formData.batch);
    formData.append('city', this.formData.city);
    formData.append('message', this.formData.message);

    fetch(url, {
      method: 'POST',
      body: formData,
      mode: 'no-cors', // ✅ IMPORTANT FIX
    })
      .then(() => {
        this.modalInstance?.hide();
        setTimeout(() => {
          this.submitted = true;
          this.cd.detectChanges(); // 🔥 IMPORTANT

          setTimeout(() => {
            this.submitted = false;
            this.cd.detectChanges();
          }, 5000);
        });
      })
      .catch(() => {
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

  startCountdown() {
    if (!isPlatformBrowser(this.platformId)) return;

    const endTime = new Date('2026-03-27T23:59:59').getTime();
    const totalDuration = endTime - new Date().getTime();

    interval(1000).subscribe(() => {
      const now = new Date().getTime();
      const distance = endTime - now;

      if (distance <= 0) {
        this.days.set(0);
        this.hours.set(0);
        this.minutes.set(0);
        this.seconds.set(0);
        this.progress.set(0);
        return;
      }

      const totalSeconds = Math.floor(distance / 1000);

      const d = Math.floor(totalSeconds / (3600 * 24));
      const h = Math.floor((totalSeconds % (3600 * 24)) / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = totalSeconds % 60;

      this.days.set(d);
      this.hours.set(h);
      this.minutes.set(m);
      this.seconds.set(s);

      // 🔥 progress decreasing
      const progressPercent = (distance / totalDuration) * 100;
      this.progress.set(progressPercent);

      // 🔥 seats decreasing randomly
      if (Math.random() > 0.7 && this.seats() > 5) {
        this.seats.set(this.seats() - 1);
      }
    });
  }
}
