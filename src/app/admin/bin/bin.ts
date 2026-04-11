import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-bin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bin.html',
  styleUrl: './bin.css',
})
export class BinComponent implements OnInit {

  binLeads: any[] = [];
  isBinLoading = false;
  binTotal = 0;

  constructor(private cd: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadBin();
  }

  // ================= LOAD BIN =================
  loadBin() {
    this.isBinLoading = true;

    fetch(`${environment.apiUrl}/api/leads/bin?page=0&size=10`)
      .then(res => res.json())
      .then(data => {
        this.binLeads = data.content;
        this.binTotal = data.totalElements;

        this.isBinLoading = false;
        this.cd.detectChanges();
      })
      .catch(() => {
        this.isBinLoading = false;
      });
  }

  // ================= RESTORE =================
  restoreLead(lead: any) {
    fetch(`${environment.apiUrl}/api/leads/restore/${lead.id}`, {
      method: 'PUT'
    }).then(() => {
      this.loadBin();
    });
  }

  // ================= DELETE PERMANENT =================
  deletePermanent(lead: any) {
    if (!confirm('Delete permanently?')) return;

    fetch(`${environment.apiUrl}/api/leads/permanent/${lead.id}`, {
      method: 'DELETE'
    }).then(() => {
      this.loadBin();
    });
  }
}