import { Component, OnInit } from '@angular/core';
import { StudentService } from '../service/student';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-student-assignments',
  imports: [CommonModule],
  templateUrl: './student-assignments.html',
  styleUrl: './student-assignments.css',
})
export class StudentAssignmentsComponent implements OnInit {

  assignments: any[] = [];

  constructor(private service: StudentService) {}

  ngOnInit(): void {
    this.service.getAssignments().subscribe((res: any) => {
      this.assignments = res.data;
    });
  }
}
