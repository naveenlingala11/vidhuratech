import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrainerDashboardService } from '../../service/trainer-dashboard';

@Component({
  selector: 'app-trainer-students',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trainer-students.html'
})
export class TrainerStudentsComponent implements OnInit {

  students: any[] = [];

  constructor(private service: TrainerDashboardService) {}

  ngOnInit(): void {
    this.service.getStudents().subscribe((res: any) => {
      this.students = res.data;
    });
  }
}