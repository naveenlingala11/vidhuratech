import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MentorChatService, ChatMessage } from '../../../services/mentor-chat.service';
import { AuthService } from '../../../features/auth/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-mentor-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mentor-chat.html',
  styleUrls: ['./mentor-chat.css']
})
export class MentorChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('scrollContainer') private scrollContainer?: ElementRef;

  relationId!: number;
  currentUser: any = null;
  recipientName = '';
  recipientAvatar = '';
  recipientRole = '';
  messages: ChatMessage[] = [];
  newMessageText = '';
  loading = true;
  sending = false;

  private pollSubscription?: Subscription;
  private shouldScrollToBottom = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private chatService: MentorChatService,
    private authService: AuthService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getUser();

    this.route.paramMap.subscribe(params => {
      const idParam = params.get('relationId');
      if (idParam) {
        this.relationId = +idParam;
        this.loadChatHistory(true);
        this.startPolling();
      } else {
        this.toastr.error('Invalid relationship ID');
        this.goBack();
      }
    });
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  loadChatHistory(isInitial = false): void {
    if (isInitial) {
      this.loading = true;
    }
    this.chatService.getChatHistory(this.relationId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const d = res.data;
          this.recipientName = d.recipientName;
          this.recipientAvatar = d.recipientAvatar;
          this.recipientRole = d.recipientRole;

          const oldLength = this.messages.length;
          this.messages = d.messages || [];

          if (isInitial || this.messages.length > oldLength) {
            this.shouldScrollToBottom = true;
          }
        }
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        console.error('Error fetching chat history', err);
        if (isInitial) {
          this.toastr.error('Could not load chat history. Please verify your relationship.');
          this.goBack();
        }
      }
    });
  }

  startPolling(): void {
    this.stopPolling();
    this.pollSubscription = interval(5000).subscribe(() => {
      this.loadChatHistory(false);
    });
  }

  stopPolling(): void {
    if (this.pollSubscription) {
      this.pollSubscription.unsubscribe();
      this.pollSubscription = undefined;
    }
  }

  sendMessage(): void {
    const text = this.newMessageText.trim();
    if (!text) return;

    this.sending = true;
    this.chatService.sendMessage(this.relationId, text).subscribe({
      next: (res) => {
        this.sending = false;
        if (res.success && res.data) {
          this.messages.push(res.data);
          this.newMessageText = '';
          this.shouldScrollToBottom = true;
        }
      },
      error: (err) => {
        this.sending = false;
        this.toastr.error(err.error?.message || 'Failed to send message');
      }
    });
  }

  private scrollToBottom(): void {
    try {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.warn('Scroll to bottom failed', err);
    }
  }

  goBack(): void {
    const role = this.currentUser?.role;
    if (role === 'MENTOR') {
      this.router.navigate(['/dashboard/mentor/mentees']);
    } else {
      this.router.navigate(['/dashboard/student/my-mentors']);
    }
  }

  isMyMessage(msg: ChatMessage): boolean {
    return msg.senderId === this.currentUser?.id;
  }

  formatTime(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  }
}
