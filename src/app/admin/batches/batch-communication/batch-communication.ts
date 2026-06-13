import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BatchLite, BatchCommunicationPayload, BatchCommunicationService } from '../services/batch-communication';
@Component({
  selector: 'app-batch-communication',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './batch-communication.html',
  styleUrls: ['./batch-communication.css']
})
export class BatchCommunicationComponent implements OnInit {
  loading = false;
  saving = false;
  message = '';
  messageType: 'success' | 'error' | '' = '';
  batches: BatchLite[] = [];
  selectedBatchId: number | null = null;
  form: BatchCommunicationPayload = {
    whatsappGroupLink: '',
    zoomJoinLink: '',
    zoomMeetingId: '',
    zoomPasscode: '',
    zoomSchedule: '',
    zoomTime: '',
    zoomCalendarLink: ''
  };
  get selectedBatchName(): string {
    return this.batches.find(b => b.id === this.selectedBatchId)?.name || '';
  }
  constructor(private service: BatchCommunicationService) {}
  ngOnInit(): void {
    this.loadBatches();
  }
  loadBatches() {
    this.loading = true;
    this.service.getBatches().subscribe({
      next: (res) => {
        this.batches = res || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.setMessage('Failed to load batches', 'error');
      }
    });
  }
  onBatchChange() {
    if (!this.selectedBatchId) return;
    this.loading = true;
    this.service.getBatchById(this.selectedBatchId).subscribe({
      next: (b) => {
        this.form = {
          whatsappGroupLink: b.whatsappGroupLink || '',
          zoomJoinLink: b.zoomJoinLink || '',
          zoomMeetingId: b.zoomMeetingId || '',
          zoomPasscode: b.zoomPasscode || '',
          zoomSchedule: b.zoomSchedule || '',
          zoomTime: b.zoomTime || '',
          zoomCalendarLink: b.zoomCalendarLink || ''
        };
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.setMessage('Failed to load batch communication data', 'error');
      }
    });
  }
  applySampleInvite() {
    this.form.zoomJoinLink = 'https://us06web.zoom.us/j/87114375458?pwd=k84SGuA0a0mXw6eFCoYtJcpjRbs9eo.1';
    this.form.zoomMeetingId = '871 1437 5458';
    this.form.zoomPasscode = '278110';
    this.form.zoomTime = '07:30 PM IST';
    this.form.zoomSchedule = 'Every day till Jun 15, 2026';
    this.form.zoomCalendarLink = 'https://us06web.zoom.us/meeting/tZMsdu2rqT4uH9wgCVQjq2RlbX7_3dawgTp3/ics?icsToken=DPzZzr_7WlADHUiuYQAALAAAAAJuy2AxzOnPdiZyJDH0bijnMAeErYgjeDZBKulb9uvv6jRsDTV74Nqj69_MVd5VO-dbiJuQRyP69wBAZTAwMDAwMQ&meetingMasterEventId=MkicPAKwR2utjCV-G7HViQ';
    this.setMessage('Sample Zoom details applied', 'success');
  }
  copyZoomInvite() {
    if (!this.form.zoomJoinLink && !this.form.zoomMeetingId) {
      this.setMessage('No Zoom details to copy', 'error');
      return;
    }
    const text = `✨ *Live Class Details for ${this.selectedBatchName || 'Batch'}* ✨\n\n` +
      (this.form.zoomSchedule ? `📅 *Schedule:* ${this.form.zoomSchedule}\n` : '') +
      (this.form.zoomTime ? `⏰ *Time:* ${this.form.zoomTime}\n` : '') +
      `🔗 *Zoom Join Link:* ${this.form.zoomJoinLink}\n` +
      `🆔 *Meeting ID:* ${this.form.zoomMeetingId}\n` +
      (this.form.zoomPasscode ? `🔑 *Passcode:* ${this.form.zoomPasscode}\n` : '') +
      (this.form.zoomCalendarLink ? `📅 *Calendar Link (.ics):* ${this.form.zoomCalendarLink}\n` : '') +
      `\nSee you in the class! 🚀`;

    navigator.clipboard.writeText(text).then(() => {
      this.setMessage('Zoom Invitation copied to clipboard!', 'success');
    }).catch(() => {
      this.setMessage('Failed to copy invitation', 'error');
    });
  }
  save() {
    if (!this.selectedBatchId) {
      this.setMessage('Please select batch', 'error');
      return;
    }
    if (!this.form.zoomJoinLink || !this.form.zoomMeetingId) {
      this.setMessage('Zoom Join Link and Meeting ID are required', 'error');
      return;
    }
    this.saving = true;
    this.service.updateCommunication(this.selectedBatchId, this.form).subscribe({
      next: () => {
        this.saving = false;
        this.setMessage('Batch communication updated successfully', 'success');
      },
      error: () => {
        this.saving = false;
        this.setMessage('Failed to update batch communication', 'error');
      }
    });
  }
  private setMessage(msg: string, type: 'success' | 'error') {
    this.message = msg;
    this.messageType = type;
    setTimeout(() => {
      this.message = '';
      this.messageType = '';
    }, 3500);
  }
}
