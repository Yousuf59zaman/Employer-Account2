import { Component, Input, signal, computed, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bulk-subscription-rightbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bulk-subscription-rightbar.component.html',
  styleUrl: './bulk-subscription-rightbar.component.scss'
})
export class BulkSubscriptionRightbarComponent implements OnChanges {
  @Input() selectedBulkItemId: string = 'bulk-standard';
  
  private readonly _selectedBulkItemId = signal<string>('bulk-standard');
  
  readonly selectedBulkItemIdSignal = this._selectedBulkItemId.asReadonly();
  
  readonly bulkSubscriptionFeatures = computed(() => {
    const itemId = this._selectedBulkItemId();
    
    switch (itemId) {
      case 'bulk-standard':
        return [
          'Purchase Bulk Packages and enjoy <b>amazing discounts (up to 55%)</b>.',
          'Packages start from <b>5 job posts</b>.',
          'Pay upfront and start posting jobs as and when necessary.',
          'Get direct Access to the Talent Search.',
          'Jobs will be displayed as <b>Standard Listing jobs</b>.'
        ];
      case 'bulk-premium':
        return [
          'Purchase Bulk Packages and enjoy <b>amazing discounts (up to 65%)</b>.',
          'Packages start from <b>5 job posts</b>.',
          'Pay upfront and start posting jobs as and when necessary.',
          'Get direct Access to the Talent Search.',
          'Jobs will be displayed as <b>Premium Listing jobs</b>.'
        ];
      case 'bulk-premium-plus':
        return [
          'Purchase Bulk Packages and enjoy <b>amazing discounts (up to 55%)</b>.',
          'Packages start from <b>5 job posts</b>.',
          'Pay upfront and start posting jobs as and when necessary.',
          'Get direct Access to the Talent Search.',
          'Jobs will be displayed as <b>Premium Plus jobs</b>.'
        ];
      case 'bulk-customized':
        return [
          'Customize your package with <b>Standard Listing, Premium Listing and Premium Plus jobs</b>.',
          'For example- if you want to subscribe for 50 jobs package, you may customize it with (20 Premium Plus + 20 Premium Listing + 10 Standard Listing) or any combination of your need.',
          'Package price varies on different combinations.',
        ];
      default:
        return [
          'Purchase Bulk Packages and enjoy <b>amazing discounts (up to 55%)</b>.',
          'Packages start from <b>5 job posts</b>.',
          'Pay upfront and start posting jobs as and when necessary.',
          'Get direct Access to the Talent Search.',
          'Jobs will be displayed as Standard Listing jobs.'
        ];
    }
  });

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedBulkItemId'] && changes['selectedBulkItemId'].currentValue) {
      this._selectedBulkItemId.set(changes['selectedBulkItemId'].currentValue);
    }
  }
}
