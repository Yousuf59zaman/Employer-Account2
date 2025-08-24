import { Component, EventEmitter, Output, signal } from '@angular/core';
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
export class BulkSubscriptionLeftbarComponent {
	@Output() itemSelected = new EventEmitter<BulkSubscriptionMenuItem>();

	protected readonly items: BulkSubscriptionMenuItem[] = [
		{ id: 'bulk-standard', label: 'Standard Listing & Talent Search' },
		{ id: 'bulk-premium', label: 'Premium Listing & Talent Search' },
		{ id: 'bulk-premium-plus', label: 'Premium Plus & Talent Search' },
		{ id: 'bulk-customized', label: 'Customized' }
	];

	protected selectedItemId = signal<string>(this.items[0].id);

	protected selectItem(id: string): void {
		this.selectedItemId.set(id);
		const item = this.items.find(i => i.id === id);
		if (item) {
			this.itemSelected.emit(item);
		}
	}
}


