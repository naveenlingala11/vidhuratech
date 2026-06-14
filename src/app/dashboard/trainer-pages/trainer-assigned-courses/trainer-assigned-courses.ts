import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TrainerDashboardService } from '../../service/trainer-dashboard';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-trainer-assigned-courses',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './trainer-assigned-courses.html',
  styleUrls: ['./trainer-assigned-courses.css'],
})
export class TrainerAssignedCoursesComponent implements OnInit {
  loading = true;
  toast = '';

  courses: any[] = [];
  searchText = '';
  levelFilter = '';
  autoFilter: 'ALL' | 'AUTO' | 'MANUAL' = 'ALL';

  constructor(private trainerService: TrainerDashboardService) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.loading = true;

    this.trainerService.getAssignedCourses().subscribe({
      next: (res: any) => {
        this.courses = res?.data || [];
        this.loading = false;
      },
      error: () => {
        this.courses = [];
        this.loading = false;
        this.showToast('Unable to load assigned courses');
      },
    });
  }

  get filteredCourses(): any[] {
    const term = this.searchText.trim().toLowerCase();

    return this.courses.filter((course) => {
      const matchesText =
        !term ||
        String(course.title || '')
          .toLowerCase()
          .includes(term) ||
        String(course.code || '')
          .toLowerCase()
          .includes(term) ||
        String(course.description || '')
          .toLowerCase()
          .includes(term);

      const matchesLevel = !this.levelFilter || course.level === this.levelFilter;

      const matchesAuto =
        this.autoFilter === 'ALL' ||
        (this.autoFilter === 'AUTO' && course.autoMonthlyBatchEnabled) ||
        (this.autoFilter === 'MANUAL' && !course.autoMonthlyBatchEnabled);

      return matchesText && matchesLevel && matchesAuto;
    });
  }

  get levels(): string[] {
    return Array.from(new Set(this.courses.map((course) => course.level).filter(Boolean)));
  }

  get stats() {
    return {
      total: this.courses.length,
      autoMonthly: this.courses.filter((course) => course.autoMonthlyBatchEnabled).length,
      manual: this.courses.filter((course) => !course.autoMonthlyBatchEnabled).length,
      filtered: this.filteredCourses.length,
    };
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-IN').format(Number(price || 0));
  }
  courseImage(url: string | null | undefined): string {
    if (!url) return '';

    if (url.startsWith('data:')) {
      return url;
    }

    if (url.startsWith('http')) {
      return url;
    }

    if (url.startsWith('/')) {
      return `${environment.apiUrl}${url}`;
    }

    return `${environment.apiUrl}/course-thumbnails/${url}`;
  }
  showToast(message: string): void {
    this.toast = message;
    setTimeout(() => (this.toast = ''), 2600);
  }

  trackByCourse(_: number, course: any): number {
    return course.courseId || course.assignmentId;
  }

  showEditor = false;
  editingCourse: any = null;
  editingCurriculum: any = null;
  editorSaving = false;

  openCurriculumEditor(course: any): void {
    this.loading = true;
    this.editingCourse = course;
    this.trainerService.getCourseCurriculum(course.courseId).subscribe({
      next: (res: any) => {
        this.loading = false;
        const curriculumObj = res?.data || res;
        if (curriculumObj && curriculumObj.jsonData) {
          try {
            this.editingCurriculum = JSON.parse(curriculumObj.jsonData);
          } catch (e) {
            console.error('Error parsing curriculum JSON:', e);
            this.editingCurriculum = {
              id: course.courseId.toString(),
              name: course.title,
              curriculum: []
            };
          }
        } else {
          this.editingCurriculum = {
            id: course.courseId.toString(),
            name: course.title,
            curriculum: []
          };
        }
        // Ensure curriculum array exists
        if (!this.editingCurriculum.curriculum) {
          this.editingCurriculum.curriculum = [];
        }
        this.showEditor = true;
      },
      error: () => {
        this.loading = false;
        this.editingCurriculum = {
          id: course.courseId.toString(),
          name: course.title,
          curriculum: []
        };
        this.showEditor = true;
      }
    });
  }

  closeEditor(): void {
    this.showEditor = false;
    this.editingCourse = null;
    this.editingCurriculum = null;
  }

  addWeekToEditor(): void {
    if (!this.editingCurriculum.curriculum) {
      this.editingCurriculum.curriculum = [];
    }
    const weekNum = this.editingCurriculum.curriculum.length + 1;
    this.editingCurriculum.curriculum.push({
      title: `Week ${weekNum}: New Module`,
      topics: [
        `Day 1: Lesson Topic`
      ]
    });
  }

  removeWeekFromEditor(wIndex: number): void {
    this.editingCurriculum.curriculum.splice(wIndex, 1);
  }

  addTopicToWeek(wIndex: number): void {
    const week = this.editingCurriculum.curriculum[wIndex];
    if (!week.topics) {
      week.topics = [];
    }
    const dayNum = week.topics.length + 1;
    week.topics.push(`Day ${dayNum}: New Lesson Topic`);
  }

  removeTopicFromWeek(wIndex: number, tIndex: number): void {
    this.editingCurriculum.curriculum[wIndex].topics.splice(tIndex, 1);
  }

  trackByIndex(index: number, obj: any): any {
    return index;
  }

  saveCurriculumDraft(): void {
    if (!this.editingCourse) return;
    this.editorSaving = true;
    this.trainerService.saveCourseCurriculumDraft(this.editingCourse.courseId, { json: this.editingCurriculum }).subscribe({
      next: () => {
        this.editorSaving = false;
        this.showToast('Curriculum draft saved successfully. Awaiting Admin publication.');
        this.closeEditor();
      },
      error: (err: any) => {
        this.editorSaving = false;
        this.showToast(err?.error?.message || 'Failed to save curriculum draft');
      }
    });
  }
}
