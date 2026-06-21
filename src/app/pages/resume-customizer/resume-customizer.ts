import { Component, inject, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ResumeService } from '../../services/resume.service';
import { ResumePreview } from '../../components/resume-preview/resume-preview';

@Component({
  selector: 'app-resume-customizer',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ResumePreview],
  templateUrl: './resume-customizer.html',
  styleUrl: './resume-customizer.css'
})
export class ResumeCustomizer implements OnInit {
  public service = inject(ResumeService);

  ngOnInit() {
    this.service.activeTab = 'customizer';
    if (typeof window !== 'undefined') {
      const body = document.body;
      if (body) {
        body.classList.add('resume-page-active');
      }
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    this.service.showPdfMenu = false;
    this.service.showTemplateDropdown = false;
  }

  togglePdfMenu(event: Event) {
    event.stopPropagation();
    this.service.showPdfMenu = !this.service.showPdfMenu;
  }

  selectTab(tab: string, section?: string) {
    this.service.selectWorkspaceTab(tab, section);
    this.service.showPdfMenu = false;
  }
}
