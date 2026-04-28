import {
  Component,
  ChangeDetectorRef,
  ElementRef,
  ViewChild,
  ViewChildren,
  QueryList,
  NgZone
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  loading = false;
  form: FormGroup;
  activeTab: 'password' | 'otp' = 'password';

  showPassword = false;
  otpLoading = false;
  otpTimer = 0;
  interval: any;
  otpEmail = '';

  otpValues: string[] = ['', '', '', '', '', ''];
  otpError = false;
  otpVerifying = false;

  @ViewChild('otpInput') otpInputRef!: ElementRef;
  @ViewChildren('otpBox') otpBoxes!: QueryList<ElementRef>;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private ngZone: NgZone
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['email']) {
        this.form.patchValue({ email: params['email'] });
        this.otpEmail = params['email'];
      }
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  switchTab(tab: 'password' | 'otp') {
    this.activeTab = tab;
    this.otpError = false;

    if (tab === 'otp' && this.form.value.email && !this.otpEmail) {
      this.otpEmail = this.form.value.email;
    }
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
    if (!this.otpEmail) {
      this.toastr.error('Enter email first');
      return;
    }

    if (this.otpTimer > 0) return;

    this.otpLoading = true;

    fetch(`${environment.apiUrl}/api/auth/send-otp?email=${this.otpEmail}`, {
      method: 'POST'
    })
      .then(() => {
        this.toastr.success('OTP sent to email');
        this.resetOtp();
        this.startTimer();

        setTimeout(() => {
          this.otpBoxes.toArray()[0]?.nativeElement.focus();
        }, 150);
      })
      .catch(() => {
        this.toastr.error('Failed to send OTP');
      })
      .finally(() => {
        this.otpLoading = false;
      });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    this.authService.login(this.form.value).subscribe({
      next: () => {
        const user = this.authService.getUser();
        const redirect = this.route.snapshot.queryParamMap.get('redirect');

        this.toastr.success('Login successful');

        this.router.navigateByUrl(
          redirect || this.getDashboardRoute(user.role)
        );
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Invalid credentials');
        this.loading = false;
        this.cdr.detectChanges();
      },
      complete: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
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
      MENTOR: '/dashboard/mentor'
    };

    return routes[role] || '/dashboard/student';
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
    const finalOtp = this.getOtpValue();

    if (finalOtp.length < 6) {
      this.triggerOtpError();
      return;
    }

    this.otpVerifying = true;

    fetch(`${environment.apiUrl}/api/auth/verify-otp?email=${this.otpEmail}&otp=${finalOtp}`, {
      method: 'POST'
    })
      .then(async res => {
        if (!res.ok) {
          throw new Error(await res.text());
        }

        return res.json();
      })
      .then((res: any) => {
        this.otpError = false;

        localStorage.setItem('vt_token', res.token);
        localStorage.setItem('vt_user', JSON.stringify({
          role: res.role,
          name: res.name
        }));

        this.toastr.success('Login successful');
        this.router.navigate(['/dashboard/student']);
      })
      .catch(() => {
        this.triggerOtpError();
        this.toastr.error('Invalid OTP');
      })
      .finally(() => {
        this.otpVerifying = false;
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

  goToForgot() {
    this.router.navigate(['/set-password'], {
      queryParams: { email: this.form.value.email || this.otpEmail || '' }
    });
  }

}
