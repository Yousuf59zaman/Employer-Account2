import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-sms-verification-modal',
  standalone: true,
  templateUrl: './sms-verification-modal.component.html',
  styleUrl: './sms-verification-modal.component.scss'
})
export class SmsVerificationModalComponent {
  @Output() modalClosed = new EventEmitter<void>();

  ngOnInit(): void {
    document.body.style.overflow = 'hidden';
  }

  ngOnDestroy(): void {
    document.body.style.overflow = 'auto';
  }

  close(): void {
    document.body.style.overflow = 'auto';
    this.modalClosed.emit();
  }
}


