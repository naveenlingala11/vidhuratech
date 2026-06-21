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
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login implements OnDestroy {
  loading = false;
  form: FormGroup;

  activeTab: 'password' | 'otp' | 'phone' = 'password';
  showPassword = false;

  otpLoading = false;
  otpTimer = 0;
  interval: any;
  otpEmail = '';
  otpValues: string[] = ['', '', '', '', '', ''];
  otpError = false;
  otpVerifying = false;

  phoneNumber = '';
  phoneOtpSent = false;
  phoneOtpLoading = false;
  phoneOtpVerifying = false;

  alreadyLoggedIn = false;
  currentUser: any = null;
  loginError = '';

  githubLoading = false;

  @ViewChildren('otpBox') otpBoxes!: QueryList<ElementRef<HTMLInputElement>>;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private ngZone: NgZone,
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    this.checkExistingLogin();

    this.route.queryParams.subscribe((params) => {
      if (params['email']) {
        this.form.patchValue({ email: params['email'] });
        this.otpEmail = params['email'];
      }

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

      google.accounts.id.renderButton(document.getElementById('googleLoginBtn'), {
        theme: 'outline',
        size: 'large',
        width: 320,
      });
    }, 500);
  }

  ngOnDestroy() {
    clearInterval(this.interval);
  }

  get f() {
    return this.form.controls;
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  switchTab(tab: 'password' | 'otp' | 'phone') {
    this.activeTab = tab;
    this.otpError = false;
    this.resetOtp();

    if (tab === 'otp' && this.form.value.email && !this.otpEmail) {
      this.otpEmail = this.form.value.email;
    }
  }

  checkExistingLogin(): void {
    this.alreadyLoggedIn = this.authService.isLoggedIn();
    this.currentUser = this.alreadyLoggedIn ? this.authService.getUser() : null;

    if (this.alreadyLoggedIn) {
      this.loginError =
        'You are already logged in. Please logout current user before logging in again.';
    }
  }

  logoutCurrentUser(): void {
    this.authService.logout();

    this.alreadyLoggedIn = false;
    this.currentUser = null;
    this.loginError = '';

    this.form.reset();
    this.otpEmail = '';
    this.phoneNumber = '';
    this.phoneOtpSent = false;
    this.resetOtp();

    this.toastr.success('Current user logged out. You can login now.');
  }

  submit() {
    this.loginError = '';

    if (this.alreadyLoggedIn) {
      this.loginError = 'Please logout current user before logging in with another account.';
      this.toastr.warning(this.loginError);
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    this.authService.login(this.form.value).subscribe({
      next: () => {
        const user = this.authService.getUser();
        this.toastr.success('Login successful');
        this.router.navigateByUrl(this.getPostLoginRoute(user));
      },
      error: (err) => {
        if (err.status === 401) {
          this.loginError = 'Invalid email or password';
        } else if (err.status === 404) {
          this.loginError = 'Account not found';
        } else if (err.status === 403) {
          this.loginError = 'Account inactive';
        } else if (err.status === 500) {
          this.loginError = 'Server error. Please try again';
        } else {
          this.loginError = err.error?.message || 'Login failed';
        }

        this.toastr.error(this.loginError);
        this.loading = false;
        this.cdr.detectChanges();
      },
      complete: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  startTimer() {
    this.otpTimer = 30;
    clearInterval(this.interval);

    this.ngZone.runOutsideAngular(() => {
      this.interval = setInterval(() => {
        this.ngZone.run(() => {
          this.otpTimer--;
          this.cdr.detectChanges();

          if (this.otpTimer <= 0) {
            clearInterval(this.interval);
          }
        });
      }, 1000);
    });
  }

  sendOtp() {
    if (this.alreadyLoggedIn) {
      this.toastr.warning('Please logout current user before requesting OTP.');
      return;
    }

    if (!this.otpEmail || !/^\S+@\S+\.\S+$/.test(this.otpEmail)) {
      this.toastr.error('Enter valid email first');
      return;
    }

    if (this.otpTimer > 0) return;

    this.otpLoading = true;

    fetch(`${environment.apiUrl}/api/auth/send-otp?email=${encodeURIComponent(this.otpEmail)}`, {
      method: 'POST',
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed');
        }

        this.toastr.success('OTP sent to email');
        this.resetOtp();
        this.startTimer();
        this.focusFirstOtp();
      })
      .catch(() => {
        this.toastr.error('Failed to send OTP');
      })
      .finally(() => {
        this.otpLoading = false;
        this.cdr.detectChanges();
      });
  }

  verifyOtp() {
    if (this.alreadyLoggedIn) {
      this.toastr.warning('Please logout current user before logging in with OTP.');
      return;
    }

    if (this.activeTab !== 'otp') return;

    const finalOtp = this.getOtpValue();

    if (finalOtp.length < 6) {
      this.triggerOtpError();
      return;
    }

    this.otpVerifying = true;

    fetch(
      `${environment.apiUrl}/api/auth/verify-otp?email=${encodeURIComponent(this.otpEmail)}&otp=${encodeURIComponent(finalOtp)}`,
      { method: 'POST' },
    )
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(await res.text());
        }

        return res.json();
      })
      .then((res: any) => {
        this.otpError = false;
        this.authService.completeLoginFromResponse(res);

        const user = this.authService.getUser();
        this.toastr.success('Login successful');
        this.router.navigateByUrl(this.getPostLoginRoute(user));
      })
      .catch(() => {
        this.triggerOtpError();
        this.toastr.error('Invalid OTP');
      })
      .finally(() => {
        this.otpVerifying = false;
        this.cdr.detectChanges();
      });
  }

  sendPhoneOtp() {
    if (this.alreadyLoggedIn) {
      this.toastr.warning('Please logout current user before requesting OTP.');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(this.phoneNumber)) {
      this.toastr.error('Enter valid 10-digit mobile number');
      return;
    }

    this.phoneOtpLoading = true;

    this.authService.sendPhoneOtp(this.phoneNumber).subscribe({
      next: () => {
        this.phoneOtpSent = true;
        this.resetOtp();
        this.toastr.success('OTP sent to mobile');
        this.focusFirstOtp();
      },
      error: () => this.toastr.error('Failed to send phone OTP'),
      complete: () => {
        this.phoneOtpLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  verifyPhoneOtp() {
    if (this.alreadyLoggedIn) {
      this.toastr.warning('Please logout current user before logging in with OTP.');
      return;
    }

    if (this.activeTab !== 'phone') return;

    const otp = this.getOtpValue();

    if (otp.length < 6) {
      this.triggerOtpError();
      return;
    }

    this.phoneOtpVerifying = true;

    this.authService.verifyPhoneOtp(this.phoneNumber, otp).subscribe({
      next: () => {
        const user = this.authService.getUser();
        this.toastr.success('Login successful');
        this.router.navigateByUrl(this.getPostLoginRoute(user));
      },
      error: () => {
        this.triggerOtpError();
        this.toastr.error('Invalid OTP');
      },
      complete: () => {
        this.phoneOtpVerifying = false;
        this.cdr.detectChanges();
      },
    });
  }

  startGithubLogin() {
    if (this.alreadyLoggedIn) {
      this.toastr.warning('Please logout current user before GitHub login.');
      return;
    }

    const redirectUri = window.location.origin + '/login';
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
    const redirectUri = window.location.origin + '/login';

    this.authService.githubLogin(code, redirectUri).subscribe({
      next: () => {
        const user = this.authService.getUser();
        this.toastr.success('GitHub login successful');
        this.router.navigateByUrl(this.getPostLoginRoute(user));
      },
      error: () => this.toastr.error('GitHub login failed'),
      complete: () => {
        this.githubLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  handleGoogleCredential(response: any) {
    if (this.alreadyLoggedIn) {
      this.toastr.warning('Please logout current user before Google login.');
      return;
    }

    if (!response?.credential) {
      this.toastr.error('Google login failed');
      return;
    }

    this.authService.googleLogin(response.credential).subscribe({
      next: () => {
        const user = this.authService.getUser();
        this.toastr.success('Google login successful');
        this.router.navigateByUrl(this.getPostLoginRoute(user));
      },
      error: () => this.toastr.error('Google login failed'),
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
      if (this.activeTab === 'otp') {
        this.verifyOtp();
      }

      if (this.activeTab === 'phone') {
        this.verifyPhoneOtp();
      }
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
      if (this.activeTab === 'otp') {
        this.verifyOtp();
      }

      if (this.activeTab === 'phone') {
        this.verifyPhoneOtp();
      }
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

  goToForgot() {
    this.router.navigate(['/set-password'], {
      queryParams: { email: this.form.value.email || this.otpEmail || '' },
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
    };

    return routes[role] || '/dashboard/student';
  }

  private getPostLoginRoute(user: any): string {
    const savedPublicRedirect = sessionStorage.getItem('publicPracticeRedirect');

    if (
      savedPublicRedirect &&
      savedPublicRedirect.startsWith('/') &&
      !savedPublicRedirect.startsWith('//') &&
      (savedPublicRedirect.startsWith('/practice') ||
        savedPublicRedirect.startsWith('/coding-contests') ||
        savedPublicRedirect.startsWith('/resume'))
    ) {
      sessionStorage.removeItem('publicPracticeRedirect');
      return savedPublicRedirect;
    }

    const redirect = this.route.snapshot.queryParamMap.get('redirect');

    if (
      redirect &&
      redirect.startsWith('/') &&
      !redirect.startsWith('//') &&
      (redirect.startsWith('/practice') || redirect.startsWith('/coding-contests') || redirect.startsWith('/resume'))
    ) {
      return redirect;
    }

    return this.getDashboardRoute(user?.role);
  }
}
