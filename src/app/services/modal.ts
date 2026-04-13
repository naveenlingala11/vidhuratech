import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ModalPayload {
  course?: string;
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