import { Component, EventEmitter, Input, OnChanges, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface BulkSubscriptionMenuItem {
	id: string;
	label: string;
}

@Component({
	selector: 'app-bulk-subscription-leftbar',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './bulk-subscription-leftbar.component.html',
	styleUrls: ['./bulk-subscription-leftbar.component.scss']
})
export class BulkSubscriptionLeftbarComponent implements OnChanges {
	@Output() itemSelected = new EventEmitter<BulkSubscriptionMenuItem>();

	// keep the highlight in sync with parent (so it doesn’t reset when you come back to the tab)
	@Input() activeId: string | null = null;

	protected readonly items: BulkSubscriptionMenuItem[] = [
		{ id: 'bulk-standard', label: 'Standard Listing & Talent Search' },
		{ id: 'bulk-premium', label: 'Premium Listing & Talent Search' },
		{ id: 'bulk-premium-plus', label: 'Premium Plus & Talent Search' },
		{ id: 'bulk-customized', label: 'Customized' }
	];

	protected selectedItemId = signal<string>(this.items[0].id);

	ngOnChanges(): void {
		if (this.activeId && this.items.some(i => i.id === this.activeId)) {
			this.selectedItemId.set(this.activeId);
		}
	}

	protected selectItem(id: string): void {
		this.selectedItemId.set(id);
		const item = this.items.find(i => i.id === id);
		if (item) {
			this.itemSelected.emit(item);
		}
	}
}


