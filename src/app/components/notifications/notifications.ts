import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { NotificationService } from '../../services/notification.service';

type NotificationFilter = 'all' | 'unread' | 'read';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.html',
  styleUrls: ['./notifications.css'],
})
export class NotificationsComponent implements OnInit {
  notifications: any[] = [];
  loading = true;
  saving = false;
  error = '';
  filter: NotificationFilter = 'all';
  notificationsEnabled = true;

  constructor(
    private notificationService: NotificationService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadPreferences();
  }

  loadPreferences(): void {
    this.notificationService.getPreferences().subscribe({
      next: (res: any) => {
        this.notificationsEnabled = res?.data?.notificationsEnabled !== false;
        this.loadNotifications();
      },
      error: () => {
        this.notificationsEnabled = true;
        this.loadNotifications();
      },
    });
  }

  loadNotifications(): void {
    if (!this.notificationsEnabled) {
      this.notifications = [];
      this.loading = false;
      return;
    }

    this.loading = true;
    this.notificationService.getNotifications().subscribe({
      next: (res: any) => {
        this.notifications = res?.data || [];
        this.loading = false;
      },
      error: () => {
        this.error = 'Notifications are unavailable right now.';
        this.notifications = [];
        this.loading = false;
      },
    });
  }

  setFilter(filter: NotificationFilter): void {
    this.filter = filter;
  }

  toggleNotifications(): void {
    if (this.saving) return;

    const nextValue = !this.notificationsEnabled;
    this.saving = true;

    this.notificationService.updatePreferences(nextValue).subscribe({
      next: (res: any) => {
        this.notificationsEnabled = res?.data?.notificationsEnabled !== false;
        this.saving = false;
        this.loadNotifications();
      },
      error: () => {
        this.error = 'Notification preference update failed.';
        this.saving = false;
      },
    });
  }

  openNotification(notification: any): void {
    if (!notification) return;

    if (!notification.read && notification.id) {
      this.notificationService.markRead(notification.id).subscribe({
        next: () => this.loadNotifications(),
        error: () => this.loadNotifications(),
      });
    }

    if (notification.link) {
      this.router.navigate([notification.link]);
    }
  }

  markAllRead(): void {
    const unread = this.notifications.filter((notification) => !notification.read && notification.id);

    if (!unread.length) return;

    forkJoin(unread.map((notification) => this.notificationService.markRead(notification.id)))
      .subscribe({
        next: () => this.loadNotifications(),
        error: () => this.loadNotifications(),
      });
  }

  get filteredNotifications(): any[] {
    if (this.filter === 'unread') {
      return this.notifications.filter((notification) => !notification.read);
    }

    if (this.filter === 'read') {
      return this.notifications.filter((notification) => notification.read);
    }

    return this.notifications;
  }

  get unreadCount(): number {
    return this.notifications.filter((notification) => !notification.read).length;
  }

  get readCount(): number {
    return this.notifications.filter((notification) => notification.read).length;
  }
}
