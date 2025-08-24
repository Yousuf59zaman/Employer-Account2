import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-error-modal',
  standalone: true,
  imports: [],
  templateUrl: './error-modal.component.html',
  styleUrl: './error-modal.component.scss'
})
export class ErrorModalComponent {
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
