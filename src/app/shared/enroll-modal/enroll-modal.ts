import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, PLATFORM_ID } from '@angular/core';
import { ModalService } from '../../services/modal';
import { FormsModule } from '@angular/forms';
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
  ) {}

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return; // 🔥 MUST

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
}
