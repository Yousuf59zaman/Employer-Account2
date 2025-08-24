import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BackToTopComponent } from "../Shared/back-to-top/back-to-top.component";
import { PortalToBodyDirective } from '../../directives/portal-to-body.directive';

@Component({
  selector: 'app-sample-view-modal',
  standalone: true,
  imports: [CommonModule, BackToTopComponent, PortalToBodyDirective],
  templateUrl: './sample-view-modal.component.html',
  styleUrl: './sample-view-modal.component.scss'
})
export class SampleViewModalComponent implements OnChanges {
  @Input() isOpen: boolean = false;
  @Input() packageType: string = '';
  @Output() closeModal = new EventEmitter<void>();
  
  activeTab: 'joblist' | 'details' = 'joblist';

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen']) {
      if (this.isOpen) {
        this.disableBodyScroll();
      } else {
        this.enableBodyScroll();
      }
    }
  }

  private disableBodyScroll() {
    document.body.style.overflow = 'hidden';
  }

  private enableBodyScroll() {
    document.body.style.overflow = 'auto';
  }

  get joblistImage(): string {
    switch (this.packageType) {
      case 'sme-listing':
        return 'https://corporate3.bdjobs.com/images/List-Basic-Listing.jpg';
      case 'premium-listing':
        return 'https://corporate3.bdjobs.com/images/List-Stand-Out-Listing.jpg';
      case 'premium-plus':
        return 'https://corporate3.bdjobs.com/images/List-Stand-out-premium.jpg';
      default:
        return 'https://corporate3.bdjobs.com/images/List-Basic-Listing.jpg';
    }
  }

  get detailsImage(): string {
    switch (this.packageType) {
      case 'sme-listing':
        return 'https://corporate3.bdjobs.com/images/Details-%20Basic-Job-Listing.jpg';
      case 'premium-listing':
        return 'https://corporate3.bdjobs.com/images/Details-Standard-Listing.jpg';
      case 'premium-plus':
        return 'https://corporate3.bdjobs.com/images/Details-Standard-Listing.jpg';
      default:
        return 'https://corporate3.bdjobs.com/images/Details-%20Basic-Job-Listing.jpg';
    }
  }

  setActiveTab(tab: 'joblist' | 'details') {
    this.activeTab = tab;
  }

  onCloseModal() {
    this.closeModal.emit();
  }
}
