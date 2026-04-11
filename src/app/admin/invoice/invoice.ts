import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { InvoiceTemplateComponent } from '../invoice-template/invoice-template';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { debounceTime, Subject } from 'rxjs';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-invoice',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InvoiceTemplateComponent,
    RouterLink
  ],
  templateUrl: './invoice.html',
  styleUrls: ['./invoice.css']
})
export class InvoiceComponent implements OnInit {

  searchMobile = '';
  showSuggestions = false;
  showPreviewModal = false;

  leadSuggestions: any[] = [];
  invoices: any[] = [];

  page = 0;
  totalPages = 0;

  today = new Date();

  editingInvoiceId: string | null = null;
  selectedInstallments: any[] = [];
  showInstallmentModal = false;

  invoiceData: any = {
    id: '',
    name: '',
    email: '',
    mobile: '',
    studentAddress: '',
    course: '',
    batch: '',
    amount: 0,
    discount: 0,
    scholarship: 0,
    couponCode: '',
    paymentStatus: 'Paid',
    paymentMethod: 'UPI',
    notes: '',
    paidAmount: 0,
    remainingAmount: 0,
    installmentEnabled: false,
    installments: []
  };

  private searchSubject = new Subject<void>();

  constructor(
    private http: HttpClient,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {

    this.loadInvoices();

    this.searchSubject
      .pipe(debounceTime(500))
      .subscribe(() => {
        this.page = 0;
        this.searchInvoices();
      });
  }

  onSearchMobile(): void {
    if (this.searchMobile.length < 3) {
      this.leadSuggestions = [];
      this.showSuggestions = false;
      return;
    }

    this.http.get<any[]>(
      `${environment.apiUrl}/api/leads/search?phone=${this.searchMobile}`
    ).subscribe(res => {
      this.leadSuggestions = res;
      this.showSuggestions = true;
    });
  }

  selectLead(lead: any): void {
    this.invoiceData.name = lead.name || '';
    this.invoiceData.email = lead.email || '';
    this.invoiceData.mobile = lead.phone || '';
    this.invoiceData.course = lead.course || '';
    this.searchMobile = lead.phone || '';
    this.showSuggestions = false;
  }

  openPreview(inv?: any): void {
    if (inv) {
      this.invoiceData = { ...inv };
    }
    this.showPreviewModal = true;
  }

  closePreview(): void {
    this.showPreviewModal = false;
  }

  generateInvoice(): void {

    if (this.editingInvoiceId) {
      this.updateInvoice();
      return;
    }

    const payload = {
      invoice: {
        ...this.invoiceData,
        leadPhone: this.invoiceData.mobile
      },
      installments: this.invoiceData.installments
    };

    this.http.post<any>(
      `${environment.apiUrl}/invoices`,
      payload
    ).subscribe(res => {

      this.invoiceData.id = res.id;

      this.loadInvoices();

      alert('Invoice Created');

      this.resetForm();
    });
  }

  updateInvoice(): void {

    this.http.put<any>(
      `${environment.apiUrl}/invoices/${this.editingInvoiceId}`,
      this.invoiceData
    ).subscribe(() => {

      alert('Invoice Updated Successfully');

      this.editingInvoiceId = null;

      this.loadInvoices();

      this.resetForm();
    });
  }

  loadInvoices(): void {
    this.http.get<any>(
      `${environment.apiUrl}/invoices/paged?page=${this.page}&size=5`
    ).subscribe(res => {
      this.invoices = res.content;
      this.totalPages = res.totalPages;
      this.cd.detectChanges();
    });
  }

  nextPage(): void {
    if (this.page < this.totalPages - 1) {
      this.page++;
      this.loadInvoices();
      this.searchInvoices();
    }
  }

  prevPage(): void {
    if (this.page > 0) {
      this.page--;
      this.loadInvoices();
      this.searchInvoices();
    }
  }

  async downloadInvoice(): Promise<void> {
    const invoiceElement = document.getElementById('invoice');

    if (!invoiceElement) return;

    const canvas = await html2canvas(invoiceElement, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      scrollY: -window.scrollY
    });

    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');

    const pdfWidth = 210;
    const pdfHeight = 297;

    const margin = 8;
    const usableWidth = pdfWidth - margin * 2;
    const usableHeight = pdfHeight - margin * 2;

    const imgWidth = usableWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = margin;

    pdf.addImage(
      imgData,
      'PNG',
      margin,
      position,
      imgWidth,
      imgHeight,
      '',
      'FAST'
    );

    heightLeft -= usableHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight + margin;

      pdf.addPage();

      pdf.addImage(
        imgData,
        'PNG',
        margin,
        position,
        imgWidth,
        imgHeight,
        '',
        'FAST'
      );

      heightLeft -= usableHeight;
    }

