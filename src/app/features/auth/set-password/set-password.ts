import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-set-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './set-password.html',
  styleUrls: ['./set-password.css']
})
export class SetPassword implements OnInit {

  password = '';
  confirmPassword = '';
  token = '';

  loading = false;
  resendLoading = false;
  error = '';

  passwordVisible = false;
  confirmVisible = false;

  strength = 0;
  strengthText = '';
  strengthClass = '';

  isExpired = false;
  isUsed = false;
  initialized = false;
  checkingToken = true;

  email = '';
  emailSent = false;

  suggestions: string[] = [];

  rules = {
    length: false,
    uppercase: false,
    number: false,
    special: false
  };

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    public router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    this.email = this.route.snapshot.queryParamMap.get('email') || '';

    if (!this.token) {
      this.checkingToken = false;
      this.initialized = false;
      return;
    }

    this.validateToken();
  }

  validateToken() {
    this.checkingToken = true;

    this.http.get(`${environment.apiUrl}/api/auth/validate-token`, {
      params: { token: this.token }
    }).subscribe({
      next: (res: any) => {
        this.checkingToken = false;

        if (res?.used) {
          this.isUsed = true;
          return;
        }

        this.initialized = true;
      },
      error: () => {
        this.checkingToken = false;
        this.isExpired = true;
      }
    });
  }

  submit() {
    this.error = '';

    if (!this.password || this.password.length < 6) {
      this.error = 'Password must be at least 6 characters';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    this.loading = true;

    this.http.post(
      `${environment.apiUrl}/api/auth/set-password`,
      null,
      {
        params: {
          token: this.token,
          password: this.password
        }
      }
    ).subscribe({
      next: () => {
        this.toastr.success('Password set successfully');

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 900);
      },
      error: (err) => {
        const message = err?.error?.message || 'Something went wrong';

        if (message.includes('expired')) {
          this.isExpired = true;
          this.initialized = false;
        } else if (message.includes('used')) {
          this.isUsed = true;
          this.initialized = false;
        } else {
          this.error = message;
        }

        this.loading = false;
      }
    });
  }

  resendLink() {
    if (this.resendLoading) return;

    if (!this.email && !this.token) {
      this.toastr.error('Please enter your email');
      return;
    }

    this.resendLoading = true;

    const body = this.token
      ? { token: this.token }
      : { email: this.email };

    this.http.post(`${environment.apiUrl}/api/auth/resend-link`, body)
      .subscribe({
        next: () => {
          this.emailSent = true;
          this.toastr.success('Password reset link sent to your email');
        },
        error: (err) => {
          this.toastr.error(err?.error?.message || 'Unable to send reset link');
        },
        complete: () => {
          this.resendLoading = false;
        }
      });
  }

  togglePassword() {
    this.passwordVisible = !this.passwordVisible;
  }

  toggleConfirm() {
    this.confirmVisible = !this.confirmVisible;
  }

  checkStrength() {
    const p = this.password || '';

    this.rules.length = p.length >= 6;
    this.rules.uppercase = /[A-Z]/.test(p);
    this.rules.number = /[0-9]/.test(p);
    this.rules.special = /[^A-Za-z0-9]/.test(p);

    const score = Object.values(this.rules).filter(Boolean).length;
    this.strength = score;

    if (!p) {
      this.strengthText = '';
      this.strengthClass = '';
    } else if (score <= 1) {
      this.strengthText = 'Weak';
      this.strengthClass = 'weak';
    } else if (score === 2) {
      this.strengthText = 'Medium';
      this.strengthClass = 'medium';
    } else if (score === 3) {
      this.strengthText = 'Good';
      this.strengthClass = 'good';
    } else {
      this.strengthText = 'Strong';
      this.strengthClass = 'strong';
    }

    this.generateSuggestions();
  }

  generateSuggestions() {
    this.suggestions = [];

    if (!this.password) return;

    if (!this.rules.length) this.suggestions.push('Use at least 6 characters');
    if (!this.rules.uppercase) this.suggestions.push('Add one uppercase letter');
    if (!this.rules.number) this.suggestions.push('Include one number');
    if (!this.rules.special) this.suggestions.push('Add a special character for extra safety');
  }

  get passwordsMatch(): boolean {
    return !!this.confirmPassword && this.password === this.confirmPassword;
  }

  get confirmMismatch(): boolean {
    return !!this.confirmPassword && this.password !== this.confirmPassword;
  }

  get canSubmit(): boolean {
    return this.password.length >= 6 && this.password === this.confirmPassword && !this.loading;
  }
}
