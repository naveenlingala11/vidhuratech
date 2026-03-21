import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ElementRef, ViewChild } from '@angular/core';
import { filter } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  scrolled = false;

  @ViewChild('navCollapse') navCollapse!: ElementRef;
  constructor(private router: Router) {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  @HostListener('window:scroll', [])
  onScroll() {
    this.scrolled = window.scrollY > 50;
  }

  closeMenu() {
    const element = this.navCollapse?.nativeElement;

    if (element && element.classList.contains('show')) {
      const bsCollapse = new (window as any).bootstrap.Collapse(element, {
        toggle: false,
      });
      bsCollapse.hide();
    }
  }

  openDemo() {
    const modal = document.getElementById('enrollModal');

    if (modal) {
      const bootstrapModal = new (window as any).bootstrap.Modal(modal);
      bootstrapModal.show();
    }
  }
}
