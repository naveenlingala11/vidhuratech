import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ModalService {
  private modalTrigger = new Subject<void>();
  modal$ = this.modalTrigger.asObservable();

  open() {
    setTimeout(() => {
      this.modalTrigger.next();
    }, 0);
  }
}
