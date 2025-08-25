import { Component, Input, signal, computed, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

// Keep ids strongly typed
type PackageId = 'bulk-standard' | 'bulk-premium' | 'bulk-premium-plus' | 'bulk-customized';

@Component({
  selector: 'app-bulk-subscription-rightbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bulk-subscription-rightbar.component.html',
  styleUrl: './bulk-subscription-rightbar.component.scss'
})
export class BulkSubscriptionRightbarComponent implements OnChanges {
  @Input() selectedBulkItemId: PackageId = 'bulk-standard';

  private readonly _selectedBulkItemId = signal<PackageId>('bulk-standard');
  readonly selectedBulkItemIdSignal = this._selectedBulkItemId.asReadonly();

  // discount “up to %” mapping (54% for Standard, 62% for others, 0 for customized - not shown)
  private readonly discountUpToById: Record<PackageId, number> = {
    'bulk-standard': 54,
    'bulk-premium': 62,
    'bulk-premium-plus': 62,
    'bulk-customized': 0,
  };

  // computed discount to use in the bullet
  readonly discountUpTo = computed(() => this.discountUpToById[this._selectedBulkItemId()]);

  // features now use the dynamic discountUpTo()
  readonly bulkSubscriptionFeatures = computed(() => {
    const itemId = this._selectedBulkItemId();
    const upTo = this.discountUpTo();

    if (itemId === 'bulk-customized') {
      // No "amazing discounts" line for customized
      return [
        'Customize your package with <b>Standard Listing, Premium Listing and Premium Plus jobs</b>.',
        'For example- if you want to subscribe for 50 jobs package, you may customize it with (20 Premium Plus + 20 Premium Listing + 10 Standard Listing) or any combination of your need.',
        'Package price varies on different combinations.',
      ];
    }

    const common: string[] = [
      `Purchase Bulk Packages and enjoy <b>amazing discounts (up to ${upTo}%)</b>.`,
      'Packages start from <b>5 job posts</b>.',
      'Pay upfront and start posting jobs as and when necessary.',
      'Get direct Access to the Talent Search.',
    ];

    switch (itemId) {
      case 'bulk-premium':
        common.push('Jobs will be displayed as <b>Premium Listing jobs</b>.');
        break;
      case 'bulk-premium-plus':
        common.push('Jobs will be displayed as <b>Premium Plus jobs</b>.');
        break;
      case 'bulk-standard':
      default:
        common.push('Jobs will be displayed as <b>Standard Listing jobs</b>.');
        break;
    }

    return common;
  });

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedBulkItemId']?.currentValue) {
      this._selectedBulkItemId.set(changes['selectedBulkItemId'].currentValue as PackageId);
    }
  }
}
