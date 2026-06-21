import { Component, inject, HostListener, NgZone, ChangeDetectorRef, DoCheck, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ResumeService } from '../../services/resume.service';

@Component({
  selector: 'app-resume-preview',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './resume-preview.html',
  styleUrl: './resume-preview.css',
  encapsulation: ViewEncapsulation.None
})
export class ResumePreview implements OnInit, DoCheck, OnDestroy {
  public service = inject(ResumeService);
  private zone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);

  // Delegations to the Shared Service
  get data() { return this.service.data; }
  get themeColor() { return this.service.themeColor; }
  get headingFont() { return this.service.headingFont; }
  get bodyFont() { return this.service.bodyFont; }
  get headingSize() { return this.service.headingSize; }
  get bodySize() { return this.service.bodySize; }
  get lineSpacing() { return this.service.lineSpacing; }
  get sectionSpacing() { return this.service.sectionSpacing; }
  get pageMargin() { return this.service.pageMargin; }
  get customSectionTitles() { return this.service.customSectionTitles; }
  get selectedTemplate() { return this.service.selectedTemplate; }
  get previewMode() { return this.service.previewMode; }
  get oldResumeText() { return this.service.oldResumeText; }
  get selectedSkills() { return this.service.selectedSkills; }
  get selectedLanguages() { return this.service.selectedLanguages; }
  get sections() { return this.service.sections; }
  get templates() { return this.service.templates; }
  get zoomLevel() { return this.service.zoomLevel; }
  get templateHeight() { return this.service.templateHeight; }
  get pageCount(): number {
    return Math.ceil((this.service.templateHeight || 1056) / 1056) || 1;
  }
  get customCssOverride() { return this.service.customCssOverride; }
  get uploadedFileName() { return this.service.uploadedFileName; }
  get userPlan() { return this.service.userPlan; }
  get headingStyle() { return this.service.headingStyle; }
  get subheadingStyle() { return this.service.subheadingStyle; }
  get dividerStyle() { return this.service.dividerStyle; }
  get bulletStyle() { return this.service.bulletStyle; }
  get dateFormat() { return this.service.dateFormat; }
  get skillsStyle() { return this.service.skillsStyle; }
  get headerLayout() { return this.service.headerLayout; }

  zoomIn() {
    this.service.zoomLevel = Math.min(1.5, this.service.zoomLevel + 0.1);
    this.cdr.detectChanges();
  }

  zoomOut() {
    this.service.zoomLevel = Math.max(0.2, this.service.zoomLevel - 0.1);
    this.cdr.detectChanges();
  }

  getTemplateDisplayName(id: string): string {
    const t = this.service.templates.find(x => x.id === id);
    return t ? t.name : 'Classic Standard';
  }



  formatDate(dateStr: string): string {
    return this.service.formatDate(dateStr);
  }

  getBulletPoints(text: string): string[] {
    return this.service.getBulletPoints(text);
  }

  getSectionLabel(id: string, defaultVal: string) {
    return (this.customSectionTitles as any)[id] || defaultVal;
  }

  getRenderTemplateId(id: string) {
    const t = this.templates.find(x => x.id === id);
    return t && t.baseLayout ? t.baseLayout : id;
  }

  isTemplateLocked(id: string) {
    return this.service.isTemplateLocked(id);
  }

  getTemplateTier(id: string): string {
    return this.service.getTemplateTier(id);
  }

  openUpgradeLink() {
    this.service.openUpgradeLink();
  }

  cancelUpgrade() {
    this.service.cancelUpgrade();
  }

  private lastCheckedState = '';
  private resizeObserver: any = null;
  private observedElement: Element | null = null;

  /* ================= LIFE CYCLE HOOKS ================= */
  ngOnInit() {
    this.autoFitZoom();
  }

  ngDoCheck() {
    const currentState = JSON.stringify({
      data: this.service.data,
      selectedSkills: this.service.selectedSkills,
      selectedLanguages: this.service.selectedLanguages,
      activeHighlights: Object.keys(this.service.selectedHighlights).filter(h => this.service.selectedHighlights[h]),
      style: this.service.highlightStyle,
      template: this.service.selectedTemplate,
      previewMode: this.service.previewMode
    });

    if (currentState !== this.lastCheckedState) {
      this.lastCheckedState = currentState;
      this.applyHighlightsToDOM();

      const parsedCurrent = JSON.parse(currentState);
      const parsedLast = this.lastCheckedState ? JSON.parse(this.lastCheckedState) : null;

      if (!parsedLast || parsedLast.previewMode !== parsedCurrent.previewMode || parsedLast.template !== parsedCurrent.template) {
        this.autoFitZoom();
      } else {
        this.updateTemplateHeight();
      }
    }

    this.setupResizeObserver();
  }

  setupResizeObserver() {
    if (typeof window === 'undefined' || typeof ResizeObserver === 'undefined') return;

    const templateEl = document.querySelector('.ats-resume-template');
    if (templateEl && templateEl !== this.observedElement) {
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
      }
      this.observedElement = templateEl;
      this.resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          const newHeight = (entry.target as HTMLElement).offsetHeight || 1056;
          if (this.service.templateHeight !== newHeight) {
            this.zone.run(() => {
              this.service.templateHeight = newHeight;
              this.cdr.detectChanges();
            });
          }
        }
      });
      this.resizeObserver.observe(templateEl);
    }
  }

  ngOnDestroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    try {
      this.cdr.reattach();
    } catch (e) {}
  }

  /* ================= AUTO-FIT PREVIEW ZOOM & INLINE EDITING ================= */
  autoFitZoom() {
    if (typeof window === 'undefined') return;
    setTimeout(() => {
      let zoomChanged = false;
      let heightChanged = false;

      const container = document.querySelector('.canvas-scroll-container');
      if (container) {
        const width = container.clientWidth;
        if (width > 0) {
          let calculatedZoom = (width - 32) / 816;
          const newZoom = Math.max(0.3, Math.min(1.2, calculatedZoom));
          if (Math.abs(this.service.zoomLevel - newZoom) > 0.01) {
            this.service.zoomLevel = newZoom;
            zoomChanged = true;
          }
        }
      }

      const templateEl = document.querySelector('.ats-resume-template');
      if (templateEl) {
        const newHeight = (templateEl as HTMLElement).offsetHeight || 1056;
        if (this.service.templateHeight !== newHeight) {
          this.service.templateHeight = newHeight;
          heightChanged = true;
        }
      }

      if (zoomChanged || heightChanged) {
        this.cdr.detectChanges();
      }
    }, 150);
  }

  updateTemplateHeight() {
    if (typeof document === 'undefined') return;
    setTimeout(() => {
      const templateEl = document.querySelector('.ats-resume-template');
      if (templateEl) {
        const newHeight = (templateEl as HTMLElement).offsetHeight || 1056;
        if (this.service.templateHeight !== newHeight) {
          this.service.templateHeight = newHeight;
          this.cdr.detectChanges();
        }
      }
    }, 200);
  }

  @HostListener('window:resize')
  onResize() {
    this.autoFitZoom();
  }

  @HostListener('click', ['$event'])
  onPreviewClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const previewContent = document.getElementById('preview-content');
    if (!previewContent || !previewContent.contains(target)) return;

    if (this.service.isTemplateLocked(this.service.selectedTemplate)) return;

    const editableTags = ['H1', 'H2', 'H3', 'H4', 'P', 'SPAN', 'LI', 'STRONG', 'B', 'MARK'];
    if (editableTags.includes(target.tagName) && !target.isContentEditable) {
      const originalText = target.innerText.trim();

      const icons = target.querySelectorAll('i');
      icons.forEach(i => i.setAttribute('contenteditable', 'false'));

      target.contentEditable = 'true';
      target.focus();

      this.cdr.detach();

      const onKeydown = (e: KeyboardEvent) => {
        if (e.key === 'Enter' && target.tagName !== 'P' && target.tagName !== 'LI') {
          e.preventDefault();
          target.blur();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          target.innerText = originalText;
          target.blur();
        }
      };

      const onBlur = () => {
        target.contentEditable = 'false';
        const newText = target.innerText.trim();

        this.cdr.reattach();
        this.service.syncPreviewTextToModel(originalText, newText);
        this.cdr.detectChanges();

        target.removeEventListener('blur', onBlur);
        target.removeEventListener('keydown', onKeydown);
      };

      target.addEventListener('blur', onBlur);
      target.addEventListener('keydown', onKeydown);
    }
  }

  applyHighlightsToDOM() {
    if (typeof document === 'undefined') return;

    setTimeout(() => {
      const container = document.getElementById('preview-content');
      if (!container) return;

      const activeHighlights = Object.keys(this.service.selectedHighlights).filter(
        (h) => this.service.selectedHighlights[h] && h.trim().length > 0
      );

      const walk = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);
      let node: Text;
      const nodesToReplace: { node: Text; parent: HTMLElement; newHTML: string }[] = [];

      while ((node = walk.nextNode() as Text)) {
        const parentNode = node.parentNode as HTMLElement;
        if (parentNode && (
          parentNode.classList.contains('hl-bg') ||
          parentNode.classList.contains('hl-bold') ||
          parentNode.classList.contains('hl-underline') ||
          parentNode.classList.contains('hl-border')
        )) {
          continue;
        }

        let text = node.nodeValue || '';
        let hasMatch = false;
        let tempText = text;

        activeHighlights.forEach((h) => {
          const escaped = h.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
          const regex = new RegExp(escaped, 'gi');
          if (regex.test(tempText)) {
            hasMatch = true;
            let replacement = '';
            if (this.service.highlightStyle === 'background') {
              replacement = `<mark class="hl-bg">$&</mark>`;
            } else if (this.service.highlightStyle === 'bold') {
              replacement = `<strong class="hl-bold">$&</strong>`;
            } else if (this.service.highlightStyle === 'underline') {
              replacement = `<span class="hl-underline">$&</span>`;
            } else if (this.service.highlightStyle === 'border') {
              replacement = `<span class="hl-border">$&</span>`;
            }
            tempText = tempText.replace(regex, replacement);
          }
        });

        if (hasMatch) {
          nodesToReplace.push({
            node: node,
            parent: parentNode,
            newHTML: tempText
          });
        }
      }

      nodesToReplace.forEach((item) => {
        if (!item.parent || !document.body.contains(item.parent)) return;
        const span = document.createElement('span');
        span.innerHTML = item.newHTML;

        while (span.firstChild) {
          item.parent.insertBefore(span.firstChild, item.node);
        }
        item.parent.removeChild(item.node);
      });
    }, 50);
  }
}
