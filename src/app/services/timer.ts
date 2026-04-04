// timer.service.ts
import { Injectable, signal } from '@angular/core';
import { interval } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TimerService {
  days = signal(0);
  hours = signal(0);
  minutes = signal(0);
  seconds = signal(0);
  progress = signal(100);
  seats = signal(100);
  private started = false;
  private lastSeatUpdateHour = new Date().getHours();

  startCountdown() {
    if (this.started) return; // 🔥 prevent duplicate timers
    this.started = true;

    const endTime = new Date('2026-04-10T23:59:59').getTime();
    const totalDuration = endTime - new Date().getTime();

    interval(1000).subscribe(() => {
      const now = new Date().getTime();
      const distance = endTime - now;

      if (distance <= 0) return;

      const totalSeconds = Math.floor(distance / 1000);

      this.days.set(Math.floor(totalSeconds / (3600 * 24)));
      this.hours.set(Math.floor((totalSeconds % (3600 * 24)) / 3600));
      this.minutes.set(Math.floor((totalSeconds % 3600) / 60));
      this.seconds.set(totalSeconds % 60);

      this.progress.set((distance / totalDuration) * 100);

      // ✅ NEW LOGIC
      const currentHour = new Date().getHours();

      if (currentHour !== this.lastSeatUpdateHour) {
        this.lastSeatUpdateHour = currentHour;

        if (this.seats() > 0) {
          this.seats.set(this.seats() - 1);
        }
      }
    });
  }
}