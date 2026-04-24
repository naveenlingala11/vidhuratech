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
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
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
  styleUrls: ['./login.css']
})
export class Login {

  loading = false;
  form: FormGroup;
  activeTab: 'password' | 'otp' = 'password';

  otpLoading = false;
  otpTimer = 0;
  interval: any;
  otpEmail = '';
  otp = '';

  otpArray = new Array(6);
  otpValues: string[] = ['', '', '', '', '', ''];
  otpError = false;
  otpVerifying = false;

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
      }
    });
  }

  startTimer() {
    this.otpTimer = 30;

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
        this.toastr.success('OTP sent to email 📩');
        this.startTimer();
      })
      .catch(() => {
        this.toastr.error('Failed to send OTP');
      })
      .finally(() => {
        setTimeout(() => {
          this.otpLoading = false;
        });
      });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    this.authService.login(this.form.value).subscribe({
      next: (res: any) => {

        const user = this.authService.getUser();

        const redirect =
          this.route.snapshot.queryParamMap.get('redirect');

        this.toastr.success('Login Successful');

        // ✅ EXISTING LOGIC (UNCHANGED)
        this.router.navigateByUrl(
          redirect || this.getDashboardRoute(user.role)
        );
      },

      error: (err) => {
        this.toastr.error(err.error?.message || 'Invalid Credentials');
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

  @ViewChild('otpInput') otpInputRef!: ElementRef;

  focusOtp() {
    setTimeout(() => {
      this.otpInputRef?.nativeElement.focus();
    }, 200);
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

    // ✅ AUTO SUBMIT
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

    const boxes = this.otpBoxes.toArray();

    boxes.forEach(box => {
      box.nativeElement.classList.add('shake');
      setTimeout(() => {
        box.nativeElement.classList.remove('shake');
      }, 400);
    });
  }

  goToForgot() {
    this.router.navigate(['/set-password'], {
      queryParams: { email: this.form.value.email }
    });
  }
}