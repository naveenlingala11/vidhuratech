import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GamificationService {
  private streakSubject = new BehaviorSubject<number>(0);
  public pointsSubject = new BehaviorSubject<number>(150);
  private claimedTodaySubject = new BehaviorSubject<boolean>(false);

  streak$ = this.streakSubject.asObservable();
  points$ = this.pointsSubject.asObservable();
  claimedToday$ = this.claimedTodaySubject.asObservable();

  public rankSubject = new BehaviorSubject<number>(512);
  public marksSubject = new BehaviorSubject<number>(15);

  rank$ = this.rankSubject.asObservable();
  marks$ = this.marksSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: any) {
    this.load();
  }

  load(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    let streak = 0;
    try {
      const historyJson = localStorage.getItem('vt_login_history');
      const history: string[] = historyJson ? JSON.parse(historyJson) : [];
      
      if (history.length > 0) {
        const sorted = [...history].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
        const currentCheck = new Date(sorted[0]);
        currentCheck.setHours(0, 0, 0, 0);
        
        const dateStrings = sorted.map(dStr => {
          const tempDate = new Date(dStr);
          tempDate.setHours(0, 0, 0, 0);
          return tempDate.toLocaleDateString('en-CA');
        });

        while (true) {
          const checkStr = currentCheck.toLocaleDateString('en-CA');
          if (dateStrings.includes(checkStr)) {
            streak++;
            currentCheck.setDate(currentCheck.getDate() - 1);
          } else {
            // Streak freeze / 1-day grace period
            const dayBefore = new Date(currentCheck);
            dayBefore.setDate(dayBefore.getDate() - 1);
            const dayBeforeStr = dayBefore.toLocaleDateString('en-CA');
            
            if (dateStrings.includes(dayBeforeStr)) {
              streak++;
              currentCheck.setDate(currentCheck.getDate() - 2);
            } else {
              break;
            }
          }
        }
      }
    } catch {
      streak = 0;
    }
    this.streakSubject.next(streak);

    let points = 150;
    try {
      const savedPoints = localStorage.getItem('vt_profile_points');
      const parsed = savedPoints ? parseInt(savedPoints, 10) : 0;
      const computedMin = streak * 50;
      points = Math.max(parsed, computedMin || 150);
      localStorage.setItem('vt_profile_points', String(points));
    } catch {
      points = streak * 50 || 150;
    }
    this.pointsSubject.next(points);

    let claimed = false;
    try {
      const lastClaimStr = localStorage.getItem('vt_profile_last_claim');
      if (lastClaimStr) {
        const lastClaimDate = new Date(lastClaimStr).toDateString();
        const todayDate = new Date().toDateString();
        claimed = lastClaimDate === todayDate;
      }
    } catch {
      claimed = false;
    }
    this.claimedTodaySubject.next(claimed);

    // Calculate marks: every 10 points = 1 mark
    const marks = Math.floor(points / 10);
    this.marksSubject.next(marks);

    // Calculate dynamic rank
    let rank = 512;
    if (points >= 1000) rank = 3;
    else if (points >= 800) rank = 8;
    else if (points >= 600) rank = 15;
    else if (points >= 400) rank = 34;
    else if (points >= 200) rank = 88;
    else if (points >= 100) rank = 243;
    else if (points > 0) rank = 412;
    
    this.rankSubject.next(rank);
  }

  trackLogin(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      const historyJson = localStorage.getItem('vt_login_history');
      let history: string[] = historyJson ? JSON.parse(historyJson) : [];
      const today = new Date().toLocaleDateString('en-CA');

      if (!history.includes(today)) {
        history.push(today);
        history = history.sort().slice(-60);
        localStorage.setItem('vt_login_history', JSON.stringify(history));
      }
    } catch {}
    this.load();
  }

  claimDailyReward(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.claimedTodaySubject.value) return;

    const streak = this.streakSubject.value;
    let bonus = 0;
    if (streak > 0 && streak % 7 === 0) {
      const milestoneCount = Math.floor(streak / 7);
      bonus = milestoneCount * 100;
    }

    const currentPoints = this.pointsSubject.value;
    const newPoints = currentPoints + 50 + bonus;

    try {
      const historyJson = localStorage.getItem('vt_login_history');
      let history: string[] = historyJson ? JSON.parse(historyJson) : [];
      const today = new Date().toLocaleDateString('en-CA');

      if (!history.includes(today)) {
        history.push(today);
        history = history.sort().slice(-60);
        localStorage.setItem('vt_login_history', JSON.stringify(history));
      }
    } catch {}

    const now = new Date();
    localStorage.setItem('vt_profile_points', String(newPoints));
    localStorage.setItem('vt_profile_last_claim', now.toISOString());

    this.load();
  }
}
