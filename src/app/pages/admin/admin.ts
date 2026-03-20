import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin implements OnInit {

  leads: any[] = [];
  filteredLeads: any[] = [];

  searchText = '';
  selectedStatus = '';

  stats = {
    total: 0,
    new: 0,
    contacted: 0,
    joined: 0
  };

  apiUrl = "https://script.google.com/macros/s/AKfycbxmpbxdH5rj-z3fT29aAh-TrGVNneDej7MsUfz3O54HIJtrIW2dW0IGw4gact_0q7U/exec";

  ngOnInit() {
    this.loadLeads();
  }

  loadLeads() {

    fetch(this.apiUrl)
      .then(res => res.json())
      .then(data => {

        this.leads = data.map((item: any) => ({
          Date: item.Date,
          Name: item.Name,
          Phone: String(item.Phone),
          Email: item.Email,
          Course: item.Course,
          Batch: item.Batch,
          City: item.City,
          Status: 'New',
          FollowUp: '',

          // NEW 👇
          tempStatus: 'New',
          isChanged: false
        })).reverse();

        this.filteredLeads = [...this.leads];

        this.calculateStats();

      });

  }

  // 🔍 SEARCH + FILTER
  applyFilter() {

    this.filteredLeads = this.leads.filter(lead => {

      const matchSearch =
        lead.Name.toLowerCase().includes(this.searchText.toLowerCase()) ||
        lead.Phone.includes(this.searchText);

      const matchStatus =
        this.selectedStatus ? lead.Status === this.selectedStatus : true;

      return matchSearch && matchStatus;

    });

  }

  // 📊 STATS
  calculateStats() {

    this.stats.total = this.leads.length;
    this.stats.new = this.leads.filter(l => l.Status === 'New').length;
    this.stats.contacted = this.leads.filter(l => l.Status === 'Contacted').length;
    this.stats.joined = this.leads.filter(l => l.Status === 'Joined').length;

  }

  updateLead(lead: any) {

    const formData = new FormData();

    formData.append("action", "update");
    formData.append("phone", lead.Phone);
    formData.append("status", lead.tempStatus || lead.Status);
    formData.append("followUp", lead.FollowUp || "");

    fetch(this.apiUrl, {
      method: "POST",
      body: formData,
      mode: "no-cors"   // 🔥 FIX
    })
      .then(() => {
        console.log("Updated (no-cors)");
      })
      .catch(err => console.error(err));

  }

  // 🔄 Refresh
  refreshLeads() {
    this.loadLeads();
  }

  // When dropdown changes
  onStatusChange(lead: any) {
    lead.tempStatus = lead.Status;
    lead.isChanged = true;
  }

  // ✔ SAVE
  confirmUpdate(lead: any) {

    lead.Status = lead.tempStatus;
    lead.isChanged = false;

    this.updateLead(lead);
    this.calculateStats();

  }

  // ❌ CANCEL
  cancelUpdate(lead: any) {

    lead.tempStatus = lead.Status;
    lead.isChanged = false;

  }

  // 📤 Export CSV
  exportCSV() {

    const rows = this.leads.map(l =>
      `${l.Name},${l.Phone},${l.Course},${l.Status},${l.City}`
    );

    const csvContent = "data:text/csv;charset=utf-8," + rows.join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "leads.csv";
    link.click();
  }

  // 🔔 Today follow-ups count
  getTodayFollowups() {
    const today = new Date().toISOString().split('T')[0];

    return this.leads.filter(l => l.FollowUp === today).length;
  }
}