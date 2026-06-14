import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import jsPDF from 'jspdf';
import { FormsModule } from '@angular/forms';
import { COURSES } from '../../data/courses.data';
import { ModalService } from '../../services/modal';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { PublicCourseService } from '../courses/service/public-course';
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
  courses: any[] = [];
  selectedCourseId: any = null;
  selectedBatchId = 1;
  selectedLevel = 'All';
  selectedCourse!: any;
  loading = false;

  constructor(private modalService: ModalService,
    private http: HttpClient,
    private courseService: PublicCourseService) { }

  ngOnInit() {
    this.loading = true;
    this.courseService.getCourses(false).subscribe({
      next: (res: any) => {
        this.courses = res?.data || [];
        if (this.courses.length > 0) {
          this.selectedCourseId = this.courses[0].id;
          this.loadCurriculum();
        } else {
          this.fallbackToStatic();
        }
      },
      error: (err) => {
        console.warn('Failed to load dynamic courses, using static fallback:', err);
        this.fallbackToStatic();
      }
    });
  }

  fallbackToStatic() {
    this.courses = COURSES.map(c => ({
      id: c.id,
      title: c.name,
      name: c.name,
      description: '',
      level: 'BEGINNER',
      durationHours: 45
    }));
    if (this.courses.length > 0) {
      this.selectedCourseId = this.courses[0].id;
      this.loadCurriculum();
    }
  }

  loadCurriculum() {
    this.loading = true;
    
    // Check if it is a static string ID (like 'java', 'python')
    if (typeof this.selectedCourseId === 'string') {
      const staticCourse = COURSES.find(c => c.id === this.selectedCourseId);
      if (staticCourse) {
        this.selectedCourse = {
          id: staticCourse.id,
          name: staticCourse.name,
          title: staticCourse.name,
          curriculum: staticCourse.curriculum,
          questions: staticCourse.questions
        };
        this.selectedCourse?.curriculum?.forEach((m: Module) => m.open = false);
        if (this.selectedCourse?.curriculum?.length > 0) {
          this.selectedCourse.curriculum[0].open = true;
        }
        this.loading = false;
        return;
      }
    }

    // Fetch backend course curriculum dynamically
    this.http.get<any>(
      `${environment.apiUrl}/api/public/courses/${this.selectedCourseId}/curriculum`
    ).subscribe({
      next: (res) => {
        if (res && res.success && res.data) {
          const curriculumObj = res.data;
          let parsedData: any = {};
          try {
            parsedData = JSON.parse(curriculumObj.jsonData);
          } catch (e) {
            console.error('Error parsing curriculum JSON:', e);
          }

          const matchedCourse = this.courses.find(c => c.id === this.selectedCourseId);
          this.selectedCourse = {
            id: this.selectedCourseId,
            name: matchedCourse?.title || matchedCourse?.name || parsedData.name || 'Course Curriculum',
            title: matchedCourse?.title || matchedCourse?.name || parsedData.name || 'Course Curriculum',
            curriculum: parsedData.curriculum || [],
            questions: this.getStaticQuestionsForCourse(matchedCourse?.title || parsedData.name || '')
          };
        } else {
          this.loadStaticFallbackById();
        }
        this.selectedCourse?.curriculum?.forEach((m: Module) => m.open = false);
        if (this.selectedCourse?.curriculum?.length > 0) {
          this.selectedCourse.curriculum[0].open = true;
        }
        this.loading = false;
      },
      error: (err) => {
        console.warn('Could not fetch backend curriculum, using static fallback:', err);
        this.loadStaticFallbackById();
        this.selectedCourse?.curriculum?.forEach((m: Module) => m.open = false);
        if (this.selectedCourse?.curriculum?.length > 0) {
          this.selectedCourse.curriculum[0].open = true;
        }
        this.loading = false;
      }
    });
  }

  loadStaticFallbackById() {
    const matchedCourse = this.courses.find(c => c.id === this.selectedCourseId);
    const title = (matchedCourse?.title || matchedCourse?.name || '').toLowerCase();
    let staticId = 'java';
    if (title.includes('python')) {
      staticId = 'python';
    } else if (title.includes('devops') || title.includes('cloud')) {
      staticId = 'devops';
    }
    const localCourse = COURSES.find(c => c.id === staticId) || COURSES[0];
    this.selectedCourse = {
      id: this.selectedCourseId,
      name: matchedCourse?.title || matchedCourse?.name || localCourse.name,
      title: matchedCourse?.title || matchedCourse?.name || localCourse.name,
      curriculum: localCourse.curriculum,
      questions: localCourse.questions
    };
  }

  getStaticQuestionsForCourse(courseName: string): Question[] {
    const nameLower = (courseName || '').toLowerCase();
    if (nameLower.includes('python')) {
      const pythonCourse = COURSES.find(c => c.id === 'python');
      return pythonCourse ? pythonCourse.questions : [];
    } else if (nameLower.includes('devops') || nameLower.includes('cloud')) {
      const devopsCourse = COURSES.find(c => c.id === 'devops');
      return devopsCourse ? devopsCourse.questions : [];
    }
    // Default/fallback to Java questions
    const javaCourse = COURSES.find(c => c.id === 'java');
    return javaCourse ? javaCourse.questions : [];
  }

  getCourseIconClass(c: any): string {
    const title = (c.title || c.name || '').toLowerCase();
    if (title.includes('java')) return 'java';
    if (title.includes('python')) return 'python';
    if (title.includes('react')) return 'react';
    if (title.includes('devops') || title.includes('cloud')) return 'devops';
    return 'generic';
  }

  getCourseIcon(c: any): string {
    const title = (c.title || c.name || '').toLowerCase();
    if (title.includes('java')) return 'fa-brands fa-java';
    if (title.includes('python')) return 'fa-brands fa-python';
    if (title.includes('react')) return 'fa-brands fa-react';
    if (title.includes('devops') || title.includes('cloud')) return 'fa-solid fa-cloud';
    return 'fa-solid fa-graduation-cap';
  }

  requestCurriculumConsultation(courseName: string) {
    const message = `Hello Vidhura Tech, I am interested in enrolling in the "${courseName}" course. Please share the details regarding upcoming batches, course fees, and career support.`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/919108057464?text=${encoded}`, '_blank');
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

  unlockQuestions() {
    this.modalService.open();
  }
  downloadPDF() {
    this.generatePDF('download');
  }

  previewPDF() {
    this.generatePDF('preview');
  }

  generatePDF(action: 'download' | 'preview') {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginX = 20;
    const maxWidth = pageWidth - 40;
    let y = 30;
    let pageNumber = 1;

    /* ================= DYNAMIC THEMING SETUP ================= */
    const courseTitle = (this.selectedCourse.name || '').toLowerCase();
    let themeColor: [number, number, number] = [13, 110, 253]; // Royal Blue
    let themeAccent: [number, number, number] = [245, 158, 11]; // Gold

    if (courseTitle.includes('python')) {
      themeColor = [20, 184, 166]; // Teal
      themeAccent = [55, 118, 171]; // Python Blue
    } else if (courseTitle.includes('devops') || courseTitle.includes('cloud')) {
      themeColor = [139, 92, 246]; // Purple
      themeAccent = [79, 70, 229]; // Indigo
    }

    /* ================= DYNAMIC MULTI-COLORED VECTOR ICON HELPERS ================= */
    const drawCheckmarkCircle = (x: number, y: number, circleColor = themeColor, checkColor = [255, 255, 255]) => {
      doc.setFillColor(circleColor[0], circleColor[1], circleColor[2]);
      doc.circle(x + 2.5, y + 2.5, 2.5, 'F');
      doc.setDrawColor(checkColor[0], checkColor[1], checkColor[2]);
      doc.setLineWidth(0.5);
      doc.line(x + 1.3, y + 2.5, x + 2.1, y + 3.3);
      doc.line(x + 2.1, y + 3.3, x + 3.7, y + 1.5);
    };

    const drawClock = (x: number, y: number) => {
      doc.setDrawColor(themeColor[0], themeColor[1], themeColor[2]);
      doc.setLineWidth(0.6);
      doc.setFillColor(255, 255, 255);
      doc.circle(x + 3, y + 3, 2.5, 'FD');
      doc.setDrawColor(themeAccent[0], themeAccent[1], themeAccent[2]);
      doc.setLineWidth(0.5);
      doc.line(x + 3, y + 3, x + 3, y + 1.6); // Hour hand
      doc.line(x + 3, y + 3, x + 4.2, y + 3); // Minute hand
    };

    const drawCode = (x: number, y: number) => {
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(themeColor[0], themeColor[1], themeColor[2]);
      doc.setLineWidth(0.5);
      doc.roundedRect(x, y + 0.5, 6, 5, 1, 1, 'FD');
      // Accent brackets `<>`
      doc.setDrawColor(themeAccent[0], themeAccent[1], themeAccent[2]);
      doc.setLineWidth(0.4);
      doc.line(x + 1.6, y + 3, x + 2.6, y + 1.8);
      doc.line(x + 1.6, y + 3, x + 2.6, y + 4.2);
      doc.line(x + 4.4, y + 3, x + 3.4, y + 1.8);
      doc.line(x + 4.4, y + 3, x + 3.4, y + 4.2);
    };

    const drawGraduationCap = (x: number, y: number) => {
      doc.setFillColor(themeColor[0], themeColor[1], themeColor[2]);
      doc.triangle(x + 3, y + 0.8, x, y + 2.8, x + 6, y + 2.8, 'F');
      // Accent tassel
      doc.setDrawColor(themeAccent[0], themeAccent[1], themeAccent[2]);
      doc.setLineWidth(0.4);
      doc.line(x + 3, y + 1.8, x + 5, y + 3.2);
      doc.line(x + 5, y + 3.2, x + 5, y + 4.4);
      // Base
      doc.setFillColor(100, 116, 139);
      doc.rect(x + 1.5, y + 3.2, 3, 1.4, 'F');
    };

    const drawBriefcase = (x: number, y: number) => {
      doc.setFillColor(themeColor[0], themeColor[1], themeColor[2]);
      doc.roundedRect(x, y + 1.6, 6, 3.8, 0.8, 0.8, 'F');
      // Accent handle
      doc.setDrawColor(themeAccent[0], themeAccent[1], themeAccent[2]);
      doc.setLineWidth(0.5);
      doc.line(x + 2, y + 1.6, x + 2, y + 0.6);
      doc.line(x + 2, y + 0.6, x + 4, y + 0.6);
      doc.line(x + 4, y + 0.6, x + 4, y + 1.6);
      // Accent locks
      doc.setFillColor(themeAccent[0], themeAccent[1], themeAccent[2]);
      doc.circle(x + 1.5, y + 3, 0.4, 'F');
      doc.circle(x + 4.5, y + 3, 0.4, 'F');
    };

    const drawPhone = (x: number, y: number) => {
      doc.setFillColor(34, 197, 94); // WhatsApp green phone body
      doc.roundedRect(x + 1, y, 4, 6, 0.8, 0.8, 'F');
      doc.setFillColor(255, 255, 255);
      doc.rect(x + 1.5, y + 0.8, 3, 4.2, 'F');
      doc.setFillColor(34, 197, 94);
      doc.circle(x + 3, y + 5.4, 0.35, 'F');
    };

    const drawGlobe = (x: number, y: number) => {
      doc.setDrawColor(14, 165, 233); // Blue globe outline
      doc.setLineWidth(0.5);
      doc.circle(x + 3, y + 3, 2.5, 'S');
      doc.line(x + 0.5, y + 3, x + 5.5, y + 3); // equator
      doc.ellipse(x + 3, y + 3, 1.2, 2.5, 'S'); // longitudinal curves
    };

    const drawProjectFolder = (x: number, y: number) => {
      doc.setFillColor(themeAccent[0], themeAccent[1], themeAccent[2]); // Folder tab
      doc.rect(x, y + 0.5, 2.5, 1.5, 'F');
      doc.setFillColor(themeColor[0], themeColor[1], themeColor[2]); // Folder body
      doc.roundedRect(x, y + 1.5, 6, 4, 0.6, 0.6, 'F');
      doc.setFillColor(255, 255, 255); // White paper sheet
      doc.rect(x + 1.5, y + 1, 3, 2, 'F');
      doc.setFillColor(themeColor[0], themeColor[1], themeColor[2]);
      doc.rect(x + 1.5, y + 2.2, 3, 3.3, 'F');
    };

    const drawGuaranteeSeal = (x: number, y: number) => {
      // Red ribbon tails
      doc.setFillColor(220, 38, 38);
      doc.triangle(x + 3, y + 6, x + 1, y + 12, x + 3.5, y + 10, 'F');
      doc.triangle(x + 5, y + 6, x + 7, y + 12, x + 4.5, y + 10, 'F');
      // Gold seal body
      doc.setFillColor(245, 158, 11);
      doc.circle(x + 4, y + 5, 4, 'F');
      doc.setDrawColor(217, 119, 6);
      doc.setLineWidth(0.4);
      doc.circle(x + 4, y + 5, 3.3, 'S');
      // Seal typography
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(3.8);
      doc.setFont('helvetica', 'bold');
      doc.text('100%', x + 4, y + 4.4, { align: 'center' });
      doc.text('VERIFIED', x + 4, y + 6.0, { align: 'center' });
    };

    const drawTopicTag = (tx: number, ty: number, label: string, colorRGB: [number, number, number]) => {
      doc.setFillColor(colorRGB[0], colorRGB[1], colorRGB[2]);
      doc.roundedRect(tx, ty, 15, 4, 1.2, 1.2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'bold');
      doc.text(label, tx + 7.5, ty + 3, { align: 'center' });
    };

    /* ================= PIPELINE ROADMAP FLOWCHART DIAGRAM ================= */
    const drawRoadmapDiagram = (dy: number) => {
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(15, dy, pageWidth - 30, 26, 3, 3, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.4);
      doc.roundedRect(15, dy, pageWidth - 30, 26, 3, 3, 'S');
      
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text('LEARNING PIPELINE & ROADMAP FLOWCHART', 20, dy + 6);

      let nodes: { label: string; desc: string; color: [number, number, number] }[] = [];
      
      if (courseTitle.includes('devops') || courseTitle.includes('cloud')) {
        nodes = [
          { label: 'GIT', desc: 'Version Control', color: [249, 115, 22] },
          { label: 'DOCKER', desc: 'Containerize', color: [20, 184, 166] },
          { label: 'JENKINS', desc: 'CI/CD Pipeline', color: themeColor },
          { label: 'K8S / AWS', desc: 'Orchestration', color: [139, 92, 246] }
        ];
      } else if (courseTitle.includes('python')) {
        nodes = [
          { label: 'SYNTAX', desc: 'Foundations', color: [55, 118, 171] },
          { label: 'OOP / LIB', desc: 'Logic Blocks', color: themeAccent },
          { label: 'FASTAPI', desc: 'Web Backend', color: themeColor },
          { label: 'DEPLOY', desc: 'AWS / Docker', color: [30, 41, 59] }
        ];
      } else {
        nodes = [
          { label: 'CORE JAVA', desc: 'Foundations', color: themeAccent },
          { label: 'COLLECTIONS', desc: 'Data Structs', color: themeColor },
          { label: 'SPRING BOOT', desc: 'Microservices', color: [34, 197, 94] },
          { label: 'DOCKER', desc: 'Deployments', color: [139, 92, 246] }
        ];
      }

      // Draw the nodes horizontally
      const startX = 22;
      const spacingX = (pageWidth - 44 - 28) / (nodes.length - 1);
      
      nodes.forEach((node, idx) => {
        const nx = startX + (idx * spacingX);
        const ny = dy + 10;
        
        // Draw connecting arrow to next node
        if (idx < nodes.length - 1) {
          const arrowStartX = nx + 28;
          const arrowEndX = nx + spacingX - 2;
          doc.setDrawColor(203, 213, 225);
          doc.setLineWidth(0.6);
          doc.line(arrowStartX, ny + 5, arrowEndX, ny + 5);
          // Arrow head
          doc.line(arrowEndX - 1.5, ny + 4, arrowEndX, ny + 5);
          doc.line(arrowEndX - 1.5, ny + 6, arrowEndX, ny + 5);
        }

        // Draw node box
        doc.setFillColor(node.color[0], node.color[1], node.color[2]);
        doc.roundedRect(nx, ny, 28, 10, 1.5, 1.5, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.text(node.label, nx + 14, ny + 4, { align: 'center' });
        
        doc.setTextColor(100, 116, 139);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.text(node.desc, nx + 14, ny + 8.2, { align: 'center' });
      });
    };

    /* ================= COVER PAGE (PREMIUM DARK & VIBRANT EDITION) ================= */
    const addCoverPage = () => {
      // 1. Base Background - Deep Dark Slate (Luxury look)
      doc.setFillColor(15, 23, 42); // #0f172a
      doc.rect(0, 0, pageWidth, pageHeight, 'F');

      // 2. Large Glowing Accent Polygons (Background Art)
      // Top-right glowing shape (Theme color)
      doc.setFillColor(themeColor[0], themeColor[1], themeColor[2]);
      doc.triangle(pageWidth, 0, pageWidth - 90, 0, pageWidth, 90, 'F');

      // Bottom-left glowing shape (Accent color)
      doc.setFillColor(themeAccent[0], themeAccent[1], themeAccent[2]);
      doc.triangle(0, pageHeight, 90, pageHeight, 0, pageHeight - 90, 'F');

      // Top right minor polygon
      doc.setFillColor(themeAccent[0], themeAccent[1], themeAccent[2]);
      doc.triangle(pageWidth, 0, pageWidth - 30, 0, pageWidth, 30, 'F');

      // Draw a thin border inside the page
      doc.setDrawColor(themeColor[0], themeColor[1], themeColor[2]);
      doc.setLineWidth(0.6);
      doc.rect(8, 8, pageWidth - 16, pageHeight - 16, 'S');

      // 3. Logo Design (Real Logo with Fallback)
      const logoX = 25;
      const logoY = 28;

      let logoImg: HTMLImageElement | null = null;
      const existingLogo = document.querySelector('img[src*="VidhuraTechLogo"]') as HTMLImageElement;
      if (existingLogo && existingLogo.complete && existingLogo.naturalWidth !== 0) {
        logoImg = existingLogo;
      }

      if (logoImg) {
        // Draw the real logo image
        doc.addImage(logoImg, 'PNG', logoX, logoY - 3, 16, 16);
      } else {
        // Fallback programmatically drawn logo
        doc.setDrawColor(themeColor[0], themeColor[1], themeColor[2]);
        doc.setLineWidth(1);
        doc.circle(logoX + 8, logoY + 8, 9, 'S');

        doc.setFillColor(themeColor[0], themeColor[1], themeColor[2]);
        doc.triangle(logoX + 8, logoY + 2, logoX + 2, logoY + 12, logoX + 14, logoY + 12, 'F');
        
        doc.setFillColor(themeAccent[0], themeAccent[1], themeAccent[2]);
        doc.circle(logoX + 8, logoY + 9, 2.5, 'F');
      }
      
      // Logo Typography
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('vidhura Tech', logoX + 22, logoY + 7);
      
      doc.setFillColor(themeAccent[0], themeAccent[1], themeAccent[2]);
      doc.circle(logoX + 68, logoY + 4, 1.8, 'F'); // glowing dot

      doc.setTextColor(148, 163, 184); // Slate 400
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('ACADEMY FOR ADVANCED DIGITAL SKILLS', logoX + 22, logoY + 12);

      // Horizontal separator line under branding
      doc.setDrawColor(51, 65, 85); // Slate 700
      doc.setLineWidth(0.5);
      doc.line(25, logoY + 18, pageWidth - 25, logoY + 18);

      /* ===== MAIN SYLLABUS BADGE ===== */
      doc.setFillColor(themeColor[0], themeColor[1], themeColor[2]);
      doc.roundedRect(25, logoY + 26, 62, 8, 1.5, 1.5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.text('PREMIUM CURRICULUM BLUEPRINT', 56, logoY + 31.2, { align: 'center' });

      /* ===== MAIN TITLE ===== */
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(28);
      const titleText = (this.selectedCourse.name || 'Course').toUpperCase();
      const titleLines = doc.splitTextToSize(titleText, pageWidth - 50);
      let titleY = logoY + 45;
      titleLines.forEach((line: string) => {
        doc.text(line, 25, titleY);
        titleY += 10;
      });

      /* ===== SUBTITLE ===== */
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text('A comprehensive, industry-validated syllabus designed by master software engineers.', 25, titleY + 2);

      // Secondary horizontal line
      doc.setDrawColor(51, 65, 85);
      doc.setLineWidth(0.5);
      doc.line(25, titleY + 10, pageWidth - 25, titleY + 10);

      /* ===== HIGHLIGHTS GRID (4 Premium Dark Cards) ===== */
      const gridStartY = titleY + 18;
      const cardW = 76;
      const cardH = 34;
      const cardX1 = 25;
      const cardX2 = pageWidth - 25 - cardW;

      // Card Helper
      const drawPremiumCard = (cx: number, cy: number, iconDrawer: (x: number, y: number) => void, title: string, value: string, details: string) => {
        // Card Background
        doc.setFillColor(30, 41, 59); // Slate 800
        doc.roundedRect(cx, cy, cardW, cardH, 3, 3, 'F');
        doc.setDrawColor(71, 85, 105); // Slate 600 border
        doc.setLineWidth(0.4);
        doc.roundedRect(cx, cy, cardW, cardH, 3, 3, 'S');
        
        // Icon Circle
        doc.setFillColor(15, 23, 42); // Slate 900
        doc.circle(cx + 8, cy + 9, 6, 'F');
        iconDrawer(cx + 5, cy + 6);

        // Text
        doc.setTextColor(148, 163, 184);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.text(title, cx + 18, cy + 7);

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.text(value, cx + 18, cy + 13);

        doc.setTextColor(148, 163, 184);
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        const descLines = doc.splitTextToSize(details, cardW - 24);
        descLines.forEach((l: string, idx: number) => {
          doc.text(l, cx + 18, cy + 19 + (idx * 3.5));
        });
      };

      // Card 1: Duration
      drawPremiumCard(cardX1, gridStartY, (x, y) => drawClock(x, y), 'PROGRAM DURATION', '45 Days / 120+ Hours', 'Intensive training, live lab coding sessions, and continuous support.');

      // Card 2: Coding Exercises
      drawPremiumCard(cardX2, gridStartY, (x, y) => drawCode(x, y), 'PRACTICAL CODING LABS', '150+ Coding Exercises', 'Interactive coding problems covering algorithms, operations, and architectures.');

      // Card 3: Depth
      drawPremiumCard(cardX1, gridStartY + cardH + 6, (x, y) => drawGraduationCap(x, y), 'LEARNING DEPTH', 'Beginner to Professional', 'Starts from core concepts and extends to advanced real-world implementations.');

      // Card 4: Target
      drawPremiumCard(cardX2, gridStartY + cardH + 6, (x, y) => drawBriefcase(x, y), 'CAREER TARGET', 'Industry Ready Engineer', 'Curated profile building, automated mock interviews, and placement references.');

      /* ===== BOTTOM BRANDING DETAILS ===== */
      const footerY = pageHeight - 35;
      
      // Draw a seal or quality badge
      drawGuaranteeSeal(25, footerY - 5);
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('100% VERIFIED ACADEMY CURRICULUM', 42, footerY - 1);
      
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('Aligned with latest industry frameworks and real-world deployment pipelines.', 42, footerY + 3.5);

      // Contact detail row
      doc.setFillColor(30, 41, 59);
      doc.roundedRect(25, footerY + 11, pageWidth - 50, 10, 2, 2, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.text('WEB PORTAL: www.vidhuratech.com   |   EMAIL: support@vidhuratech.com   |   HOTLINE: +91 91080 57464', pageWidth / 2, footerY + 17.5, { align: 'center' });
    };

    /* ================= HEADER ================= */
    const addHeader = () => {
      // Dark slate top header bar
      doc.setFillColor(themeColor[0], themeColor[1], themeColor[2]);
      doc.rect(0, 0, pageWidth, 12, 'F');

      // Thin accent bottom line
      doc.setFillColor(themeAccent[0], themeAccent[1], themeAccent[2]);
      doc.rect(0, 11.5, pageWidth, 0.5, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text((this.selectedCourse?.name || 'Syllabus').toUpperCase() + '  |  OFFICIAL CURRICULUM', 15, 7.5);
      
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('vidhura Tech', pageWidth - 34, 7.5);
      doc.setFillColor(themeAccent[0], themeAccent[1], themeAccent[2]);
      doc.circle(pageWidth - 12, 6.8, 0.8, 'F');
    };

    /* ================= FOOTER ================= */
    const addFooter = () => {
      // Dark slate bottom footer bar
      doc.setFillColor(15, 23, 42); // Slate 900
      doc.rect(0, pageHeight - 12, pageWidth, 12, 'F');

      // Thin accent top line
      doc.setFillColor(themeAccent[0], themeAccent[1], themeAccent[2]);
      doc.rect(0, pageHeight - 12, pageWidth, 0.5, 'F');

      doc.setTextColor(148, 163, 184); // Slate 400
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text('Vidhura Tech Academy  •  Empowering Through Skills', 15, pageHeight - 4.5);
      doc.text(`Page ${pageNumber}`, pageWidth - 25, pageHeight - 4.5);
    };

    /* ================= WATERMARK ================= */
    const addWatermark = () => {
      doc.setTextColor(242, 245, 249);
      doc.setFontSize(32);
      doc.setFont('helvetica', 'bold');
      doc.text('VIDHURA TECH ACADEMY', pageWidth / 2, pageHeight / 2, {
        align: 'center',
        angle: 45,
      });
    };

    /* ================= NEW PAGE ================= */
    const newPage = () => {
      doc.addPage();
      pageNumber++;
      doc.setFillColor(248, 250, 252);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
      addHeader();
      addFooter();
      addWatermark();
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      y = 20;
    };

    /* ================= WEEKLY CARD DRAWER ================= */
    const drawWeeklyCard = (index: number, module: Module, startY: number): number => {
      const rowSpacing = 2.5;
      const paddingT = 4;
      const paddingB = 4;
      const rightColW = pageWidth - 30 - 36; // 144 mm
      
      let rightH = paddingT + paddingB;
      const parsedTopics: { day: string; text: string }[] = [];
      
      module.topics.forEach((topic: string, tIdx: number) => {
        const parts = topic.includes(':') ? [topic.substring(0, topic.indexOf(':')).trim(), topic.substring(topic.indexOf(':') + 1).trim()] : [`Day ${index * 7 + tIdx + 1}`, topic];
        const dayLabel = parts[0].replace('Day ', 'DAY ');
        const topicText = parts[1];
        
        const topicLines = doc.splitTextToSize(topicText, rightColW - 22);
        const cellH = Math.max(8, topicLines.length * 3.5 + 2);
        
        parsedTopics.push({ day: dayLabel, text: topicText });
        rightH += cellH + rowSpacing;
      });
      
      const cardH = Math.max(34, rightH - rowSpacing);
      
      // Page wrap check (Max Y before overflow is 270 since footer is at 285)
      if (startY + cardH > 270) {
        newPage();
        startY = 20; // reset
      }
      
      const cardX = 15;
      const cardY = startY;
      
      // Draw outer card shadow border
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(cardX, cardY, pageWidth - 30, cardH, 2, 2, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.4);
      doc.roundedRect(cardX, cardY, pageWidth - 30, cardH, 2, 2, 'S');

      // Draw Left Column - Solid Theme Color Banner
      doc.setFillColor(themeColor[0], themeColor[1], themeColor[2]);
      doc.roundedRect(cardX + 0.2, cardY + 0.2, 34, cardH - 0.4, 2, 2, 'F');
      doc.rect(cardX + 20, cardY + 0.2, 14.2, cardH - 0.4, 'F'); // flatten right side

      // Left Column Text
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      
      // Giant Week Number
      doc.setFontSize(22);
      doc.text(`0${index + 1}`, cardX + 17, cardY + cardH / 2 + 1.2, { align: 'center' });
      
      // Week Title Label
      doc.setFontSize(8);
      doc.text('WEEK', cardX + 17, cardY + cardH / 2 - 8, { align: 'center' });
      doc.text('PLAN', cardX + 17, cardY + cardH / 2 + 7, { align: 'center' });

      // Draw Right Column Topics
      const rightX = cardX + 36;
      let topicY = cardY + paddingT;
      
      parsedTopics.forEach((pt, tIdx) => {
        const topicLines = doc.splitTextToSize(pt.text, rightColW - 22);
        const cellH = Math.max(8, topicLines.length * 3.5 + 2);

        // Draw topic capsule background
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(rightX, topicY, rightColW - 6, cellH, 1, 1, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(rightX, topicY, rightColW - 6, cellH, 1, 1, 'S');

        // Draw left accent colored bar
        doc.setFillColor(themeColor[0], themeColor[1], themeColor[2]);
        doc.rect(rightX + 0.2, topicY + 0.2, 1.2, cellH - 0.4, 'F');

        // Day badge label
        doc.setTextColor(themeColor[0], themeColor[1], themeColor[2]);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.text(pt.day, rightX + 4, topicY + cellH / 2 + 1.2);

        // Topic name text
        doc.setTextColor(15, 23, 42);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        
        topicLines.forEach((line: string, lIdx: number) => {
          doc.text(line, rightX + 20, topicY + 3.2 + (lIdx * 3.5));
        });

        // Add Capstone or Project Badge on topic right margin if applicable
        const topicLower = pt.text.toLowerCase();
        let tagLabel = '';
        let tagColor: [number, number, number] = [0, 0, 0];
        if (topicLower.includes('project') || topicLower.includes('case study')) {
          tagLabel = 'PROJECT';
          tagColor = [239, 68, 68];
        } else if (topicLower.includes('practice') || topicLower.includes('hands-on') || topicLower.includes('lab')) {
          tagLabel = 'LAB';
          tagColor = [20, 184, 166];
        }
        
        if (tagLabel) {
          drawTopicTag(rightX + rightColW - 22, topicY + cellH / 2 - 2, tagLabel, tagColor);
        }

        topicY += cellH + rowSpacing;
      });

      return cardH;
    };

    /* ================= FLOW START ================= */
    addCoverPage();
    
    // Page 2: Curriculum Start
    doc.addPage();
    pageNumber = 1;
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    addHeader();
    addFooter();
    addWatermark();
    
    y = 20;
    
    // Title inside page body
    doc.setFillColor(themeColor[0], themeColor[1], themeColor[2]);
    doc.rect(15, y, 4, 8, 'F');
    
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('Course Curriculum Breakdown', 22, y + 6);
    
    y += 10;

    // Draw the roadmap pipeline flowchart!
    drawRoadmapDiagram(y);
    y += 28;

    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.text('A structured weekly learning layout designed by professional industry mentors.', 15, y);
    y += 8;

    /* ================= RENDERING TIMELINE CARDS ================= */
    this.selectedCourse.curriculum.forEach((module: Module, index: number) => {
      const cardH = drawWeeklyCard(index, module, y);
      y = y + cardH + 6;
    });    /* ================= COURSE DETAILS & SERVICES (NEW PAGE) ================= */
    newPage();

    // Corner decorative graphics (soft pastel tints)
    doc.setFillColor(240, 246, 255); // light blue
    doc.triangle(pageWidth, 0, pageWidth - 40, 0, pageWidth, 40, 'F');
    doc.setFillColor(254, 243, 199); // light gold
    doc.triangle(0, pageHeight, 40, pageHeight, 0, pageHeight - 40, 'F');

    // Thin outer page border matching internal pages
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.rect(8, 8, pageWidth - 16, pageHeight - 16, 'S');

    // Soft header bar
    doc.setFillColor(themeColor[0], themeColor[1], themeColor[2]);
    doc.rect(15, 30, 4, 8, 'F');

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('Program Highlights & Services', 22, 36);

    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.text('Key competencies, career placement pipelines, and enrollment details.', 22, 41.5);

    y = 47;

    // Grid Layout for Capabilities & Career Support (Height: 58)
    const boxW = 87;
    const boxH = 58;
    const boxY = y;
    
    // Tints for Card Backgrounds (Extremely Colorful!)
    let leftCardBg: [number, number, number] = [240, 246, 255]; // soft blue-50
    let leftBorderColor: [number, number, number] = themeColor;
    if (courseTitle.includes('python')) {
      leftCardBg = [240, 253, 250]; // soft teal-50
      leftBorderColor = [20, 184, 166];
    } else if (courseTitle.includes('devops') || courseTitle.includes('cloud')) {
      leftCardBg = [245, 243, 255]; // soft purple-50
      leftBorderColor = [139, 92, 246];
    }
    const rightCardBg: [number, number, number] = [255, 251, 235]; // soft amber-50
    const rightBorderColor: [number, number, number] = themeAccent;

    // Left Box: Capabilities
    doc.setFillColor(leftCardBg[0], leftCardBg[1], leftCardBg[2]);
    doc.roundedRect(15, boxY, boxW, boxH, 3, 3, 'F');
    doc.setDrawColor(leftBorderColor[0], leftBorderColor[1], leftBorderColor[2]);
    doc.setLineWidth(0.5);
    doc.roundedRect(15, boxY, boxW, boxH, 3, 3, 'S');

    // Left Box Header Strip
    doc.setFillColor(leftBorderColor[0], leftBorderColor[1], leftBorderColor[2]);
    doc.roundedRect(15.2, boxY + 0.2, boxW - 0.4, 9, 3, 3, 'F');
    doc.rect(15.2, boxY + 5, boxW - 0.4, 4.2, 'F');

    // Draw Cap/Star Icon on Header Left
    drawGraduationCap(19, boxY + 2);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text('CORE COMPETENCIES ACQUIRED', 28, boxY + 6.2);

    const capabilities = [
      'Core Programming & Architectural Patterns',
      'Advanced Object-Oriented Principles (OOPs)',
      'Data Structures & Collection Frameworks',
      'Relational Databases & Dynamic API Connectors',
      'Production-Grade Deployment Architectures'
    ];

    let yCap = boxY + 16;
    capabilities.forEach(cap => {
      drawCheckmarkCircle(20, yCap - 2.5, leftBorderColor);
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text(cap, 27, yCap + 1);
      yCap += 9.2;
    });

    // Right Box: Career Placement
    doc.setFillColor(rightCardBg[0], rightCardBg[1], rightCardBg[2]);
    doc.roundedRect(108, boxY, boxW, boxH, 3, 3, 'F');
    doc.setDrawColor(rightBorderColor[0], rightBorderColor[1], rightBorderColor[2]);
    doc.setLineWidth(0.5);
    doc.roundedRect(108, boxY, boxW, boxH, 3, 3, 'S');

    // Right Box Header Strip
    doc.setFillColor(rightBorderColor[0], rightBorderColor[1], rightBorderColor[2]);
    doc.roundedRect(108.2, boxY + 0.2, boxW - 0.4, 9, 3, 3, 'F');
    doc.rect(108.2, boxY + 5, boxW - 0.4, 4.2, 'F');

    // Draw Briefcase Icon on Header Left
    drawBriefcase(112, boxY + 2);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text('CAREER & PLACEMENT SUPPORT', 121, boxY + 6.2);

    const services = [
      'ATS-Optimized Resume Refactoring',
      '1-on-1 Personalized Project Reviews',
      'Weekly Live Mock Coding Interviews',
      'Direct Referrals to Partner Tech Agencies',
      '24/7 Slack Coding Community Support'
    ];

    let yServ = boxY + 16;
    services.forEach(serv => {
      drawCheckmarkCircle(113, yServ - 2.5, rightBorderColor);
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text(serv, 120, yServ + 1);
      yServ += 9.2;
    });

    y = boxY + boxH + 8;

    /* ===== DYNAMIC INDUSTRIAL CAPSTONE PROJECTS DETAIL ===== */
    // Soft divider line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(15, y, pageWidth - 15, y);
    y += 5;

    doc.setFillColor(themeColor[0], themeColor[1], themeColor[2]);
    doc.rect(15, y, 4, 6, 'F');

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('INDUSTRIAL CAPSTONE PROJECTS INCLUDED', 22, y + 4.8);

    y += 9;

    const isPython = courseTitle.includes('python');
    const isDevOps = courseTitle.includes('devops') || courseTitle.includes('cloud');
    
    const capstones = isDevOps ? [
      {
        title: 'Capstone 1: Multi-Environment AWS Infra (Terraform)',
        desc: 'Deploy a highly available, auto-scaling VPC infrastructure on AWS using Terraform modules, private subnets, NAT Gateways, and RDS clusters.',
        tag: 'TERRAFORM'
      },
      {
        title: 'Capstone 2: GitOps CI/CD Pipeline (K8s & ArgoCD)',
        desc: 'Construct a continuous deployment pipeline using Jenkins, Docker, and Kubernetes, managed via ArgoCD GitOps to automate cluster status synchronizations.',
        tag: 'GITOPS'
      }
    ] : isPython ? [
      {
        title: 'Capstone 1: Automated Multi-Source ETL Pipeline',
        desc: 'Build a production-grade data scraping and cleaning engine using Pandas and PostgreSQL, deployed to AWS Cloud with automated Slack hooks.',
        tag: 'DATA INFRA'
      },
      {
        title: 'Capstone 2: REST API Microservice Engine',
        desc: 'Design and write a lightning-fast asynchronous backend server using FastAPI, incorporating JWT authentication, Docker, and unit tests.',
        tag: 'FASTAPI'
      }
    ] : [
      {
        title: 'Capstone 1: Enterprise E-Commerce Gateway',
        desc: 'Build a distributed shopping portal architecture using Spring Boot, Hibernate ORM, PostgreSQL, Eureka Server, fully dockerized and test-covered.',
        tag: 'SPRING'
      },
      {
        title: 'Capstone 2: Event-Driven Real-Time Chat System',
        desc: 'Implement a massive-scale messaging application incorporating WebSockets, Apache Kafka Broker, Redis caching layer, and reactive DB connectors.',
        tag: 'KAFKA'
      }
    ];

    // Draw Capstone Cards side-by-side (Extremely Colorful!)
    const capCardW = 87;
    const capCardH = 34;
    const capY = y;

    capstones.forEach((cap, idx) => {
      const capX = idx === 0 ? 15 : 108;
      const cardColor: [number, number, number] = idx === 0 ? [240, 253, 250] : [253, 244, 255]; // teal-50 / purple-50
      const cardBorder: [number, number, number] = idx === 0 ? [20, 184, 166] : [139, 92, 246]; // teal-500 / purple-500
      
      // Card bg
      doc.setFillColor(cardColor[0], cardColor[1], cardColor[2]);
      doc.roundedRect(capX, capY, capCardW, capCardH, 3, 3, 'F');
      
      // Card border
      doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
      doc.setLineWidth(0.5);
      doc.roundedRect(capX, capY, capCardW, capCardH, 3, 3, 'S');

      // Top color strip
      doc.setFillColor(cardBorder[0], cardBorder[1], cardBorder[2]);
      doc.rect(capX + 0.2, capY + 0.2, capCardW - 0.4, 2, 'F');

      // Project icon
      drawProjectFolder(capX + 5, capY + 5);

      // Title
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text(cap.title, capX + 13, capY + 9);

      // Description
      doc.setTextColor(51, 65, 85);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      const descLines = doc.splitTextToSize(cap.desc, capCardW - 18);
      descLines.forEach((line: string, lIdx: number) => {
        doc.text(line, capX + 13, capY + 14.5 + (lIdx * 3.5));
      });

      // Capstone Tag badge
      drawTopicTag(capX + capCardW - 22, capY + capCardH - 5.5, cap.tag, cardBorder);
    });

    y = capY + capCardH + 8;

    // Enrollment Callout Card (NO OVERLAPS GRID)
    doc.setFillColor(254, 243, 199); // Golden bg
    doc.roundedRect(15, y, pageWidth - 30, 48, 3, 3, 'F');
    doc.setDrawColor(245, 158, 11); // Gold border
    doc.setLineWidth(0.4);
    doc.roundedRect(15, y, pageWidth - 30, 48, 3, 3, 'S');

    // Inner gold border accent
    doc.setDrawColor(251, 146, 60); // Orange
    doc.setLineWidth(0.2);
    doc.roundedRect(16, y + 1, pageWidth - 32, 46, 2.5, 2.5, 'S');

    doc.setTextColor(120, 53, 4);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('READY TO ACCELERATE YOUR LEARNING JOURNEY?', 22, y + 9);

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Enroll today to unlock premium lecture recordings, live case studies, resume reviews, and direct referral opportunities.', 22, y + 15);
    doc.text('Connect with our mentors to learn about batch timings, fee structures, and career guidance.', 22, y + 20);

    // Callout Details Contact Row (Grid Aligned - ZERO Overlaps)
    const contactRowY = y + 27;

    // Col 1: WhatsApp
    drawPhone(22, contactRowY);
    doc.setTextColor(120, 53, 4);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('WhatsApp: +91 91080 57464', 28, contactRowY + 4.5);

    // Col 2: Web Portal
    drawGlobe(84, contactRowY);
    doc.setTextColor(120, 53, 4);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Web: www.vidhuratech.com', 90, contactRowY + 4.5);

    // Col 3: Quality Guarantee Seal
    drawGuaranteeSeal(146, contactRowY - 3);

    // Col 4: Action button
    doc.setFillColor(themeAccent[0], themeAccent[1], themeAccent[2]); // Accent button color
    doc.roundedRect(160, contactRowY - 2, 32, 11, 2, 2, 'F');
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.4);
    doc.roundedRect(160, contactRowY - 2, 32, 11, 2, 2, 'S');
    
    doc.setTextColor(0, 0, 0); // Black for optimal contrast on gold button
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.2);
    doc.text('ENROLL NOW', 176, contactRowY + 5.3, { align: 'center' });

    /* ================= SAVE / OUTPUT ================= */
    if (action === 'preview') {
      const blobUrl = doc.output('bloburl');
      window.open(blobUrl, '_blank');
    } else {
      const courseName = this.selectedCourse.name.replace(/\s+/g, '');
      const year = new Date().getFullYear();
      const fileName = `VidhuraTech_${courseName}_Curriculum_${year}.pdf`;
      doc.save(fileName);
    }
  }
}
