import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../../environments/environment';
import { MentorService } from '../../../services/mentor.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
})
export class Register implements OnDestroy {
  loading = false;
  form: FormGroup;

  step: 'form' | 'otp' | 'success' = 'form';

  showPassword = false;
  showConfirmPassword = false;

  otpValues: string[] = ['', '', '', '', '', ''];
  otpError = false;
  otpVerifying = false;
  otpTimer = 0;
  otpInterval: any;
  githubLoading = false;
  @ViewChildren('otpBox') otpBoxes!: QueryList<ElementRef<HTMLInputElement>>;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone,
    private mentorService: MentorService,
  ) {
    this.form = this.fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(6),
            Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/),
          ],
        ],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator },
    );
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      if (params['code']) {
        this.handleGithubCallback(params['code']);
      }
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      const google = (window as any).google;

      if (!google?.accounts?.id || !environment.googleClientId) {
        return;
      }

      google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: (response: any) => this.handleGoogleCredential(response),
      });

      google.accounts.id.renderButton(document.getElementById('googleRegisterBtn'), {
        theme: 'outline',
        size: 'large',
        width: 320,
        text: 'signup_with',
      });
    }, 500);
  }

  ngOnDestroy() {
    clearInterval(this.otpInterval);
  }

  get f() {
    return this.form.controls;
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

  startGithubRegister() {
    const redirectUri = window.location.origin + '/register';
    const state = crypto.randomUUID();

    sessionStorage.setItem('github_oauth_state', state);

    const url =
      `https://github.com/login/oauth/authorize` +
      `?client_id=${environment.githubClientId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=user:email` +
      `&state=${state}`;

    window.location.href = url;
  }

  handleGithubCallback(code: string) {
    if (this.githubLoading) return;

    this.githubLoading = true;
    const redirectUri = window.location.origin + '/register';

    this.authService.githubLogin(code, redirectUri).subscribe({
      next: () => {
        const user = this.authService.getUser();
        this.toastr.success('Registration successful');
        this.step = 'success';
        setTimeout(() => {
          this.checkAndProcessPendingBooking(user);
        }, 3000);
      },
      error: () => this.toastr.error('GitHub registration failed'),
      complete: () => {
        this.githubLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  handleGoogleCredential(response: any) {
    if (!response?.credential) {
      this.toastr.error('Google registration failed');
      return;
    }

    this.authService.googleLogin(response.credential).subscribe({
      next: () => {
        const user = this.authService.getUser();
        this.toastr.success('Registration successful');
        this.step = 'success';
        setTimeout(() => {
          this.checkAndProcessPendingBooking(user);
        }, 3000);
      },
      error: () => this.toastr.error('Google registration failed'),
    });
  }

  getDashboardRoute(role: string): string {
    const routes: Record<string, string> = {
      STUDENT: '/dashboard/student',
      TRAINER: '/dashboard/trainer',
      ADMIN: '/dashboard/admin',
      HR: '/dashboard/hr',
      MANAGER: '/dashboard/manager',
      SUPER_ADMIN: '/dashboard/super-admin',
      MENTOR: '/dashboard/mentor',
      USER: '/dashboard/user',
    };

    return routes[role] || '/dashboard/user';
  }

  getRedirectRoute(role: string): string {
    const redirect = this.route.snapshot.queryParamMap.get('redirect');

    if (
      redirect &&
      redirect.startsWith('/') &&
      !redirect.startsWith('//') &&
      (redirect.startsWith('/practice') || redirect.startsWith('/coding-contests') || redirect.startsWith('/resume'))
    ) {
      return redirect;
    }
    return this.getDashboardRoute(role);
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    const payload = {
      name: String(this.form.value.name || '').trim(),
      email: String(this.form.value.email || '')
        .trim()
        .toLowerCase(),
      phone: String(this.form.value.phone || '').trim(),
      password: this.form.value.password,
      confirmPassword: this.form.value.confirmPassword,
    };

    this.authService.initRegister(payload).subscribe({
      next: () => {
        this.loading = false;
        this.step = 'otp';
        this.resetOtp();
        this.startOtpTimer();
        this.toastr.success('OTP sent');
        this.focusFirstOtp();
      },
      error: (err) => {
        this.loading = false;
        const message = err.error?.message || err.error || 'Registration failed';
        this.toastr.error(message);
      },
    });
  }

  backToForm() {
    this.step = 'form';
    this.resetOtp();
    clearInterval(this.otpInterval);
    this.otpTimer = 0;
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

  resendOtp() {
    if (this.otpTimer > 0) return;

    this.authService.initRegister(this.form.value).subscribe({
      next: () => {
        this.toastr.success('OTP resent');
        this.resetOtp();
        this.startOtpTimer();
        this.focusFirstOtp();
      },
      error: () => {
        this.toastr.error('Failed to resend OTP');
      },
    });
  }

  trackByOtpIndex(index: number) {
    return index;
  }

  resetOtp() {
    this.otpValues = ['', '', '', '', '', ''];
    this.otpError = false;

    this.otpBoxes?.toArray().forEach((box) => {
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

        if (boxes[index - 1]) {
          boxes[index - 1].nativeElement.value = '';
        }
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
        localStorage.setItem(
          'vt_user',
          JSON.stringify({
            role: res.role,
            name: res.name,
            email: res.email || this.form.value.email,
          }),
        );

        this.toastr.success('Registration successful');
        this.step = 'success';
        const user = this.authService.getUser();
        setTimeout(() => {
          this.checkAndProcessPendingBooking(user);
        }, 3000);
      },
      error: () => {
        this.triggerOtpError();
        this.toastr.error('Invalid OTP');
      },
      complete: () => {
        this.otpVerifying = false;
        this.cdr.detectChanges();
      },
    });
  }

  triggerOtpError() {
    this.otpError = true;

    this.otpBoxes?.toArray().forEach((box) => {
      box.nativeElement.classList.add('shake');
      setTimeout(() => {
        box.nativeElement.classList.remove('shake');
      }, 400);
    });
  }

  focusFirstOtp() {
    setTimeout(() => {
      this.otpBoxes?.toArray()[0]?.nativeElement.focus();
    }, 150);
  }

  checkAndProcessPendingBooking(user: any) {
    const pendingBookingStr = localStorage.getItem('vt_pending_booking');
    if (!pendingBookingStr) {
      this.router.navigateByUrl(this.getRedirectRoute(user?.role || 'STUDENT'));
      return;
    }

    try {
      const pendingBooking = JSON.parse(pendingBookingStr);
      const payload = {
        mentorId: pendingBooking.mentorId,
        topic: pendingBooking.topic,
        message: pendingBooking.message,
        preferredPlan: pendingBooking.preferredPlan
      };

      this.mentorService.createBookingRequest(payload).subscribe({
        next: () => {
          this.toastr.success('Trial booking request registered successfully!');
          localStorage.removeItem('vt_pending_booking');

          // Generate the WhatsApp message text
          const planLabel = pendingBooking.selectedBookingPackage === 'trial' ? 'Direct 1:1 Trial Session' : 'Monthly Retainer package';
          const priceVal = pendingBooking.selectedBookingPackage === 'trial' ? '₹99' : (pendingBooking.pricePerMonth ? `₹${pendingBooking.pricePerMonth}/mo` : '₹3,999/mo');

          let text = `Hello Vidhura Tech Support,\n\n`;
          text += `I just submitted a booking request on the portal for a mediated trial session with mentor *${pendingBooking.mentorName}* under the *${planLabel}* (${priceVal}).\n`;
          text += `*Preferred Slot:* ${pendingBooking.selectedBookingSlot}\n`;
          if (pendingBooking.message && pendingBooking.message.trim()) {
            text += `*My Goals:* ${pendingBooking.message.trim()}\n`;
          }
          text += `\nPlease coordinate the trial session and details. Thanks!`;

          const encodedText = encodeURIComponent(text);
          const supportPhone = '919108057464'; // Official Vidhura Tech Support Number

          // Open WhatsApp link
          window.open(`https://wa.me/${supportPhone}?text=${encodedText}`, '_blank');

          // Redirect user to dashboard
          this.router.navigateByUrl(this.getRedirectRoute(user?.role || 'STUDENT'));
        },
        error: (err) => {
          console.error('Pending booking failed to submit:', err);
          let errMsg = 'Failed to submit the trial request automatically, but your registration is complete.';
          if (err.status === 0) {
            errMsg = 'Connection Error: Cannot contact the server to complete booking request.';
          } else if (err.status === 401 || err.status === 403) {
            errMsg = 'Access Denied: Please make sure you are logged in as a Student to request booking.';
          } else if (err?.error?.message && err.error.message !== 'No message available') {
            errMsg = err.error.message;
          }
          this.toastr.warning(errMsg);

          // Redirect user to dashboard anyway since registration succeeded
          this.router.navigateByUrl(this.getRedirectRoute(user?.role || 'STUDENT'));
        }
      });
    } catch (e) {
      console.error('Error parsing pending booking:', e);
      localStorage.removeItem('vt_pending_booking');
      this.router.navigateByUrl(this.getRedirectRoute(user?.role || 'STUDENT'));
    }
  }
}
