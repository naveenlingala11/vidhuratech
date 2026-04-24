import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SuperAdminService } from '../service/super-admin';

@Component({
  selector: 'app-super-admin-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './super-admin-overview.html',
  styleUrls: ['./super-admin-overview.css']
})
export class SuperAdminOverview implements OnInit {

  stats: any = {};

  constructor(private service: SuperAdminService) {}

  ngOnInit() {
    this.service.getDashboardStats().subscribe(res => {
      this.stats = res;
    });
  }
}