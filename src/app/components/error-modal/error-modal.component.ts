import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-error-modal',
  standalone: true,
  templateUrl: './error-modal.component.html',
  styleUrls: ['./error-modal.component.scss']
})
export class ErrorModalComponent implements OnInit, OnDestroy {

  @Output() modalClosed = new EventEmitter<void>();

  ngOnInit(): void {
    document.body.style.overflow = 'hidden';
  }

  ngOnDestroy(): void {
    document.body.style.overflow = 'auto';
  }

  closeModal(): void {
    document.body.style.overflow = 'auto';
    this.modalClosed.emit();
  }
}
