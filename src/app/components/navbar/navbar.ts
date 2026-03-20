import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {

  scrolled = false;

  @HostListener('window:scroll', [])
  onScroll() {

    this.scrolled = window.scrollY > 50;

  }

  openDemo() {

    const modal = document.getElementById('enrollModal');

    if (modal) {

      const bootstrapModal = new (window as any).bootstrap.Modal(modal);

      bootstrapModal.show();

    }

  }

}