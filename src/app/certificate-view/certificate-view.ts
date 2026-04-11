import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../environments/environment';
import { CommonModule } from '@angular/common';
import QRCode from 'qrcode';

@Component({
  selector: 'app-certificate-view',
  imports: [CommonModule],
  templateUrl: './certificate-view.html',
  styleUrl: './certificate-view.css',
})
export class CertificateView implements OnInit {

  qrCodeUrl = '';
  certificate: any;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    this.http.get(`${environment.apiUrl}/certificates/${id}`)
      .subscribe((data: any) => {
        this.certificate = data;
        this.cd.detectChanges();

        const url = `${window.location.origin}/certificate/${data.id}`;

        QRCode.toDataURL(url).then(qr => {
          this.qrCodeUrl = qr;
        });
      });
    this.cd.detectChanges();
  }
}