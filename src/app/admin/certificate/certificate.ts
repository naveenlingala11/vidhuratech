import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import QRCode from 'qrcode';
@Component({
  selector: 'app-certificate',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './certificate.html',
  styleUrl: './certificate.css',
})
export class CertificateComponent implements OnInit {
  // ================= DATA =================
  certificateData = {
    name: '',
    course: '',
    email: '',
    mobile: ''
  };
  certificates: any[] = [];
  certificateId = '';
  qrCodeUrl = '';
  today = new Date();
  // ================= UI =================
  mobileSuggestions: any[] = [];
  showSuggestions = false;
  searchText = '';
  showCertPopup = false;
  searchTimeout: any;
  // ================= SORTING & PAGINATION =================
  sortColumn = 'issuedAt';
  sortDirection: 'asc' | 'desc' = 'desc';
  currentPage = 1;
  pageSize = 5;
  registrySearchText = '';
  constructor(private http: HttpClient, private cd: ChangeDetectorRef) { }
  ngOnInit() {
    this.loadCertificates();
  }
  // ================= LOAD =================
  loadCertificates() {
    this.http.get<any[]>(`${environment.apiUrl}/certificates`)
      .subscribe(data => {
        this.certificates = data;
        this.currentPage = 1;
      });
    this.cd.detectChanges();
  }
  // ================= SORTING & PAGINATION =================
  toggleSort(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'desc';
    }
    this.currentPage = 1;
  }

  get filteredAndSortedCertificates(): any[] {
    let list = [...this.certificates];
    if (this.registrySearchText) {
      const search = this.registrySearchText.toLowerCase();
      list = list.filter(c => 
        (c.name || '').toLowerCase().includes(search) ||
        (c.email || '').toLowerCase().includes(search) ||
        (c.mobile || '').toLowerCase().includes(search) ||
        (c.course || '').toLowerCase().includes(search) ||
        (c.id || '').toLowerCase().includes(search)
      );
    }
    list.sort((a, b) => {
      let valA = a[this.sortColumn];
      let valB = b[this.sortColumn];
      if (this.sortColumn === 'issuedAt') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      } else {
        valA = String(valA || '').toLowerCase();
        valB = String(valB || '').toLowerCase();
      }
      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }

  get paginatedCertificates(): any[] {
    const list = this.filteredAndSortedCertificates;
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return list.slice(startIndex, startIndex + this.pageSize);
  }

  get totalPages(): number {
    const count = this.filteredAndSortedCertificates.length;
    return Math.ceil(count / this.pageSize) || 1;
  }

  get pageNumbers(): number[] {
    const total = this.totalPages;
    const pages: number[] = [];
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
    return pages;
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  goToPage(page: number) {
    this.currentPage = page;
  }

  get startIndex(): number {
    if (this.filteredAndSortedCertificates.length === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endIndex(): number {
    const end = this.currentPage * this.pageSize;
    const total = this.filteredAndSortedCertificates.length;
    return end > total ? total : end;
  }
  // ================= GENERATE =================
  generateQRCode(id: string) {
    const url = `${window.location.origin}/certificate/${id}`;
    QRCode.toDataURL(url)
      .then(qr => {
        this.qrCodeUrl = qr;
        this.cd.detectChanges();
      });
  }
  generateAndDownload() {
    this.http.post<any>(`${environment.apiUrl}/certificates`, {
      name: this.certificateData.name,
      course: this.certificateData.course,
      email: this.certificateData.email,
      mobile: this.certificateData.mobile
    }).subscribe(res => {
      this.certificateId = res.id;
      this.generateQRCode(res.id);
      setTimeout(() => {
      }, 500);
    });
  }
  // ================= DOWNLOAD PDF =================
  async downloadCertificate() {
    if (!this.certificateId) {
      alert("Generate certificate first");
      return;
    }
    const element = document.getElementById('certificate');
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(element!, { scale: 3 });
    const imgData = canvas.toDataURL('image/png');
    const jsPDF = (await import('jspdf')).jsPDF;
    const pdf = new jsPDF('landscape', 'px', [1120, 794]);
    pdf.addImage(imgData, 'PNG', 0, 0, 1120, 794);
    pdf.save(`${this.certificateData.name}_certificate.pdf`);
  }
  // ================= VIEW =================
  viewCert(id: string) {
    window.open(`/certificate/${id}`, '_blank');
  }
  // ================= DOWNLOAD FROM TABLE =================
  downloadCert(id: string) {
    window.open(`${environment.apiUrl}/certificates/${id}/download`);
  }
  // ================= REMARKS =================
  saveRemarks(c: any) {
    this.http.put(`${environment.apiUrl}/certificates/${c.id}/remarks`, c.remarks)
      .subscribe();
  }
  // ================= MOBILE SEARCH =================
  searchMobile() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      const mobile = this.certificateData.mobile;
      if (!mobile || mobile.length < 3) return;
      this.http.get<any[]>(`${environment.apiUrl}/api/leads/search?phone=${mobile}`)
        .subscribe(data => {
          this.mobileSuggestions = data;
          this.showSuggestions = data.length > 0;
        });
    }, 300);
  }
  selectSuggestion(user: any) {
    this.certificateData.mobile = user.phone;
    this.certificateData.name = user.name;
    this.certificateData.email = user.email;
    this.certificateData.course = user.course;
    this.showSuggestions = false;
  }
  // ================= FETCH USER =================
  fetchUserByMobile() {
    const mobile = this.certificateData.mobile;
    if (!mobile || mobile.length < 5) return;
    this.http.get<any>(`${environment.apiUrl}/api/leads/by-phone?phone=${mobile}`)
      .subscribe({
        next: (user) => {
          if (user) {
            this.certificateData.name ||= user.name;
            this.certificateData.email ||= user.email;
            this.certificateData.course ||= user.course;
          }
        }
      });
  }
  // ================= LINKEDIN =================
  shareLinkedIn() {
    if (!this.certificateId) {
      alert("Generate certificate first");
      return;
    }
    const url = `${window.location.origin}/certificate/${this.certificateId}`;
    const linkedInUrl =
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(linkedInUrl, '_blank');
  }

  getInitials(name: string): string {
    return String(name || 'ST')
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }
}