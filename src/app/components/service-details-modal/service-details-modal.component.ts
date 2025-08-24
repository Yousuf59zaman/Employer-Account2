import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-service-details-modal',
  templateUrl: './service-details-modal.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class ServiceDetailsModalComponent implements OnInit, OnDestroy {
  @Input() service: any; 
  @Output() close = new EventEmitter<void>();

  ngOnInit() {
    document.body.style.overflow = 'hidden';
  }

  ngOnDestroy() {
    document.body.style.overflow = '';
  }

  closeModal() {
    this.close.emit();
  }

 
} 