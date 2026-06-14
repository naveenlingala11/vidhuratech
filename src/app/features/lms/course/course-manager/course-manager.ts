import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Course } from '../model/course.model';
import { CourseService } from '../services/course';

type ManagerTab = 'BATCHES' | 'UPDATES' | 'CURRICULUM' | 'APPROVALS';

interface CurriculumModule {
  title: string;
  duration: string;
  outcome: string;
  topics: string[];
}

@Component({
  selector: 'app-course-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './course-manager.html',
  styleUrls: ['./course-manager.css'],
})
export class CourseManagerComponent implements OnInit {
  activeTab: ManagerTab = 'BATCHES';

  courses: Course[] = [];
  batches: any[] = [];
  trainers: any[] = [];
  pendingCurriculums: any[] = [];

  selectedCourseId: number | null = null;
  selectedBatchId: number | null = null;
  selectedBatch: any = null;

  loading = false;
  saving = false;
  curriculumLoading = false;

  batchForm: any = this.emptyBatchForm();
  communicationForm: any = this.emptyCommunicationForm();

  curriculumMeta = {
    title: '',
    version: '1.0',
    description: '',
  };

  modules: CurriculumModule[] = [];
  rawPreview: any = null;

  constructor(
    private courseService: CourseService,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    this.loadCourses();
    this.loadTrainers();
  }

  get selectedCourse(): Course | undefined {
    return this.courses.find((course) => Number(course.id) === Number(this.selectedCourseId));
  }

  get filteredBatches(): any[] {
    if (!this.selectedCourseId) return this.batches;
    return this.batches.filter((batch) => Number(batch.courseId) === Number(this.selectedCourseId));
  }

  setTab(tab: ManagerTab): void {
    this.activeTab = tab;
    if (tab === 'APPROVALS') {
      this.loadPendingCurriculums();
    }
  }

  loadCourses(): void {
    this.loading = true;

    this.courseService.getCourses({ page: 0, size: 200 }).subscribe({
      next: (res: any) => {
        this.courses = res?.data?.content || res?.content || res?.data || [];
        this.selectedCourseId = this.courses[0]?.id || null;
        this.loading = false;
        this.loadBatches();
      },
      error: () => {
        this.loading = false;
        this.toastr.error('Unable to load courses');
      },
    });
  }

  loadTrainers(): void {
    this.courseService.getTrainers().subscribe({
      next: (res: any) => {
        this.trainers = res?.data?.content || res?.content || res?.data || [];
      },
      error: () => {
        this.trainers = [];
      },
    });
  }

  loadBatches(): void {
    this.loading = true;

    this.courseService
      .getAdminBatches({
        page: 0,
        size: 200,
        courseId: this.selectedCourseId || '',
      })
      .subscribe({
        next: (res: any) => {
          this.batches = res?.data?.content || res?.content || [];
          this.loading = false;

          if (this.batches.length && !this.selectedBatchId) {
            this.selectBatch(this.batches[0]);
          }
        },
        error: () => {
          this.loading = false;
          this.toastr.error('Unable to load batches');
        },
      });
  }

  onCourseChange(): void {
    this.selectedBatchId = null;
    this.selectedBatch = null;
    this.resetBatchForm();
    this.resetCurriculum();
    this.loadBatches();
  }

  selectBatch(batch: any): void {
    this.selectedBatch = batch;
    this.selectedBatchId = Number(batch.id);

    this.batchForm = {
      name: batch.name || '',
      courseId: batch.courseId || this.selectedCourseId,
      trainerId: batch.trainerId || '',
      startDate: batch.startDate || '',
      endDate: batch.endDate || '',
      status: batch.status || 'ACTIVE',
    };

    this.loadCommunication();
    this.loadCurriculum();
  }

  newBatch(): void {
    this.selectedBatch = null;
    this.selectedBatchId = null;
    this.resetBatchForm();
    this.resetCurriculum();
    this.activeTab = 'BATCHES';
  }

  saveBatch(): void {
    if (!this.batchForm.name || !this.batchForm.courseId) {
      this.toastr.error('Batch name and course are required');
      return;
    }

    this.saving = true;

    const request = this.selectedBatchId
      ? this.courseService.updateBatch(this.selectedBatchId, this.batchForm)
      : this.courseService.createBatch(this.batchForm);

    request.subscribe({
      next: () => {
        this.saving = false;
        this.toastr.success(this.selectedBatchId ? 'Batch updated' : 'Batch created');
        this.loadBatches();
      },
      error: () => {
        this.saving = false;
        this.toastr.error('Unable to save batch');
      },
    });
  }

  deleteBatch(batch: any): void {
    if (!batch?.id || !confirm(`Delete batch ${batch.name}?`)) return;

    this.courseService.deleteBatch(batch.id).subscribe({
      next: () => {
        this.toastr.success('Batch deleted');
        this.selectedBatchId = null;
        this.selectedBatch = null;
        this.loadBatches();
      },
      error: () => this.toastr.error('Unable to delete batch'),
    });
  }

  onBatchChange(): void {
    const batch = this.filteredBatches.find(
      (item) => Number(item.id) === Number(this.selectedBatchId),
    );
    if (batch) this.selectBatch(batch);
  }

