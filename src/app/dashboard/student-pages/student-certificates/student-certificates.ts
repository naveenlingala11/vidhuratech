import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { StudentService } from '../service/student';
import QRCode from 'qrcode';
interface StudentCourse {
  id?: number | string;
  batchId?: number | string;
  name?: string;
  courseName?: string;
  batchName?: string;
  progress?: number;
}
interface StudentCertificate {
  id: string;
  name: string;
  course: string;
  email: string;
  mobile?: string;
  issuedAt?: string;
}
@Component({
  selector: 'app-student-certificates',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-certificates.html',
  styleUrl: './student-certificates.css',
})
export class StudentCertificatesComponent implements OnInit {
  courses: StudentCourse[] = [];
  certificates: StudentCertificate[] = [];
  completedCourseKeys = new Set<string>();
  generatingCourseKey = '';
  loading = true;
  toast = '';
  qrCodeUrl = '';
  downloading = false;
  previewCertificate: StudentCertificate | null = null;
  constructor(private service: StudentService) { }
  ngOnInit(): void {
    this.loadPage();
  }
  loadPage(): void {
    this.loading = true;
    this.service.getCourses().subscribe({
      next: (res: any) => {
        this.courses = res?.data || res || [];
        this.loadCertificates();
      },
      error: () => {
        this.courses = [];
        this.loadCertificates();
      }
    });
  }
  loadCertificates(): void {
    this.service.getCertificates(this.currentUser?.email).subscribe({
      next: (res: any) => {
        this.certificates = res?.data || res || [];
        this.loading = false;
      },
      error: () => {
        this.certificates = [];
        this.loading = false;
      }
    });
  }
  markCompleted(course: StudentCourse): void {
    this.completedCourseKeys.add(this.getCourseKey(course));
    this.showToast('Course marked as completed');
  }
  undoCompleted(course: StudentCourse): void {
    this.completedCourseKeys.delete(this.getCourseKey(course));
  }
  canGenerate(course: StudentCourse): boolean {
    return this.completedCourseKeys.has(this.getCourseKey(course)) &&
      !this.getCertificateForCourse(course);
  }
  generateCertificate(course: StudentCourse): void {
    const key = this.getCourseKey(course);
    this.generatingCourseKey = key;
    this.service.generateCertificateForCourse({
      name: this.currentUser?.name || this.currentUser?.fullName || 'Student',
      email: this.currentUser?.email,
      mobile: this.currentUser?.mobile || this.currentUser?.phone,
      course: this.getCourseName(course),
      batchId: course.batchId || course.id
    }).subscribe({
      next: (res: any) => {
        const certificate = res?.data || res;
        const alreadyExists = this.certificates.some(c => c.id === certificate.id);
        if (!alreadyExists) {
          this.certificates = [certificate, ...this.certificates];
        }
        this.generatingCourseKey = '';
        this.openPreview(certificate);
        this.showToast('Certificate generated successfully');
      },
      error: () => {
        this.generatingCourseKey = '';
        this.showToast('Unable to generate certificate');
      }
    });
  }
  closePreview(): void {
    this.previewCertificate = null;
    this.qrCodeUrl = '';
  }
  sendToEmail(id: string): void {
    this.service.sendCertificateToEmail(id).subscribe({
      next: () => this.showToast('Certificate sent to your email'),
      error: () => this.showToast('Unable to send email')
    });
  }
  getCertificateForCourse(course: StudentCourse): StudentCertificate | undefined {
    const name = this.getCourseName(course).toLowerCase();
    return this.certificates.find(c => String(c.course || '').toLowerCase() === name);
  }
  getCourseName(course: StudentCourse): string {
    return course.courseName || course.name || 'Course';
  }
  getCourseKey(course: StudentCourse): string {
    return String(course.batchId || course.id || this.getCourseName(course));
  }
  showToast(message: string): void {
    this.toast = message;
    setTimeout(() => this.toast = '', 2500);
  }
  get currentUser(): any {
    try {
      return JSON.parse(localStorage.getItem('vt_user') || '{}');
    } catch {
      return {};
    }
  }
  openPreview(certificate: StudentCertificate): void {
    this.previewCertificate = certificate;
    this.generateQRCode(certificate.id);
  }

  generateQRCode(id: string): Promise<void> {
    const url = `${window.location.origin}/certificate/${id}`;

    return QRCode.toDataURL(url).then(qr => {
      this.qrCodeUrl = qr;
    });
  }

  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async waitForImages(element: HTMLElement): Promise<void> {
    const images = Array.from(element.querySelectorAll('img'));

    await Promise.all(
      images.map(img => {
        if (img.complete) {
          return Promise.resolve();
        }

        return new Promise<void>(resolve => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
        });
      })
    );
  }

  async downloadCertificate(certificate?: StudentCertificate): Promise<void> {
    const cert = certificate || this.previewCertificate;

    if (!cert) {
      this.showToast('Open certificate preview first');
      return;
    }

    this.previewCertificate = cert;
    this.downloading = true;

    try {
      await this.generateQRCode(cert.id);
      await this.wait(250);

      const original = document.getElementById('student-certificate-print');

      if (!original) {
        this.showToast('Certificate preview not ready');
        return;
      }

      const clone = original.cloneNode(true) as HTMLElement;
      clone.id = 'student-certificate-download-copy';

      clone.style.position = 'fixed';
      clone.style.left = '-10000px';
      clone.style.top = '0';
      clone.style.width = '1120px';
      clone.style.height = '794px';
      clone.style.margin = '0';
      clone.style.transform = 'none';
      clone.style.zIndex = '-1';

      document.body.appendChild(clone);

      await this.waitForImages(clone);
      await this.wait(150);

      const html2canvas = (await import('html2canvas')).default;

      const canvas = await html2canvas(clone, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 1120,
        height: 794,
        windowWidth: 1120,
        windowHeight: 794
      });

      const imgData = canvas.toDataURL('image/png');

      const jsPDF = (await import('jspdf')).jsPDF;
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [1120, 794]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, 1120, 794);

      const safeName = `${cert.name}_${cert.course}_certificate`
        .replace(/[^a-zA-Z0-9-_]/g, '_');

      const blob = pdf.output('blob');
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `${safeName}.pdf`;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      document.body.removeChild(clone);

      this.showToast('Certificate downloaded');
    } catch (error) {
      console.error(error);
      this.showToast('Unable to download certificate');
    } finally {
      this.downloading = false;
    }
  }
}