import { Component, ChangeDetectorRef, NgZone, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class Register {
  loading = false;
  form: FormGroup;

  step: 'form' | 'otp' = 'form';

  showPassword = false;
  showConfirmPassword = false;

  otpValues: string[] = ['', '', '', '', '', ''];
  otpError = false;
  otpVerifying = false;
  otpTimer = 0;
  otpInterval: any;

  @ViewChildren('otpBox') otpBoxes!: QueryList<ElementRef>;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      password: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/)
      ]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (!password || !confirmPassword) return null;

    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  startOtpTimer() {
    this.otpTimer = 60;
    clearInterval(this.otpInterval);

    this.zone.runOutsideAngular(() => {
      this.otpInterval = setInterval(() => {
        this.zone.run(() => {
          this.otpTimer--;
          this.cdr.detectChanges();

          if (this.otpTimer <= 0) {
            clearInterval(this.otpInterval);
          }
        });
      }, 1000);
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    this.authService.initRegister(this.form.value).subscribe({
      next: () => {
        this.loading = false;
        this.step = 'otp';
        this.resetOtp();
        this.startOtpTimer();
        this.toastr.success('OTP sent');

        setTimeout(() => {
          this.otpBoxes.toArray()[0]?.nativeElement.focus();
        }, 150);
      },
      error: (err) => {
        this.loading = false;
        const message = err.error?.message || err.error || 'Registration failed';
        this.toastr.error(message);
      }
    });
  }

  resendOtp() {
    if (this.otpTimer > 0) return;

    this.authService.initRegister(this.form.value).subscribe({
      next: () => {
        this.toastr.success('OTP resent');
        this.resetOtp();
        this.startOtpTimer();

        setTimeout(() => {
          this.otpBoxes.toArray()[0]?.nativeElement.focus();
        }, 150);
      },
      error: () => {
        this.toastr.error('Failed to resend OTP');
      }
    });
  }

  get f() {
    return this.form.controls;
  }

  trackByOtpIndex(index: number) {
    return index;
  }

  resetOtp() {
    this.otpValues = ['', '', '', '', '', ''];
    this.otpError = false;

    this.otpBoxes?.toArray().forEach(box => {
      box.nativeElement.value = '';
    });
  }

  onOtpInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const digit = input.value.replace(/\D/g, '').slice(-1);

    input.value = digit;
    this.otpValues[index] = digit;
    this.otpError = false;

    if (digit && index < 5) {
      setTimeout(() => {
        this.otpBoxes.toArray()[index + 1]?.nativeElement.focus();
      });
    }

    if (this.getOtpValue().length === 6) {
      this.verifyOtp();
    }
  }

  onPasteOtp(event: ClipboardEvent) {
    event.preventDefault();

    const pasteData = event.clipboardData?.getData('text') || '';
    const digits = pasteData.replace(/\D/g, '').slice(0, 6);

    if (!digits) return;

    const boxes = this.otpBoxes.toArray();

    for (let i = 0; i < 6; i++) {
      const digit = digits[i] || '';
      this.otpValues[i] = digit;

      if (boxes[i]) {
        boxes[i].nativeElement.value = digit;
      }
    }

    if (digits.length === 6) {
      this.verifyOtp();
    } else {
      boxes[digits.length]?.nativeElement.focus();
    }
  }

  onOtpKeyDown(event: KeyboardEvent, index: number) {
    const input = event.target as HTMLInputElement;
    const boxes = this.otpBoxes.toArray();

    if (event.key === 'Backspace') {
      event.preventDefault();

      if (this.otpValues[index]) {
        this.otpValues[index] = '';
        input.value = '';
        return;
      }

      if (index > 0) {
        this.otpValues[index - 1] = '';
        boxes[index - 1]?.nativeElement.focus();
        boxes[index - 1].nativeElement.value = '';
      }

      return;
    }

    if (
      event.key !== 'Tab' &&
      event.key !== 'ArrowLeft' &&
      event.key !== 'ArrowRight' &&
      !/^\d$/.test(event.key)
    ) {
      event.preventDefault();
    }
  }

  getOtpValue(): string {
    return this.otpValues.join('');
  }

  verifyOtp() {
    const otp = this.getOtpValue();

    if (otp.length < 6) {
      this.triggerOtpError();
      return;
    }

    this.otpVerifying = true;

    this.authService.verifyRegister(this.form.value.email, otp).subscribe({
      next: (res: any) => {
        localStorage.setItem('vt_token', res.token);
        localStorage.setItem('vt_user', JSON.stringify({
          role: res.role,
          name: res.name
        }));

        this.toastr.success('Registration successful');
        this.router.navigate(['/dashboard/student']);
      },
      error: () => {
        this.triggerOtpError();
        this.toastr.error('Invalid OTP');
      },
      complete: () => {
        this.otpVerifying = false;
      }
    });
  }

  triggerOtpError() {
    this.otpError = true;

    this.otpBoxes.toArray().forEach(box => {
      box.nativeElement.classList.add('shake');
      setTimeout(() => {
        box.nativeElement.classList.remove('shake');
      }, 400);
    });
  }
}
