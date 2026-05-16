// timer.service.ts
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
  private started = false;
  private timerSub?: Subscription;
  private lastSeatUpdateHour = new Date().getHours();
  startCountdown() {
    if (this.started) return;
    this.started = true;
    // ✅ BASE DATE
    const baseDate = new Date(2026, 4, 2); // May 2 2026
    const cycleDays = 15;
    // ✅ FIND NEXT 15 DAYS BATCH
    const getNextBatchDate = () => {
      const now = new Date();
      const diffDays = Math.floor(
        (now.getTime() - baseDate.getTime()) /
        (1000 * 60 * 60 * 24)
      );
      const cycles = Math.floor(diffDays / cycleDays);
      const nextBatchDate = new Date(baseDate);
      nextBatchDate.setDate(
        baseDate.getDate() + ((cycles + 1) * cycleDays)
      );
      // optional batch timing
      nextBatchDate.setHours(19, 30, 0, 0);
      return nextBatchDate;
    };
    let endTime = getNextBatchDate().getTime();
    const updateTotalDuration = () => {
      const now = new Date().getTime();
      return endTime - now;
    };
    let totalDuration = updateTotalDuration();
    this.timerSub = interval(1000).subscribe(() => {
      const now = new Date().getTime();
      // ✅ AUTO RESET EVERY 15 DAYS
      if (now >= endTime) {
        endTime = getNextBatchDate().getTime();
        totalDuration = updateTotalDuration();
        // optional reset seats
        this.seats.set(25);
      }
      const distance = endTime - now;
      const totalSeconds = Math.floor(distance / 1000);
      this.days.set(
        Math.floor(totalSeconds / (3600 * 24))
      );
      this.hours.set(
        Math.floor((totalSeconds % (3600 * 24)) / 3600)
      );
      this.minutes.set(
        Math.floor((totalSeconds % 3600) / 60)
      );
      this.seconds.set(
        totalSeconds % 60
      );
      this.progress.set(
        (distance / totalDuration) * 100
      );
      // ✅ SEAT REDUCE EVERY HOUR
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