    pdf.save(`${this.invoiceData.id || 'invoice'}.pdf`);
  }

  downloadSavedInvoice(inv: any): void {
    this.invoiceData = { ...inv };

    setTimeout(() => {
      this.downloadInvoice();
    }, 300);
  }

  addInstallment(): void {

    if (!this.invoiceData.installments) {
      this.invoiceData.installments = [];
    }

    this.invoiceData.installments.push({
      installmentNo: this.invoiceData.installments.length + 1,
      amount: 0,
      paidAmount: 0,
      dueDate: '',
      status: 'Pending'
    });
  }

  removeInstallment(index: number): void {
    this.invoiceData.installments.splice(index, 1);

    this.invoiceData.installments.forEach((x: any, i: number) => {
      x.installmentNo = i + 1;
    });
  }

  editInvoice(inv: any): void {

    this.editingInvoiceId = inv.id;

    this.invoiceData = {
      ...inv,
      installments: inv.installments || []
    };

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  resetForm(): void {
    this.invoiceData = {
      id: '',
      name: '',
      email: '',
      mobile: '',
      studentAddress: '',
      course: '',
      batch: '',
      amount: 0,
      discount: 0,
      scholarship: 0,
      paidAmount: 0,
      remainingAmount: 0,
      installmentEnabled: false,
      installments: [],
      couponCode: '',
      paymentStatus: 'Paid',
      paymentMethod: 'UPI',
      notes: ''
    };
  }

  manageInstallments(inv: any): void {

    this.http.get<any[]>(
      `${environment.apiUrl}/invoices/${inv.id}/installments`
    ).subscribe(res => {

      this.selectedInstallments = res;

      this.showInstallmentModal = true;
    });
  }

  payInstallment(inst: any): void {

    this.http.post<any>(
      `${environment.apiUrl}/invoices/installments/${inst.id}/pay`,
      {}
    ).subscribe(() => {

      alert('Installment Marked Paid');

      this.showInstallmentModal = false;

      this.loadInvoices();
    });
  }

  // filters

  filterData: any = {
    name: '',
    course: '',
    paymentStatus: '',
    minAmount: null,
    maxAmount: null,
    fromDate: '',
    toDate: ''
  };

  onFilterChange(): void {
    this.searchSubject.next();
  }

  searchInvoices(): void {

    const payload = {
      ...this.filterData,
      page: this.page,
      size: 5
    };

    this.http.post<any>(
      `${environment.apiUrl}/invoices/search`,
      payload
    ).subscribe(res => {

      this.invoices = res.content;
      this.totalPages = res.totalPages;

    });
  }

  clearFilters(): void {

    this.filterData = {
      name: '',
      course: '',
      paymentStatus: '',
      minAmount: null,
      maxAmount: null,
      fromDate: '',
      toDate: ''
    };

    this.searchInvoices();
  }

  // validations
  get finalInvoiceAmount(): number {
    return (
      Number(this.invoiceData.amount || 0)
      - (Number(this.invoiceData.amount || 0) * Number(this.invoiceData.discount || 0) / 100)
      - Number(this.invoiceData.scholarship || 0)
    );
  }

  get totalInstallmentAmount(): number {
    return (this.invoiceData.installments || [])
      .reduce((sum: number, inst: any) => sum + Number(inst.amount || 0), 0);
  }

  get installmentAmountMismatch(): boolean {
    return this.invoiceData.installmentEnabled &&
      this.invoiceData.installments?.length > 0 &&
      this.totalInstallmentAmount !== this.finalInvoiceAmount;
  }

  get installmentCompletionPercentage(): number {
    const installments = this.invoiceData.installments || [];

    if (!installments.length) return 0;

    const paid = installments.filter((x: any) => x.status === 'Paid').length;

    return Math.round((paid / installments.length) * 100);
  }

  isOverdue(inst: any): boolean {
    if (!inst?.dueDate) return false;

    return (
      inst.status !== 'Paid' &&
      new Date(inst.dueDate) < new Date()
    );
  }
}