import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import jsPDF from 'jspdf';
import { FormsModule } from '@angular/forms';
import { COURSES } from '../../data/courses.data';
import { ModalService } from '../../services/modal';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

interface Module {
  title: string;
  topics: string[];
  open?: boolean;
}

interface Question {
  text: string;
  level: 'Easy' | 'Medium' | 'Hard';
}

interface Course {
  id: string;
  name: string;
  curriculum: Module[];
  questions: Question[];
}

@Component({
  selector: 'app-curriculum',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './curriculum.html',
  styleUrl: './curriculum.css',
})
export class Curriculum {

  selectedCourseId = 'python';
  selectedBatchId = 1;
  selectedLevel = 'All';

  selectedCourse!: Course;

  // 🔒 LOCK STATE
  isUnlocked = false;

  constructor(private modalService: ModalService, private http: HttpClient) { }

  ngOnInit() {
    const unlocked = localStorage.getItem('courseUnlocked');
    if (unlocked === 'true') {
      this.isUnlocked = true;
    }
    this.loadCurriculum();
    this.checkUnlock();
  }

  // 🔥 LOAD FROM BACKEND
  loadCurriculum() {
    this.http.get<any>(
      `${environment.apiUrl}/api/trainer/dashboard/curriculum?batchId=${this.selectedBatchId}&courseId=${this.selectedCourseId}`
    ).subscribe(res => {

      if (res && res.jsonData) {
        this.selectedCourse = JSON.parse(res.jsonData);
      } else {
        console.warn('No curriculum found');
      }

      // close all modules initially
      this.selectedCourse?.curriculum?.forEach((m: Module) => m.open = false);
    });
  }

  toggleModule(clickedModule: Module) {
    this.selectedCourse.curriculum.forEach((m: Module) => {
      if (m === clickedModule) {
        m.open = !m.open; // toggle clicked one
      } else {
        m.open = false; // close others
      }
    });
  }

  filterQuestions(): Question[] {
    if (this.selectedLevel === 'All') return this.selectedCourse.questions;
    return this.selectedCourse.questions.filter((q: Question) => q.level === this.selectedLevel);
  }
  codingQuestions = Array.from({ length: 100 }, (_, i) => ({
    text: `Problem ${i + 1}: Solve real-world Java logic problem`,
    level: i < 30 ? 'Easy' : i < 70 ? 'Medium' : 'Hard',
  }));

  // 🔥 OPEN MODAL
  unlockQuestions() {
    this.modalService.open();
  }

  // 🔥 CALL THIS AFTER FORM SUCCESS
  unlockAfterRegister() {
    this.isUnlocked = true;
    localStorage.setItem('courseUnlocked', 'true');
  }

  enteredPhone = '';

  verifyAccess() {

    if (!this.enteredPhone) {
      alert('Enter phone number');
      return;
    }

    fetch(`${environment.apiUrl}/api/access/check?phone=${this.enteredPhone}`)
      .then(res => res.json())
      .then(data => {

        if (data.access) {

          this.isUnlocked = true;

          const unlockData = {
            status: true,
            time: new Date().getTime()
          };

          localStorage.setItem(
            `unlock_${this.selectedCourseId}`,
            JSON.stringify(unlockData)
          );

        } else {
          alert('Access not granted yet');
        }

      });
  }

  scrollToUnlock() {
    const el = document.querySelector('.locked-container');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }
  checkUnlock() {
    const data = localStorage.getItem(`unlock_${this.selectedCourseId}`);

    if (!data) {
      this.isUnlocked = false;
      return;
    }

    const parsed = JSON.parse(data);

    const now = new Date().getTime();
    const diff = now - parsed.time;

    const hours = diff / (1000 * 60 * 60);

    if (hours < 24 && parsed.status) {
      this.isUnlocked = true;
    } else {
      this.isUnlocked = false;
      localStorage.removeItem(`unlock_${this.selectedCourseId}`);
    }
  }

