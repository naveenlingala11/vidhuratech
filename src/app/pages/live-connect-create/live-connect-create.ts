import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';

@Component({
  selector: 'app-live-connect-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './live-connect-create.html',
  styleUrl: './live-connect-create.css'
})
export class LiveConnectCreateComponent implements OnInit {
  // Form Bindings
  sessionTitle = '';
  hostName = '';
  hostEmail = '';
  hostRole: 'STUDENT' | 'MENTOR' | 'TRAINER' = 'STUDENT';
  
  // Target Candidate Details (Optional)
  candidateName = '';
  candidateEmail = '';

  // Meeting Parameters
  sessionDuration = 10; // Default 10 mins (Guest limit)
  initialCam = true;
  initialMic = true;
  scratchpadLanguage = 'typescript';
  privacyChecked = false;

  isLoggedIn = false;
  currentUser: any = null;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Check if user is logged in to pre-fill
    const user = this.authService.getUser();
    const hasUser = user && (user.name || user.email || user.role);

    if (hasUser) {
      this.isLoggedIn = true;
      this.currentUser = user;
      this.hostName = user.name || '';
      this.hostEmail = user.email || '';
      this.hostRole = String(user.role || 'STUDENT').toUpperCase() as any;
      this.sessionDuration = 45; // Logged-in free users get 45 mins
    } else {
      this.isLoggedIn = false;
      this.hostRole = 'STUDENT';
      this.sessionDuration = 10; // Guests get 10 mins
    }
  }

  setRole(role: 'STUDENT' | 'MENTOR' | 'TRAINER'): void {
    this.hostRole = role;
  }

  setDuration(duration: number): void {
    this.sessionDuration = duration;
  }

  createSession(): void {
    // Basic validations
    if (!this.sessionTitle.trim()) {
      return;
    }
    if (!this.hostName.trim()) {
      return;
    }
    if (!this.privacyChecked) {
      return;
    }

    // Save temporary details in localStorage so video-meeting component can load them directly
    if (!this.isLoggedIn) {
      localStorage.setItem('vidhuratech_guest_name', this.hostName.trim());
      localStorage.setItem('vidhuratech_guest_role', this.hostRole);
      localStorage.setItem('vidhuratech_guest_email', this.hostEmail.trim());
    } else {
      // Clear legacy guest session properties if logged in
      localStorage.removeItem('vidhuratech_guest_name');
      localStorage.removeItem('vidhuratech_guest_role');
      localStorage.removeItem('vidhuratech_guest_email');
    }

    // Save initial workspace preferences (mic, cam, scratchpad language)
    localStorage.setItem('vidhuratech_session_mic', String(this.initialMic));
    localStorage.setItem('vidhuratech_session_cam', String(this.initialCam));
    localStorage.setItem('vidhuratech_session_language', this.scratchpadLanguage);

    // Generate secure session ID
    const randomId = Math.floor(100000 + Math.random() * 900000);
    const roomName = `VidhuraTech_Mock_Session_${randomId}`;

    // Navigate to call room
    this.router.navigate(['/meeting', roomName]);
  }

  goBack(): void {
    this.router.navigate(['/live-connect']);
  }
}
