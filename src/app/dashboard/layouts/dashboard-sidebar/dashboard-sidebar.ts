import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Router,
  RouterLink,
  RouterLinkActive
} from '@angular/router';

import { AuthService } from '../../../features/auth/services/auth.service';
import { DASHBOARD_MENUS } from '../../shared/dashboard-menu.config';

@Component({
  selector: 'app-dashboard-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './dashboard-sidebar.html',
  styleUrls: ['./dashboard-sidebar.css']
})
export class DashboardSidebar implements OnInit {

  @Input() collapsed = false;
  @Input() mobile = false;
  @Output() menuToggle = new EventEmitter<void>();

  user: any = {};
  menuItems: any[] = [];

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.user = this.authService.getUser();
    this.menuItems = DASHBOARD_MENUS[this.user?.role] || [];
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