  downloadPDF() {
    this.checkUnlock(); // 🔥 re-check
    if (!this.isUnlocked) {
      alert('Please unlock access first');
      return;
    }
    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const marginX = 20;
    const maxWidth = pageWidth - 40;

    let y = 30;
    let pageNumber = 1;

    /* ================= COVER PAGE ================= */
    const addCoverPage = () => {
      /* ===== BACKGROUND ===== */
      doc.setFillColor(13, 110, 253);
      doc.rect(0, 0, pageWidth, pageHeight * 0.6, 'F');

      doc.setFillColor(20, 30, 60);
      doc.rect(0, pageHeight * 0.6, pageWidth, pageHeight * 0.4, 'F');

      /* ===== TOP BADGE ===== */
      doc.setFillColor(255, 193, 7);
      doc.roundedRect(pageWidth / 2 - 50, 15, 100, 10, 5, 5, 'F');

      doc.setTextColor(0);
      doc.setFontSize(10);
      doc.text('Industry Ready Program', pageWidth / 2, 22, { align: 'center' });

      /* ===== LOGO (BIGGER) ===== */
      try {
        doc.addImage(
          'VidhuraTechLogo.png',
          'PNG',
          pageWidth / 2 - 50, // center adjust
          25, // little up
          100, // 🔥 BIG WIDTH
          45, // 🔥 BIG HEIGHT
        );
      } catch { }

      /* ===== TITLE ===== */
      doc.setTextColor(255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(32);

      doc.text(this.selectedCourse.name + ' Course', pageWidth / 2, 85, { align: 'center' });

      /* ===== SUBTITLE ===== */
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');

      doc.text('Master Skills • Crack Interviews • Build Real Projects', pageWidth / 2, 100, {
        align: 'center',
      });

      /* ===== MAIN CARD ===== */
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(20, 115, pageWidth - 40, 90, 12, 12, 'F');

      /* ===== COLORFUL FEATURES ===== */
      const features = [
        { text: 'Core Concepts + Advanced Topics', color: [13, 110, 253] },
        { text: 'Real-time Coding Practice', color: [40, 167, 69] },
        { text: '100 Interview Questions', color: [255, 193, 7] },
        { text: 'Live Projects + Resume Building', color: [220, 53, 69] },
        { text: 'Placement Assistance & Career Support', color: [111, 66, 193] },
      ];

      let x = 30;
      let y = 130;

      features.forEach((f, i) => {
        // Box
        doc.setFillColor(...(f.color as [number, number, number]));
        doc.roundedRect(x, y, pageWidth - 60, 12, 6, 6, 'F');

        // Text
        doc.setTextColor(255);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');

        doc.text(f.text, pageWidth / 2, y + 8, { align: 'center' });

        y += 15;
      });

      /* ===== EXTRA INFO SECTION ===== */
      doc.setTextColor(80);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');

      doc.text(
        'Duration: 30–45 Days  |  Mode: Online / Offline  |  Level: Beginner to Advanced',
        pageWidth / 2,
        215,
        { align: 'center' },
      );

      /* ===== FOOTER BRANDING ===== */
      doc.setTextColor(255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');

      doc.text('vidhura Tech', pageWidth / 2, pageHeight - 30, { align: 'center' });

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      doc.text('www.vidhuratech.com', pageWidth / 2, pageHeight - 15, { align: 'center' });
    };

    /* ================= HEADER ================= */
    const addHeader = () => {
      doc.setFillColor(13, 110, 253);
      doc.rect(0, 0, pageWidth, 20, 'F');

      doc.setTextColor(255);
      doc.setFontSize(12);
      doc.text(this.selectedCourse?.name + ' Curriculum', 15, 12);

      try {
        doc.addImage('vidhuraTechLogo.png', 'PNG', pageWidth - 40, 3, 25, 12);
      } catch { }
    };

    /* ================= FOOTER ================= */
    const addFooter = () => {
      doc.setTextColor(120);
      doc.setFontSize(10);

      doc.text(`Page ${pageNumber}`, pageWidth - 30, pageHeight - 10);
      doc.text('vidhura Tech', 15, pageHeight - 10);
    };

    /* ================= WATERMARK ================= */
    const addWatermark = () => {
      doc.setTextColor(235);
      doc.setFontSize(50);

      doc.text(this.selectedCourse?.name.toUpperCase(), pageWidth / 2, pageHeight / 2, {
        align: 'center',
        angle: 45,
      });

      doc.setTextColor(0);
      doc.setFontSize(11);
    };

    /* ================= NEW PAGE ================= */
    const newPage = () => {
      doc.addPage();
      pageNumber++;

      doc.setFillColor(245, 247, 251);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');

      addHeader();
      addFooter();
      addWatermark();

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(0);

      y = 30;
    };

    /* ================= TEXT HELPER ================= */
    const addText = (text: string, size = 11, spacing = 6) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(size);
      doc.setTextColor(0);

      const lines = doc.splitTextToSize(text, maxWidth);

      lines.forEach((line: string) => {
        if (y > pageHeight - 20) newPage();

        doc.text(line, marginX, y);
        y += spacing;
      });
    };

    /* ================= SECTION HEADER ================= */
    const addSectionHeader = (text: string) => {
      doc.setFillColor(13, 110, 253);
      doc.roundedRect(15, y - 5, pageWidth - 30, 10, 3, 3, 'F');

      doc.setTextColor(255);
      doc.setFontSize(12);

      doc.text(text, 20, y + 2);

      y += 12;

      doc.setTextColor(0);
    };

    /* ================= FLOW START ================= */

    addCoverPage();

    doc.addPage();
    pageNumber = 1;

    doc.setFillColor(245, 247, 251);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    addHeader();
    addFooter();
    addWatermark();

    y = 30;

    addText('Complete Java Developer Syllabus', 18, 10);
    y += 5;

    /* ================= CURRICULUM (UPDATED) ================= */

    addSectionHeader('Course Curriculum');

    this.selectedCourse.curriculum.forEach((module: Module, index: number) => {
      // Module Title with NUMBERING
      doc.setTextColor(13, 110, 253);
      addText(`${index + 1}. ${module.title}`, 13, 7);

      // Topics
      doc.setTextColor(0);

      module.topics.forEach((topic: string, tIndex: number) => {
        addText(`   ${index + 1}.${tIndex + 1} ${topic}`, 10, 5);
      });

      y += 3;

      // Divider
      doc.setDrawColor(200);
      doc.line(20, y, pageWidth - 20, y);
      y += 5;
    });

    /* ================= CODING QUESTIONS (PREMIUM++) ================= */

    if (y > pageHeight - 60) {
      newPage();
    }

    addSectionHeader('Coding Questions');

    const colWidth = (pageWidth - 40) / 2;

    let colX1 = 20;
    let colX2 = 20 + colWidth + 10;

    let colY1 = y;
    let colY2 = y;

    let useLeft = true;

    doc.setFontSize(9);

    this.selectedCourse.questions.forEach((q: Question, i: number) => {
      const text = `${i + 1}.  ${q.text}`; // extra space after dot

      const lines = doc.splitTextToSize(text, colWidth - 12);

      const levelColor: [number, number, number] =
        q.level === 'Easy' ? [40, 167, 69] : q.level === 'Medium' ? [255, 193, 7] : [220, 53, 69];

      const requiredHeight = lines.length * 4 + 8;

      // ===== PAGE BREAK =====
      if (Math.max(colY1, colY2) + requiredHeight > pageHeight - 20) {
        newPage();
        addSectionHeader('Coding Questions');

        colY1 = y;
        colY2 = y;
      }

      const currentX = useLeft ? colX1 : colX2;
      const currentY = useLeft ? colY1 : colY2;

      /* ===== LEFT COLOR BORDER ===== */
      doc.setFillColor(...levelColor);
      doc.rect(currentX - 3, currentY - 2, 2, requiredHeight - 2, 'F');

      /* ===== TOP 20 HIGHLIGHT ===== */
      if (i < 20) {
        doc.setFillColor(255, 248, 220); // light gold
        doc.roundedRect(currentX, currentY - 2, colWidth - 5, requiredHeight, 3, 3, 'F');

        doc.setTextColor(200, 120, 0);
        doc.setFontSize(7);
        doc.text('TOP', currentX + colWidth - 18, currentY + 2);
      }

      /* ===== QUESTION TEXT ===== */
      doc.setTextColor(0);
      doc.setFontSize(9);

      lines.forEach((line: string, idx: number) => {
        doc.text(line, currentX + 2, currentY + idx * 4);
      });

      /* ===== LEVEL TAG ===== */
      doc.setTextColor(...levelColor);
      doc.setFontSize(8);

      doc.text(`(${q.level})`, currentX + colWidth - 25, currentY + requiredHeight - 3);

      /* ===== DIVIDER LINE ===== */
      doc.setDrawColor(220);
      doc.line(
        currentX,
        currentY + requiredHeight,
        currentX + colWidth - 5,
        currentY + requiredHeight,
      );

      /* ===== UPDATE COLUMN HEIGHT ===== */
      if (useLeft) {
        colY1 += requiredHeight + 2;
      } else {
        colY2 += requiredHeight + 2;
      }

      useLeft = !useLeft;
    });

    /* ================= SAVE ================= */
    const courseName = this.selectedCourse.name.replace(/\s+/g, '');
    const year = new Date().getFullYear();

    const fileName = `VidhuraTech_${courseName}_Curriculum_${year}.pdf`;

    doc.save(fileName);
  }
}
