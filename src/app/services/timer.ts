import { Injectable, signal } from '@angular/core';
import { interval, Subscription } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TimerService {
  days = signal(0);
  hours = signal(0);
  minutes = signal(0);
  seconds = signal(0);
  progress = signal(100);
  seats = signal(25);
  expired = signal(false);

  private timerSub?: Subscription;
  private targetTime = 0;
  private totalDuration = 1;
  private lastSeatUpdateHour = new Date().getHours();

  startCountdown(startDate?: string | Date | null): void {
    this.stopCountdown();

    const targetDate = this.getTargetDate(startDate);

    if (!targetDate) {
      this.resetTimer();
      return;
    }

    this.targetTime = targetDate.getTime();
    this.totalDuration = Math.max(this.targetTime - Date.now(), 1);
    this.expired.set(false);

    this.updateCountdown();

    this.timerSub = interval(1000).subscribe(() => {
      this.updateCountdown();
      this.reduceSeatHourly();
    });
  }

  stopCountdown(): void {
    this.timerSub?.unsubscribe();
    this.timerSub = undefined;
  }

  private updateCountdown(): void {
    const distance = this.targetTime - Date.now();

    if (!Number.isFinite(this.targetTime) || distance <= 0) {
      this.days.set(0);
      this.hours.set(0);
      this.minutes.set(0);
      this.seconds.set(0);
      this.progress.set(0);
      this.expired.set(true);
      this.stopCountdown();
      return;
    }

    const totalSeconds = Math.floor(distance / 1000);

    this.days.set(Math.floor(totalSeconds / 86400));
    this.hours.set(Math.floor((totalSeconds % 86400) / 3600));
    this.minutes.set(Math.floor((totalSeconds % 3600) / 60));
    this.seconds.set(totalSeconds % 60);
    this.progress.set(Math.max(0, Math.min(100, (distance / this.totalDuration) * 100)));
  }

  private getTargetDate(startDate?: string | Date | null): Date | null {
    if (!startDate) return null;

    if (startDate instanceof Date) {
      return Number.isNaN(startDate.getTime()) ? null : startDate;
    }

    const value = String(startDate).trim();
    if (!value) return null;

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [year, month, day] = value.split('-').map(Number);
      return new Date(year, month - 1, day, 19, 30, 0, 0);
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  private reduceSeatHourly(): void {
    const currentHour = new Date().getHours();

    if (currentHour !== this.lastSeatUpdateHour) {
      this.lastSeatUpdateHour = currentHour;

      if (this.seats() > 0) {
        this.seats.set(this.seats() - 1);
      }
    }
  }

  private resetTimer(): void {
    this.days.set(0);
    this.hours.set(0);
    this.minutes.set(0);
    this.seconds.set(0);
    this.progress.set(100);
    this.expired.set(false);
  }
}
