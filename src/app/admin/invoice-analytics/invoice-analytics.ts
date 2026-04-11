import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';
import { BaseChartDirective } from 'ng2-charts';

import {
  Chart,
  ChartConfiguration,
  registerables
} from 'chart.js';
import { forkJoin } from 'rxjs';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

Chart.register(...registerables);

interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

@Component({
  selector: 'app-invoice-analytics',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './invoice-analytics.html',
  styleUrl: './invoice-analytics.css'
})
export class InvoiceAnalytics {

  summary: any = {};
  monthlyRevenue: any[] = [];
  courseBreakdown: any[] = [];
  paymentMethods: any[] = [];
  topInvoices: any[] = [];

  loading = false;
  lastUpdated = new Date();
  private refreshInterval: any;

  averageInvoiceValue = 0;
  collectionRate = 0;
  pendingRate = 0;

  constructor(private http: HttpClient, private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadAnalytics();

    this.refreshInterval = setInterval(() => {
      this.loadAnalytics(true);
    }, 30000);
  }
  ngOnDestroy(): void {
    clearInterval(this.refreshInterval);
  }

  ngAfterViewInit(): void {
    this.cd.detectChanges();
  }

  loadAnalytics(showSpinner: boolean = true): void {

    if (showSpinner) {
      this.loading = true;
      this.cd.detectChanges();
    }

    forkJoin({
      summary: this.http.get(`${environment.apiUrl}/invoices/analytics/summary`),
      monthly: this.http.get<any[]>(`${environment.apiUrl}/invoices/analytics/monthly`),
      courses: this.http.get<any[]>(`${environment.apiUrl}/invoices/analytics/course-breakdown`),
      methods: this.http.get<any[]>(`${environment.apiUrl}/invoices/analytics/payment-methods`),
      invoices: this.http.get<PageResponse<any>>(
        `${environment.apiUrl}/invoices/paged?page=0&size=5`
      )
    }).subscribe(res => {

      this.summary = res.summary;
      this.monthlyRevenue = res.monthly;
      this.courseBreakdown = res.courses;
      this.paymentMethods = res.methods;
      this.averageInvoiceValue =
        this.summary?.totalInvoices
          ? this.summary.totalRevenue / this.summary.totalInvoices
          : 0;

      this.collectionRate =
        this.summary?.totalRevenue
          ? (this.summary.paidRevenue / this.summary.totalRevenue) * 100
          : 0;

      this.pendingRate =
        this.summary?.totalRevenue
          ? (this.summary.pendingRevenue / this.summary.totalRevenue) * 100
          : 0;

      this.topInvoices = [...res.invoices.content]
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);

      this.monthlyRevenueChartData = {
        labels: res.monthly.map(x => x.month),
        datasets: [{
          data: res.monthly.map(x => x.revenue),
          label: 'Monthly Revenue',
          borderRadius: 8
        }]
      };

      this.paymentMethodChartData = {
        labels: res.methods.map(x => x.paymentMethod),
        datasets: [{
          data: res.methods.map(x => x.revenue)
        }]
      };

      this.courseRevenueChartData = {
        labels: res.courses.map(x => x.course),
        datasets: [{
          data: res.courses.map(x => x.revenue)
        }]
      };

      this.lastUpdated = new Date();

      setTimeout(() => {
        this.loading = false;
        this.cd.detectChanges();
      }, 600);
    });
  }

  monthlyRevenueChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Revenue',
        borderRadius: 8
      }
    ]
  };

  paymentMethodChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: [],
    datasets: [
      {
        data: []
      }
    ]
  };

  courseRevenueChartData: ChartConfiguration<'pie'>['data'] = {
    labels: [],
    datasets: [
      {
        data: []
      }
    ]
  };

  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false
  };

  async exportDashboardPdf(): Promise<void> {

    const element = document.getElementById('analyticsDashboard');

    if (!element) {
      console.error('Analytics dashboard element not found');
      return;
    }

    this.loading = true;
    this.cd.detectChanges();

    await new Promise(resolve => setTimeout(resolve, 300));

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');

    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

    pdf.save(`Revenue-Analytics-${Date.now()}.pdf`);

    this.loading = false;
    this.cd.detectChanges();
  }

  exportRevenueExcel(): void {

    const data = [
      {
        Metric: 'Total Revenue',
        Value: this.summary.totalRevenue
      },
      {
        Metric: 'Paid Revenue',
        Value: this.summary.paidRevenue
      },
      {
        Metric: 'Pending Revenue',
        Value: this.summary.pendingRevenue
      },
      {
        Metric: 'Average Invoice',
        Value: this.averageInvoiceValue
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(data);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      'Revenue Analytics'
    );

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    });

    const blob = new Blob(
      [excelBuffer],
      {
        type:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
    );

    saveAs(blob, 'Revenue-Analytics.xlsx');
  }

  exportInvoicesCsv(): void {

    const worksheet = XLSX.utils.json_to_sheet(this.topInvoices);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      'Top Invoices'
    );

    XLSX.writeFile(workbook, 'Top-Invoices.csv');
  }

  printDashboard(): void {
    window.print();
  }
}