  loadCommunication(): void {
    if (!this.selectedBatchId) return;

    this.courseService.getBatchCommunication(this.selectedBatchId).subscribe({
      next: (res: any) => {
        this.communicationForm = {
          ...this.emptyCommunicationForm(),
          ...(res?.data || res || {}),
        };
      },
      error: () => {
        this.communicationForm = this.emptyCommunicationForm();
      },
    });
  }

  saveCommunication(): void {
    if (!this.selectedBatchId) {
      this.toastr.error('Select a batch first');
      return;
    }

    this.saving = true;

    this.courseService
      .updateBatchCommunication(this.selectedBatchId, this.communicationForm)
      .subscribe({
        next: () => {
          this.saving = false;
          this.toastr.success('Batch updates shared');
        },
        error: () => {
          this.saving = false;
          this.toastr.error('Unable to save updates');
        },
      });
  }

  loadCurriculum(): void {
    if (!this.selectedBatchId) return;

    this.curriculumLoading = true;

    this.courseService.getAdminCurriculum(this.selectedBatchId).subscribe({
      next: (res: any) => {
        const raw = res?.data || null;
        this.curriculumLoading = false;

        if (!raw) {
          this.resetCurriculum();
          return;
        }

        try {
          const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
          this.rawPreview = parsed;
          this.curriculumMeta = {
            title: parsed.title || this.selectedCourse?.title || '',
            version: parsed.version || '1.0',
            description: parsed.description || '',
          };
          this.modules = parsed.curriculum || parsed.modules || [];
        } catch {
          this.rawPreview = raw;
          this.modules = [];
          this.toastr.warning('Curriculum found but JSON format is not standard');
        }
      },
      error: () => {
        this.curriculumLoading = false;
        this.resetCurriculum();
      },
    });
  }

  addModule(): void {
    this.modules.push({
      title: '',
      duration: '',
      outcome: '',
      topics: [''],
    });
  }

  removeModule(index: number): void {
    this.modules.splice(index, 1);
  }

  addTopic(module: CurriculumModule): void {
    module.topics.push('');
  }

  removeTopic(module: CurriculumModule, index: number): void {
    module.topics.splice(index, 1);
  }

  buildCurriculumJson(): any {
    return {
      title: this.curriculumMeta.title || this.selectedCourse?.title || 'Course Curriculum',
      version: this.curriculumMeta.version || '1.0',
      description: this.curriculumMeta.description,
      courseId: this.selectedCourseId,
      batchId: this.selectedBatchId,
      curriculum: this.modules.map((module, index) => ({
        order: index + 1,
        title: module.title,
        duration: module.duration,
        outcome: module.outcome,
        topics: module.topics.filter((topic) => String(topic || '').trim()),
      })),
    };
  }

  previewCurriculum(): void {
    this.rawPreview = this.buildCurriculumJson();
  }

  saveCurriculum(): void {
    if (!this.selectedBatchId) {
      this.toastr.error('Select a batch first');
      return;
    }

    if (!this.modules.length) {
      this.toastr.error('Add at least one module');
      return;
    }

    const payload = this.buildCurriculumJson();
    this.saving = true;

    this.courseService.saveAdminCurriculum(this.selectedBatchId, payload).subscribe({
      next: () => {
        this.saving = false;
        this.rawPreview = payload;
        this.toastr.success('Curriculum posted to students');
      },
      error: (err) => {
        this.saving = false;
        this.toastr.error(err?.error?.message || 'Unable to save curriculum');
      },
    });
  }

  resetBatchForm(): void {
    this.batchForm = this.emptyBatchForm();
    this.batchForm.courseId = this.selectedCourseId;
  }

  resetCurriculum(): void {
    this.curriculumMeta = {
      title: this.selectedCourse?.title || '',
      version: '1.0',
      description: '',
    };
    this.modules = [];
    this.rawPreview = null;
  }

  emptyBatchForm(): any {
    return {
      name: '',
      courseId: '',
      trainerId: '',
      startDate: '',
      endDate: '',
      status: 'ACTIVE',
    };
  }

  emptyCommunicationForm(): any {
    return {
      whatsappGroupLink: '',
      zoomJoinLink: '',
      zoomMeetingId: '',
      zoomPasscode: '',
      zoomSchedule: '',
      zoomTime: '',
      zoomCalendarLink: '',
    };
  }

  loadPendingCurriculums(): void {
    this.loading = true;
    this.courseService.getPendingCurriculums().subscribe({
      next: (res: any) => {
        this.pendingCurriculums = res?.data || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastr.error('Unable to load pending curriculum submissions');
      }
    });
  }

  approveCurriculum(id: number): void {
    this.saving = true;
    this.courseService.publishCurriculum(id).subscribe({
      next: () => {
        this.saving = false;
        this.toastr.success('Curriculum draft approved and published successfully!');
        this.loadPendingCurriculums();
      },
      error: (err) => {
        this.saving = false;
        this.toastr.error(err?.error?.message || 'Failed to approve curriculum');
      }
    });
  }

  parsedJson(jsonStr: string): any {
    try {
      return JSON.parse(jsonStr);
    } catch {
      return null;
    }
  }

  getCourseNameById(courseId: number): string {
    const matched = this.courses.find(c => Number(c.id) === Number(courseId));
    return matched?.title || 'Unknown Course';
  }
}
