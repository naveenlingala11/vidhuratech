import { Component, OnInit } from '@angular/core';
import { StudentService } from '../service/student';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-student-certificates',
  imports: [CommonModule],
  templateUrl: './student-certificates.html',
  styleUrl: './student-certificates.css',
})
export class StudentCertificatesComponent implements OnInit {

  certificates: any[] = [];

  constructor(private service: StudentService) {}

  ngOnInit(): void {
    this.service.getCertificates().subscribe((res: any) => {
      this.certificates = res.data;
    });
  }
}