import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ModalPayload {
  course?: string;
  courseId?: number;
  price?: number;
  batchId?: number;
  batch?: string;
}

@Injectable({ providedIn: 'root' })
export class ModalService {
  private modalTrigger = new Subject<ModalPayload>();
  modal$ = this.modalTrigger.asObservable();

  open(payload?: ModalPayload) {
    setTimeout(() => {
      this.modalTrigger.next(payload || {});
    }, 0);
  }
}