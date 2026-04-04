import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
  <div style="text-align:center; margin-top:100px">

    <h2>🎓 Certificate Verification</h2>

    <div *ngIf="certificate">
      <p><b>Name:</b> {{certificate.name}}</p>
      <p><b>Course:</b> {{certificate.course}}</p>
      <p><b>ID:</b> {{certificate.id}}</p>
      <p><b>Date:</b> {{certificate.issuedAt}}</p>

      <button (click)="download()">Download Certificate</button>
    </div>

    <div *ngIf="!certificate">
      ❌ Invalid Certificate
    </div>

  </div>
  `
})
export class CertificateVerifyComponent implements OnInit {

  id = '';
  certificate: any;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];

    fetch(`${environment.apiUrl}/certificates/${this.id}`)
      .then(res => res.json())
      .then(data => this.certificate = data)
      .catch(() => this.certificate = null);
  }

  download() {
    alert("Backend PDF download integrate cheyali");
  }
}