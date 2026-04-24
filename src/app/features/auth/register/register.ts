import { Component, ChangeDetectorRef, NgZone, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
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

  otpValues: string[] = ['', '', '', '', '', ''];
  otpError = false;
  otpVerifying = false;
  otpTimer = 0;
  otpInterval: any;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {
    this.form = this.fb.group({
      name: ['', [
        Validators.required,
        Validators.minLength(3)
      ]],
      email: ['', [
        Validators.required,
        Validators.email
      ]],
      phone: ['', [
        Validators.required,
        Validators.pattern(/^[6-9]\d{9}$/)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/)
      ]],
      confirmPassword: ['', Validators.required]

    });
  }

  showPassword = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  startOtpTimer() {
    this.otpTimer = 60;

    clearInterval(this.otpInterval);

    this.zone.runOutsideAngular(() => {
      this.otpInterval = setInterval(() => {

        this.zone.run(() => {
          this.otpTimer--;

          this.cdr.detectChanges(); // 🔥 IMPORTANT FIX

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
        this.startOtpTimer();
        this.toastr.success('OTP sent 📩');
      },

      error: (err) => {
        this.loading = false;
        const message = err.error?.message || err.error || 'Failed';
        this.toastr.error(message);
      }

    });
  }

  resendOtp() {

    if (this.otpTimer > 0) return;

    this.authService.initRegister(this.form.value).subscribe({
      next: () => {
        this.toastr.success('OTP resent 🔁');
        this.startOtpTimer();
      },
      error: () => {
        this.toastr.error('Failed to resend OTP');
      }
    });
  }

  get f() {
    return this.form.controls;
  }

  verifyOtp() {

    const otp = this.otpValues.join('');

    if (otp.length < 6) {
      this.otpError = true;
      return;
    }

    this.otpVerifying = true;

    this.authService.verifyRegister(this.form.value.email, otp)
      .subscribe({
        next: (res: any) => {

          localStorage.setItem('vt_token', res.token);
          localStorage.setItem('vt_user', JSON.stringify({
            role: res.role,
            name: res.name
          }));

          this.toastr.success('Registration successful 🚀');

          this.router.navigate(['/dashboard/student']);
        },
        error: () => {
          this.otpError = true;
          this.toastr.error('Invalid OTP');
        },
        complete: () => {
          this.otpVerifying = false;
        }
      });
  }

  @ViewChildren('otpBox') otpBoxes!: QueryList<ElementRef>;

  onOtpInput(event: any, index: number) {

    const value = event.target.value;

    if (!/^[0-9]$/.test(value)) {
      event.target.value = '';
      return;
    }

    this.otpValues[index] = value;

    if (index < 5) {
      this.otpBoxes.toArray()[index + 1].nativeElement.focus();
    }

    this.otpError = false;

    if (this.getOtpValue().length === 6) {
      this.verifyOtp();
    }
  }

  onPasteOtp(event: ClipboardEvent) {

    const pasteData = event.clipboardData?.getData('text');

    if (!pasteData) return;

    const digits = pasteData.replace(/\D/g, '').slice(0, 6);

    if (digits.length !== 6) return;

    digits.split('').forEach((d, i) => {
      this.otpValues[i] = d;
      this.otpBoxes.toArray()[i].nativeElement.value = d;
    });

    this.verifyOtp();
  }

  onOtpKeyDown(event: KeyboardEvent, index: number) {

    if (event.key === 'Backspace') {

      if (!this.otpValues[index] && index > 0) {
        this.otpBoxes.toArray()[index - 1].nativeElement.focus();
      }

      this.otpValues[index] = '';
    }
  }

  getOtpValue(): string {
    return this.otpValues.join('');
  }
}