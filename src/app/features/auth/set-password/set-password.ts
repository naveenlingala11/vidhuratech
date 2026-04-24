import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
  error = '';

  passwordVisible = false;
  confirmVisible = false;
  strength = 0;
  strengthText = '';

  isExpired = false;
  isUsed = false;
  initialized = false;

  suggestions: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    public router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';

    if (!this.token) {
      this.isExpired = true;
      return;
    }

    this.validateToken();
  }

  validateToken() {
    this.http.get(`${environment.apiUrl}/api/auth/validate-token`, {
      params: { token: this.token }
    }).subscribe({
      next: (res: any) => {

        setTimeout(() => {
          if (res.used) {
            this.isUsed = true;
          } else {
            this.initialized = true;
          }
        });

      },
      error: (err) => {

        setTimeout(() => {
          if (err?.error?.message === 'expired') {
            this.isExpired = true;
          } else {
            this.isExpired = true;
          }
        });

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
        }, 1200);

      },
      error: (err) => {

        if (err?.error?.message?.includes('expired')) {
          this.isExpired = true;
        } else if (err?.error?.message?.includes('used')) {
          this.isUsed = true;
        } else {
          this.error = err?.error?.message || 'Something went wrong';
        }

        this.loading = false;
      }
    });
  }

  // 🔐 RESEND LINK
  resendLink() {
    this.http.post(`${environment.apiUrl}/api/auth/resend-link`, {
      token: this.token
    }).subscribe(() => {
      this.toastr.success('New link sent to your email');
    });
  }

  // 👁 TOGGLE
  togglePassword() { this.passwordVisible = !this.passwordVisible; }
  toggleConfirm() { this.confirmVisible = !this.confirmVisible; }

  // 🔐 RULES
  rules = {
    length: false,
    uppercase: false,
    number: false,
    special: false
  };

  checkStrength() {
    const p = this.password;

    this.rules.length = p.length >= 6;
    this.rules.uppercase = /[A-Z]/.test(p);
    this.rules.number = /[0-9]/.test(p);
    this.rules.special = /[^A-Za-z0-9]/.test(p);

    let score = Object.values(this.rules).filter(v => v).length;

    this.strength = score;

    if (score <= 1) this.strengthText = 'Weak';
    else if (score === 2) this.strengthText = 'Medium';
    else this.strengthText = 'Strong';

    this.generateSuggestions();
  }

  // 🧠 AI-LIKE PASSWORD SUGGESTIONS
  generateSuggestions() {
    this.suggestions = [];

    if (!this.rules.uppercase) this.suggestions.push('Add uppercase letter (A-Z)');
    if (!this.rules.number) this.suggestions.push('Include numbers (0-9)');
    if (!this.rules.special) this.suggestions.push('Use special characters (@, #, !)');
    if (!this.rules.length) this.suggestions.push('Minimum 6 characters required');
  }
}