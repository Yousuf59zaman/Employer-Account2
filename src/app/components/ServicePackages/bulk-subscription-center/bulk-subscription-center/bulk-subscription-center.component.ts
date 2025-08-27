import { Component, Input, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NumericOnlyDirective } from '../../../../directives/numeric-only.dir';
import { OrderService } from '../../../../Services/order.service';

// Per-tab state identifiers and shape
export type PackageId = 'bulk-standard' | 'bulk-premium' | 'bulk-premium-plus' | 'bulk-customized';

interface BulkPackageState {
  quantity: number;
  validity: string;
  isTalentSearchExpanded: boolean;

  // customized view fields (kept for all for simplicity)
  standardQuantity: number;
  premiumQuantity: number;
  premiumPlusQuantity: number;
  isStandardExpanded: boolean;
  isPremiumExpanded: boolean;
  isPremiumPlusExpanded: boolean;
  isTalentSearchCustomizedExpanded: boolean;
}

interface BulkSubscriptionPackage {
  id: string;
  name: string;
  startingPrice: number;
  pricePerJob: number;
}

@Component({
  selector: 'app-bulk-subscription-center',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NumericOnlyDirective],
  templateUrl: './bulk-subscription-center.component.html',
  styleUrl: './bulk-subscription-center.component.scss'
})
export class BulkSubscriptionCenterComponent implements OnInit {
  // Maintain selected package id with a setter to persist/restore per-tab state
  private _selectedBulkItemId: PackageId = 'bulk-standard';
  @Input() set selectedBulkItemId(val: PackageId) {
    // persist current tab before switching
    this.persistState(this._selectedBulkItemId);
    this._selectedBulkItemId = val;
    // restore new tab's saved state
    this.restoreState(val);
  }
  get selectedBulkItemId(): PackageId {
    return this._selectedBulkItemId;
  }

  quantityControl = new FormControl(0);
  validityControl = new FormControl('');

  standardQuantityControl = new FormControl(0);
  premiumQuantityControl = new FormControl(0);
  premiumPlusQuantityControl = new FormControl(0);

  readonly MAX_QUANTITY_LENGTH = 4;

  vatRate = 0.05;

  isTalentSearchExpanded = signal(false);

  isStandardExpanded = signal(false);
  isPremiumExpanded = signal(false);
  isPremiumPlusExpanded = signal(false);
  isTalentSearchCustomizedExpanded = signal(false);

  // In-memory state store keyed by package id
  private createDefaultState(): BulkPackageState {
    return {
      quantity: 0,
      validity: '',
      isTalentSearchExpanded: false,
      standardQuantity: 0,
      premiumQuantity: 0,
      premiumPlusQuantity: 0,
      isStandardExpanded: false,
      isPremiumExpanded: false,
      isPremiumPlusExpanded: false,
      isTalentSearchCustomizedExpanded: false,
    };
  }

  private stateByPackage: Record<PackageId, BulkPackageState> = {
    'bulk-standard': this.createDefaultState(),
    'bulk-premium': this.createDefaultState(),
    'bulk-premium-plus': this.createDefaultState(),
    'bulk-customized': this.createDefaultState(),
  };

  // Save what's currently on screen into the per-tab map
  private persistState(pkg: PackageId) {
    if (!pkg) return;
    const s = this.stateByPackage[pkg] ?? (this.stateByPackage[pkg] = this.createDefaultState());
    s.quantity = this.quantityControl.value ?? 0;
    s.validity = this.validityControl.value ?? '';
    s.isTalentSearchExpanded = this.isTalentSearchExpanded();

    s.standardQuantity = this.standardQuantityControl.value ?? 0;
    s.premiumQuantity = this.premiumQuantityControl.value ?? 0;
    s.premiumPlusQuantity = this.premiumPlusQuantityControl.value ?? 0;

    s.isStandardExpanded = this.isStandardExpanded();
    s.isPremiumExpanded = this.isPremiumExpanded();
    s.isPremiumPlusExpanded = this.isPremiumPlusExpanded();
    s.isTalentSearchCustomizedExpanded = this.isTalentSearchCustomizedExpanded();
  }

  // Restore saved values back into the controls/signals
  private restoreState(pkg: PackageId) {
    const s: BulkPackageState = this.stateByPackage[pkg] ?? this.createDefaultState();

    this.quantityControl.setValue(s.quantity, { emitEvent: false });
    this.validityControl.setValue(s.validity, { emitEvent: false });
    this.isTalentSearchExpanded.set(s.isTalentSearchExpanded);

    this.standardQuantityControl.setValue(s.standardQuantity, { emitEvent: false });
    this.premiumQuantityControl.setValue(s.premiumQuantity, { emitEvent: false });
    this.premiumPlusQuantityControl.setValue(s.premiumPlusQuantity, { emitEvent: false });

    this.isStandardExpanded.set(s.isStandardExpanded);
    this.isPremiumExpanded.set(s.isPremiumExpanded);
    this.isPremiumPlusExpanded.set(s.isPremiumPlusExpanded);
    this.isTalentSearchCustomizedExpanded.set(s.isTalentSearchCustomizedExpanded);

    if (this.isCustomizedView) {
      this.updateValidityForCustomizedView();
    } else {
      this.updateValidityBasedOnQuantity();
    }

    this.calculatePricing();
  }

  // USD pricing for bulk subscription packages (from Services.asp)
  private readonly usdPerJobByPackageId: Record<string, number> = {
    'bulk-customized': 60     // CustomizedPriceUSD
    // Note: bulk-standard, bulk-premium, and bulk-premium-plus use dynamic tiered pricing based on quantity
  };

  // Country detection
  get isInternational(): boolean {
    const country = (localStorage.getItem('CompanyCountry') || '').trim().toLowerCase();
    return country !== '' && country !== 'bangladesh';
  }

  get currencyLabel(): string {
    return this.isInternational ? 'USD' : 'BDT';
  }

  //USD price per job for Premium Plus based on quantity
  private getPremiumPlusUsdPricePerJob(quantity: number): number {
    if (quantity >= 5 && quantity <= 10) {
      return 53; // 53 USD per job for 5-10 jobs
    } else if (quantity >= 11 && quantity <= 19) {
      return 47; // 47 USD per job for 11-19 jobs
    } else if (quantity >= 20 && quantity <= 29) {
      return 47; // 47 USD per job for 20-29 jobs
    } else if (quantity >= 30 && quantity <= 40) {
      return 41; // 41 USD per job for 30-40 jobs
    } else if (quantity >= 41 && quantity <= 50) {
      return 37; // 37 USD per job for 41-50 jobs
    } else if (quantity >= 51 && quantity <= 100) {
      return 31; // 31 USD per job for 51-100 jobs
    } else if (quantity >= 101 && quantity <= 200) {
      return 28; // 28 USD per job for 101-200 jobs
    } else if (quantity >= 201) {
      return 24; // 24 USD per job for 201+ jobs
    }
    return 0;
  }

  //USD price per job for Premium package based on quantity
  private getPremiumUsdPricePerJob(quantity: number): number {
    if (quantity >= 5 && quantity <= 10) {
      return 36; // 36 USD per job for 5-10 jobs
    } else if (quantity >= 11 && quantity <= 19) {
      return 31; // 31 USD per job for 11-19 jobs
    } else if (quantity >= 20 && quantity <= 29) {
      return 31; // 31 USD per job for 20-29 jobs
    } else if (quantity >= 30 && quantity <= 40) {
      return 27; // 27 USD per job for 30-40 jobs
    } else if (quantity >= 41 && quantity <= 50) {
      return 25; // 25 USD per job for 41-50 jobs
    } else if (quantity >= 51 && quantity <= 100) {
      return 20; // 20 USD per job for 51-100 jobs
    } else if (quantity >= 101 && quantity <= 200) {
      return 19; // 19 USD per job for 101-200 jobs
    } else if (quantity >= 201) {
      return 16; // 16 USD per job for 201+ jobs
    }
    return 0;
  }

  // Unified BDT per-job pricing for all packages (already discounted)
  private getBdtPerJobPrice(packageId: string, quantity: number): number {
    if (quantity === 0) return 0;
    if (packageId === 'bulk-standard') {
      if (quantity >= 5 && quantity <= 10) return 2500;
      if (quantity >= 11 && quantity <= 19) return 2200;
      if (quantity >= 20 && quantity <= 29) return 2200;
      if (quantity >= 30 && quantity <= 40) return 2050;
      if (quantity >= 41 && quantity <= 50) return 1910;
      if (quantity >= 51 && quantity <= 100) return 1620;
      if (quantity >= 101 && quantity <= 200) return 1470;
      if (quantity >= 201) return 1315;
      return 0;
    }
    if (packageId === 'bulk-premium') {
      if (quantity >= 5 && quantity <= 10) return 3200;
      if (quantity >= 11 && quantity <= 19) return 2800;
      if (quantity >= 20 && quantity <= 29) return 2800;
      if (quantity >= 30 && quantity <= 40) return 2420;
      if (quantity >= 41 && quantity <= 50) return 2230;
      if (quantity >= 51 && quantity <= 100) return 1835;
      if (quantity >= 101 && quantity <= 200) return 1670;
      if (quantity >= 201) return 1470;
      return 0;
    }
    if (packageId === 'bulk-premium-plus') {
      if (quantity >= 5 && quantity <= 10) return 4800;
      if (quantity >= 11 && quantity <= 19) return 4250;
      if (quantity >= 20 && quantity <= 29) return 4250;
      if (quantity >= 30 && quantity <= 40) return 3650;
      if (quantity >= 41 && quantity <= 50) return 3350;
      if (quantity >= 51 && quantity <= 100) return 2750;
      if (quantity >= 101 && quantity <= 200) return 2500;
      if (quantity >= 201) return 2200;
      return 0;
    }
    return 0;
  }

  // Unified USD per-job pricing for all packages
  private getUsdPerJobPrice(packageId: string, quantity: number): number {
    if (quantity === 0) return 0;
    if (packageId === 'bulk-standard') return this.getStandardUsdPricePerJob(quantity);
    if (packageId === 'bulk-premium') return this.getPremiumUsdPricePerJob(quantity);
    if (packageId === 'bulk-premium-plus') return this.getPremiumPlusUsdPricePerJob(quantity);
    return this.usdPerJobByPackageId[packageId] || 0;
  }

  private getPerJobPriceForCurrentCurrency(packageId: string, quantity: number): number {
    return this.isInternational
      ? this.getUsdPerJobPrice(packageId, quantity)
      : this.getBdtPerJobPrice(packageId, quantity);
  }

  private computeJobTotalFor(packageId: string, quantity: number): number {
    if (quantity === 0) return 0;
    const perJob = this.getPerJobPriceForCurrentCurrency(packageId, quantity);
    return perJob * quantity;
  }

  // Unified CV price by quantity for current currency
  private computeCvPriceFor(quantity: number): number {
    if (quantity === 0) return 0;
    if (this.isInternational) {
      if (quantity >= 5 && quantity <= 10) return 30;
      if (quantity >= 11 && quantity <= 19) return 55;
      if (quantity >= 20 && quantity <= 29) return 80;
      if (quantity >= 30 && quantity <= 40) return 120;
      if (quantity >= 41 && quantity <= 50) return 145;
      if (quantity >= 51 && quantity <= 100) return 180;
      if (quantity >= 101 && quantity <= 200) return 235;
      if (quantity >= 201) return 295;
      return 0;
    }
    if (quantity >= 5 && quantity <= 10) return 2500;
    if (quantity >= 11 && quantity <= 19) return 4500;
    if (quantity >= 20 && quantity <= 29) return 6750;
    if (quantity >= 30 && quantity <= 40) return 10000;
    if (quantity >= 41 && quantity <= 50) return 12000;
    if (quantity >= 51 && quantity <= 100) return 15000;
    if (quantity >= 101 && quantity <= 200) return 20000;
    if (quantity >= 201) return 25000;
    return 0;
  }

  // USD price per job for Standard package based on quantity
  private getStandardUsdPricePerJob(quantity: number): number {
    if (quantity >= 5 && quantity <= 10) {
      return 28; // 28 USD per job for 5-10 jobs
    } else if (quantity >= 11 && quantity <= 19) {
      return 24; // 24 USD per job for 11-19 jobs
    } else if (quantity >= 20 && quantity <= 29) {
      return 24; // 24 USD per job for 20-29 jobs
    } else if (quantity >= 30 && quantity <= 40) {
      return 23; // 23 USD per job for 30-40 jobs
    } else if (quantity >= 41 && quantity <= 50) {
      return 21; // 21 USD per job for 41-50 jobs
    } else if (quantity >= 51 && quantity <= 100) {
      return 18; // 18 USD per job for 51-100 jobs
    } else if (quantity >= 101 && quantity <= 200) {
      return 16; // 16 USD per job for 101-200 jobs
    } else if (quantity >= 201) {
      return 15; // 15 USD per job for 201+ jobs
    }
    return 0;
  }

  // Individual job prices for customized view - using same logic as regular sections
  get customizedStandardPrice(): number {
    if (this.standardQuantity === 0) return 0;
    return this.computeJobTotalFor('bulk-standard', this.standardQuantity);
  }

  get customizedPremiumPrice(): number {
    if (this.premiumQuantity === 0) return 0;
    return this.computeJobTotalFor('bulk-premium', this.premiumQuantity);
  }

  get customizedPremiumPlusPrice(): number {
    if (this.premiumPlusQuantity === 0) return 0;
    return this.computeJobTotalFor('bulk-premium-plus', this.premiumPlusQuantity);
  }

  get customizedTotalPrice(): number {
    const totalJobPrice = this.customizedStandardPrice + this.customizedPremiumPrice + this.customizedPremiumPlusPrice;

    if (this.isTalentSearchCustomizedExpanded()) {
      const totalQuantity = this.standardQuantity + this.premiumQuantity + this.premiumPlusQuantity;
      return totalJobPrice + this.getCvPriceForQuantity(totalQuantity);
    }

    return totalJobPrice;
  }

  // Helper method to get CV price based on total quantity for customized view
  private getCvPriceForQuantity(quantity: number): number {
    if (quantity === 0) return 0;

    if (this.isInternational) {
      if (quantity >= 5 && quantity <= 10) {
        return 30; // 30 USD for 550 CVs
      } else if (quantity >= 11 && quantity <= 19) {
        return 55; // 55 USD for 1,000 CVs
      } else if (quantity >= 20 && quantity <= 29) {
        return 80; // 80 USD for 1,500 CVs
      } else if (quantity >= 30 && quantity <= 40) {
        return 120; // 120 USD for 2,000 CVs
      } else if (quantity >= 41 && quantity <= 50) {
        return 145; // 145 USD for 2,500 CVs
      } else if (quantity >= 51 && quantity <= 100) {
        return 180; // 180 USD for 4,500 CVs
      } else if (quantity >= 101 && quantity <= 200) {
        return 235; // 235 USD for 10,500 CVs
      } else if (quantity >= 201) {
        return 295; // 295 USD for 15,000 CVs
      }
    }

    // BDT CV pricing
    if (quantity >= 5 && quantity <= 10) {
      return 2500; // 550 CVs for 2,500 BDT
    } else if (quantity >= 11 && quantity <= 19) {
      return 4500; // 1,000 CVs for 4,500 BDT
    } else if (quantity >= 20 && quantity <= 29) {
      return 6750; // 1,500 CVs for 6,750 BDT
    } else if (quantity >= 30 && quantity <= 40) {
      return 10000; // 2,000 CVs for 10,000 BDT
    } else if (quantity >= 41 && quantity <= 50) {
      return 12000; // 2,500 CVs for 12,000 BDT
    } else if (quantity >= 51 && quantity <= 100) {
      return 15000; // 4,500 CVs for 15,000 BDT
    } else if (quantity >= 101 && quantity <= 200) {
      return 20000; // 10,500 CVs for 20,000 BDT
    } else if (quantity >= 201) {
      return 25000; // 15,000 CVs for 25,000 BDT
    }

    return 0;
  }

  ngOnInit() {
    this.validityControl.setValue('');
    this.validityControl.reset();
    // Ensure initial tab pulls its saved state
    this.restoreState(this._selectedBulkItemId);
    // Update validity and pricing when quantity changes via direct input
    this.quantityControl.valueChanges.subscribe(() => {
      this.updateValidityBasedOnQuantity();
      this.calculatePricing();
    });

    // Customized view controls need to react to direct input as well
    this.standardQuantityControl.valueChanges.subscribe(() => {
      this.updateValidityForCustomizedView();
      this.calculatePricing();
    });
    this.premiumQuantityControl.valueChanges.subscribe(() => {
      this.updateValidityForCustomizedView();
      this.calculatePricing();
    });
    this.premiumPlusQuantityControl.valueChanges.subscribe(() => {
      this.updateValidityForCustomizedView();
      this.calculatePricing();
    });

    // Enforce 4-digit max on value changes (in case of programmatic updates)
    this.quantityControl.valueChanges.subscribe((v) => {
      this.trimControlToMaxDigits(this.quantityControl, v);
    });
    this.standardQuantityControl.valueChanges.subscribe((v) => {
      this.trimControlToMaxDigits(this.standardQuantityControl, v);
    });
    this.premiumQuantityControl.valueChanges.subscribe((v) => {
      this.trimControlToMaxDigits(this.premiumQuantityControl, v);
    });
    this.premiumPlusQuantityControl.valueChanges.subscribe((v) => {
      this.trimControlToMaxDigits(this.premiumPlusQuantityControl, v);
    });

    // Ensure validity reflects any restored quantity
    this.updateValidityBasedOnQuantity();
    this.updateValidityForCustomizedView();
  }

  onQuantityInputEvent(event: Event, which: 'regular' | 'standard' | 'premium' | 'premiumPlus'): void {
    const input = event.target as HTMLInputElement;
    if (!input) return;
    const sanitized = (input.value || '').replace(/[^0-9]/g, '');
    const trimmed = sanitized.slice(0, this.MAX_QUANTITY_LENGTH);
    if (trimmed !== sanitized) input.value = trimmed;
    const parsed = parseInt(trimmed, 10);
    const val = isNaN(parsed) ? 0 : parsed;
    const clamp = Math.min(Math.max(val, 0), 9999);
    switch (which) {
      case 'regular': this.quantityControl.setValue(clamp, { emitEvent: true }); break;
      case 'standard': this.standardQuantityControl.setValue(clamp, { emitEvent: true }); break;
      case 'premium': this.premiumQuantityControl.setValue(clamp, { emitEvent: true }); break;
      case 'premiumPlus': this.premiumPlusQuantityControl.setValue(clamp, { emitEvent: true }); break;
    }
  }

  private trimControlToMaxDigits(ctrl: FormControl<number | null>, v: number | null | undefined) {
    const raw = String(v ?? '');
    if (raw.length > this.MAX_QUANTITY_LENGTH) {
      const trimmed = parseInt(raw.slice(0, this.MAX_QUANTITY_LENGTH), 10);
      if (!isNaN(trimmed)) ctrl.setValue(trimmed as any, { emitEvent: false });
    }
  }

  get selectedValidity(): string {
    return this.validityControl.value || '';
  }
  // cv count based on quantity
  get cvCount(): number {
    if (this.isCustomizedView) {
      // For customized view, calculate CV count based on total quantity
      const totalQuantity = this.standardQuantity + this.premiumQuantity + this.premiumPlusQuantity;
      if (totalQuantity === 0) return 0;

      if (totalQuantity >= 5 && totalQuantity <= 10) {
        return 550; // 550 CVs for 5-10 jobs
      } else if (totalQuantity >= 11 && totalQuantity <= 19) {
        return 1000; // 1,000 CVs for 11-19 jobs
      } else if (totalQuantity >= 20 && totalQuantity <= 29) {
        return 1500; // 1,500 CVs for 20-29 jobs
      } else if (totalQuantity >= 30 && totalQuantity <= 40) {
        return 2000; // 2,000 CVs for 30-40 jobs
      } else if (totalQuantity >= 41 && totalQuantity <= 50) {
        return 2500; // 2,500 CVs for 41-50 jobs
      } else if (totalQuantity >= 51 && totalQuantity <= 100) {
        return 4500; // 4,500 CVs for 51-100 jobs
      } else if (totalQuantity >= 101 && totalQuantity <= 200) {
        return 10500; // 10,500 CVs for 101-200 jobs
      } else if (totalQuantity >= 201) {
        return 15000; // 15,000 CVs for 201+ jobs
      }
    }

    // Regular view CV count logic
    if (this.quantity === 0) return 0;

    if (this.quantity >= 5 && this.quantity <= 10) {
      return 550; // 550 CVs for 5-10 jobs
    } else if (this.quantity >= 11 && this.quantity <= 19) {
      return 1000; // 1,000 CVs for 11-19 jobs
    } else if (this.quantity >= 20 && this.quantity <= 29) {
      return 1500; // 1,500 CVs for 20-29 jobs
    } else if (this.quantity >= 30 && this.quantity <= 40) {
      return 2000; // 2,000 CVs for 30-40 jobs
    } else if (this.quantity >= 41 && this.quantity <= 50) {
      return 2500; // 2,500 CVs for 41-50 jobs
    } else if (this.quantity >= 51 && this.quantity <= 100) {
      return 4500; // 4,500 CVs for 51-100 jobs
    } else if (this.quantity >= 101 && this.quantity <= 200) {
      return 10500; // 10,500 CVs for 101-200 jobs
    } else if (this.quantity >= 201) {
      return 15000; // 15,000 CVs for 201+ jobs
    }

    return 0;
  }

  get cvPrice(): number {
    const price = this.computeCvPriceFor(this.quantity);
    return price;
  }

  get formattedCvCount(): string {
    return this.formatNumber(this.cvCount);
  }

  get formattedCvPrice(): string {
    return this.formatNumber(this.cvPrice);
  }

  get formattedJobPrice(): string {
    return this.formatNumber(this.jobPrice);
  }

  get jobPrice(): number {
    return this.computeJobTotalFor(this.selectedPackage.id, this.quantity);
  }

  get validityOptions(): { value: string; label: string }[] {
    let totalQuantity = 0;

    // For customized view, use total quantity from all job types
    if (this.isCustomizedView) {
      totalQuantity = this.standardQuantity + this.premiumQuantity + this.premiumPlusQuantity;
    } else {
      totalQuantity = this.quantity;
    }

    if (totalQuantity === 0) {
      return [];
    }

    let options: { value: string; label: string }[] = [];

    if (this.selectedPackage.id === 'bulk-standard' || this.isCustomizedView) {
      if (totalQuantity >= 5 && totalQuantity <= 19) {
        options = [{ value: '6-months', label: '6 months' }];
      } else if (totalQuantity >= 20 && totalQuantity <= 29) {
        options = [{ value: '9-months', label: '9 months' }];
      } else if (totalQuantity >= 30) {
        options = [{ value: '12-months', label: '12 months' }];
      }
    } else if (this.selectedPackage.id === 'bulk-premium') {
      // Premium package validity periods
      if (totalQuantity >= 5 && totalQuantity <= 10) {
        options = [{ value: '6-months', label: '6 months' }];
      } else if (totalQuantity >= 11 && totalQuantity <= 19) {
        options = [{ value: '6-months', label: '6 months' }];
      } else if (totalQuantity >= 20 && totalQuantity <= 29) {
        options = [{ value: '9-months', label: '9 months' }];
      } else if (totalQuantity >= 30) {
        options = [{ value: '12-months', label: '12 months' }];
      }
    } else if (this.selectedPackage.id === 'bulk-premium-plus') {
      if (totalQuantity >= 5 && totalQuantity <= 19) {
        options = [{ value: '6-months', label: '6 months' }];
      } else if (totalQuantity >= 20 && totalQuantity <= 29) {
        options = [{ value: '9-months', label: '9 months' }];
      } else if (totalQuantity >= 30) {
        options = [{ value: '12-months', label: '12 months' }];
      }
    }

    console.log('Validity options generated:', options, 'for total quantity:', totalQuantity);
    return options;
  }

  get filteredValidityOptions(): { value: string; label: string }[] {
    const options = this.validityOptions;

    const filtered = options.filter(option => {
      const validValues = ['6-months', '9-months', '12-months'];
      const isValid = validValues.includes(option.value) && option.label && option.label.trim() !== '';
      return isValid;
    });
    return filtered;
  }

  // Bulk subscription packages with pricing (matching Services.asp logic)
  bulkPackages: BulkSubscriptionPackage[] = [
    {
      id: 'bulk-standard',
      name: 'Standard Listing Job',
      startingPrice: 12500,
      pricePerJob: 2500
    },
    {
      id: 'bulk-premium',
      name: 'Premium Listing Job',
      startingPrice: 16000,
      pricePerJob: 3200
    },
    {
      id: 'bulk-premium-plus',
      name: 'Premium Plus Job',
      startingPrice: 24000,
      pricePerJob: 4800
    },
    {
      id: 'bulk-customized',
      name: 'Customized',
      startingPrice: 30000,
      pricePerJob: 6000
    }
  ];

  constructor(private orderService: OrderService) { }

  get selectedPackage(): BulkSubscriptionPackage {
    return this.bulkPackages.find(pkg => pkg.id === this.selectedBulkItemId) || this.bulkPackages[0];
  }

  get quantity(): number {
    return this.quantityControl.value ?? 0;
  }

  // Customized view quantities
  // Do not count when the section is collapsed
  get standardQuantity(): number {
    return this.isStandardExpanded() ? (this.standardQuantityControl.value ?? 0) : 0;
  }

  get premiumQuantity(): number {
    return this.isPremiumExpanded() ? (this.premiumQuantityControl.value ?? 0) : 0;
  }

  get premiumPlusQuantity(): number {
    return this.isPremiumPlusExpanded() ? (this.premiumPlusQuantityControl.value ?? 0) : 0;
  }

  get isCustomizedView(): boolean {
    return this.selectedPackage.id === 'bulk-customized';
  }

  get startingPrice(): number {
    if (this.isInternational) {
      // For international companies, calculate starting price in USD
      if (this.selectedPackage.id === 'bulk-standard') {
        // Standard starting price: 5 jobs × 28 USD = 140 USD
        return 28 * 5;
      } else if (this.selectedPackage.id === 'bulk-premium') {
        return 36 * 5;
      } else if (this.selectedPackage.id === 'bulk-premium-plus') {
        return 53 * 5;
      } else {
        const usdPricePerJob = this.usdPerJobByPackageId[this.selectedPackage.id] || 0;
        return usdPricePerJob * 5; // Starting package is always 5 jobs
      }
    }

    return this.selectedPackage.startingPrice;
  }

  get pricePerJob(): number {
    return this.selectedPackage.pricePerJob;
  }

  get totalPrice(): number {
    if (this.quantity === 0) return 0;
    const jobPrice = this.computeJobTotalFor(this.selectedPackage.id, this.quantity);
    console.log('totalPrice getter - Package:', this.selectedPackage.id, 'Quantity:', this.quantity, 'Job Price:', jobPrice, 'CV Expanded:', this.isTalentSearchExpanded(), 'CV Price:', this.cvPrice);
    if (this.isTalentSearchExpanded()) {
      const totalWithCV = jobPrice + this.cvPrice;
      console.log('Adding CV price. Total with CV:', totalWithCV);
      return totalWithCV;
    }
    console.log('No CV price added. Returning job price only:', jobPrice);
    return jobPrice;
  }

  get discountPercent(): number {
    // No discounts for international companies (USD)
    if (this.isInternational) return 0;

    if (this.quantity === 0) return 0;
    if (this.quantity < 5) return 0;

    // Different discount logic for different packages
    if (this.selectedPackage.id === 'bulk-standard') {
      // Standard package discount logic aligned to sheet
      if (this.quantity <= 10) return 12;
      if (this.quantity <= 19) return 23;
      if (this.quantity <= 29) return 23;
      if (this.quantity <= 40) return 28;
      if (this.quantity <= 50) return 33;
      if (this.quantity <= 100) return 43;
      if (this.quantity <= 200) return 48;
      return 54; // 201+
    } else if (this.selectedPackage.id === 'bulk-premium') {
      // Premium package discount logic 
      if (this.quantity >= 5 && this.quantity <= 10) return 18;
      if (this.quantity >= 11 && this.quantity <= 19) return 28;
      if (this.quantity >= 20 && this.quantity <= 29) return 28;
      if (this.quantity >= 30 && this.quantity <= 40) return 38;
      if (this.quantity >= 41 && this.quantity <= 50) return 43;
      if (this.quantity >= 51 && this.quantity <= 100) return 53;
      if (this.quantity >= 101 && this.quantity <= 200) return 57;
      if (this.quantity >= 201) return 62;
    } else if (this.selectedPackage.id === 'bulk-premium-plus') {
      // Premium Plus package discount logic - same as Premium
      if (this.quantity >= 5 && this.quantity <= 10) return 18;
      if (this.quantity >= 11 && this.quantity <= 19) return 28;
      if (this.quantity >= 20 && this.quantity <= 29) return 28;
      if (this.quantity >= 30 && this.quantity <= 40) return 38;
      if (this.quantity >= 41 && this.quantity <= 50) return 43;
      if (this.quantity >= 51 && this.quantity <= 100) return 53;
      if (this.quantity >= 101 && this.quantity <= 200) return 57;
      if (this.quantity >= 201) return 62;
    }

    return 0;
  }

  get discountAmount(): number {
    if (this.discountPercent === 0) return 0;
    const jobPriceForDiscount = this.jobPrice;
    const discount = (jobPriceForDiscount * this.discountPercent) / 100;
    console.log('discountAmount - Job Price for discount:', jobPriceForDiscount, 'Discount %:', this.discountPercent, 'Discount Amount:', discount);
    return discount;
  }

  get priceAfterDiscount(): number {
    // For customized view, use combined pricing
    if (this.isCustomizedView) {
      return this.customizedTotalPrice;
    }

    // For Standard package, prices are already discounted, so return job price directly
    if (this.selectedPackage.id === 'bulk-standard') {
      let finalPrice = this.jobPrice;

      if (this.isTalentSearchExpanded()) {
        finalPrice = finalPrice + this.cvPrice;
        console.log('Standard package - Adding CV cost:', this.cvPrice, 'Final price:', finalPrice);
        return finalPrice;
      }

      console.log('Standard package - No CV cost added. Final price:', finalPrice);
      return finalPrice;
    }

    // For Premium and Premium Plus packages, prices are already discounted, so return job price directly
    if (this.selectedPackage.id === 'bulk-premium' || this.selectedPackage.id === 'bulk-premium-plus') {
      let finalPrice = this.jobPrice;

      if (this.isTalentSearchExpanded()) {
        finalPrice = finalPrice + this.cvPrice;
        return finalPrice;
      }
      return finalPrice;
    }

    const discountedJobPrice = this.jobPrice - this.discountAmount;
    const roundedDiscountedJobPrice = Math.ceil(discountedJobPrice);


    if (this.isTalentSearchExpanded()) {
      const finalPrice = roundedDiscountedJobPrice + this.cvPrice;
      return finalPrice;
    }
    return roundedDiscountedJobPrice;
  }

  get vatAmount(): number {
    // No VAT for international companies (USD)
    if (this.isInternational) return 0;

    if (this.priceAfterDiscount === 0) return 0;
    const rawVat = this.priceAfterDiscount * this.vatRate;
    return Math.round(rawVat);
  }

  get totalAmount(): number {
    const finalAmount = this.priceAfterDiscount + this.vatAmount;
    return Math.round(finalAmount);
  }

  toggleTalentSearch() {
    this.isTalentSearchExpanded.set(!this.isTalentSearchExpanded());
    this.calculatePricing();
  }

  // Customized view toggle methods
  toggleStandard() {
    const nowOpen = !this.isStandardExpanded();
    this.isStandardExpanded.set(nowOpen);
    // Reset quantity when closing the section
    if (!nowOpen) this.standardQuantityControl.setValue(0, { emitEvent: true });
    this.updateValidityForCustomizedView();
    this.calculatePricing();
  }

  togglePremium() {
    const nowOpen = !this.isPremiumExpanded();
    this.isPremiumExpanded.set(nowOpen);
    if (!nowOpen) this.premiumQuantityControl.setValue(0, { emitEvent: true });
    this.updateValidityForCustomizedView();
    this.calculatePricing();
  }

  togglePremiumPlus() {
    const nowOpen = !this.isPremiumPlusExpanded();
    this.isPremiumPlusExpanded.set(nowOpen);
    if (!nowOpen) this.premiumPlusQuantityControl.setValue(0, { emitEvent: true });
    this.updateValidityForCustomizedView();
    this.calculatePricing();
  }

  toggleTalentSearchCustomized() {
    this.isTalentSearchCustomizedExpanded.set(!this.isTalentSearchCustomizedExpanded());
    this.updateValidityForCustomizedView();
    this.calculatePricing();
  }

  onValidityChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    if (target) {
      this.validityControl.setValue(target.value);
      this.calculatePricing();
    }
  }

  incrementQuantity() {
    const current = this.quantity;
    if (current === 0) {
      this.quantityControl.setValue(5);
    } else if (current < 9999) {
      this.quantityControl.setValue(current + 1);
    } else {
      this.quantityControl.setValue(9999);
    }
    this.updateValidityBasedOnQuantity();
    this.calculatePricing();
  }

  decrementQuantity() {
    if (this.quantity > 5) {
      this.quantityControl.setValue(this.quantity - 1);
      this.updateValidityBasedOnQuantity();
      this.calculatePricing();
    } else if (this.quantity === 5) {
      this.quantityControl.setValue(0);
      this.updateValidityBasedOnQuantity();
      this.calculatePricing();
    }
  }

  // Customized view quantity methods
  incrementStandardQuantity() {
    const currentValue = this.standardQuantityControl.value ?? 0;
    if (currentValue === 0) {
      this.standardQuantityControl.setValue(5);
    } else if (currentValue < 9999) {
      this.standardQuantityControl.setValue(currentValue + 1);
    } // if at 9999, do nothing
    this.calculatePricing();
    this.updateValidityForCustomizedView();
  }

  decrementStandardQuantity() {
    const currentValue = this.standardQuantityControl.value ?? 0;
    if (currentValue > 5) {
      this.standardQuantityControl.setValue(currentValue - 1);
      this.calculatePricing();
      this.updateValidityForCustomizedView();
    } else if (currentValue === 5) {
      this.standardQuantityControl.setValue(0);
      this.calculatePricing();
      this.updateValidityForCustomizedView();
    }
  }

  incrementPremiumQuantity() {
    const currentValue = this.premiumQuantityControl.value ?? 0;
    if (currentValue === 0) {
      this.premiumQuantityControl.setValue(5);
    } else if (currentValue < 9999) {
      this.premiumQuantityControl.setValue(currentValue + 1);
    } // if at 9999, do nothing
    this.calculatePricing();
    this.updateValidityForCustomizedView();
  }

  decrementPremiumQuantity() {
    const currentValue = this.premiumQuantityControl.value ?? 0;
    if (currentValue > 5) {
      this.premiumQuantityControl.setValue(currentValue - 1);
      this.calculatePricing();
      this.updateValidityForCustomizedView();
    } else if (currentValue === 5) {
      this.premiumQuantityControl.setValue(0);
      this.calculatePricing();
      this.updateValidityForCustomizedView();
    }
  }

  incrementPremiumPlusQuantity() {
    const currentValue = this.premiumPlusQuantityControl.value ?? 0;
    if (currentValue === 0) {
      this.premiumPlusQuantityControl.setValue(5);
    } else if (currentValue < 9999) {
      this.premiumPlusQuantityControl.setValue(currentValue + 1);
    } // if at 9999, do nothing
    this.calculatePricing();
    this.updateValidityForCustomizedView();
  }

  decrementPremiumPlusQuantity() {
    const currentValue = this.premiumPlusQuantityControl.value ?? 0;
    if (currentValue > 5) {
      this.premiumPlusQuantityControl.setValue(currentValue - 1);
      this.calculatePricing();
      this.updateValidityForCustomizedView();
    } else if (currentValue === 5) {
      this.premiumPlusQuantityControl.setValue(0);
      this.calculatePricing();
      this.updateValidityForCustomizedView();
    }
  }

  private updateValidityBasedOnQuantity() {
    if (this.quantity === 0) {
      this.validityControl.setValue('');
      this.validityControl.reset();
    } else if (this.selectedPackage.id === 'bulk-standard') {
      if (this.quantity >= 5 && this.quantity <= 19) {
        this.validityControl.setValue('6-months');
      } else if (this.quantity >= 20 && this.quantity <= 29) {
        this.validityControl.setValue('9-months');
      } else if (this.quantity >= 30) {
        this.validityControl.setValue('12-months');
      }
    } else if (this.selectedPackage.id === 'bulk-premium') {
      // Premium package validity periods
      if (this.quantity >= 5 && this.quantity <= 10) {
        this.validityControl.setValue('6-months');
      } else if (this.quantity >= 11 && this.quantity <= 19) {
        this.validityControl.setValue('6-months');
      } else if (this.quantity >= 20 && this.quantity <= 29) {
        this.validityControl.setValue('9-months');
      } else if (this.quantity >= 30) {
        this.validityControl.setValue('12-months');
      }
    } else if (this.selectedPackage.id === 'bulk-premium-plus') {
      if (this.quantity >= 5 && this.quantity <= 19) {
        this.validityControl.setValue('6-months');
      } else if (this.quantity >= 20 && this.quantity <= 29) {
        this.validityControl.setValue('9-months');
      } else if (this.quantity >= 30) {
        this.validityControl.setValue('12-months');
      }
    }

    this.validityControl.markAsPristine();
    this.validityControl.markAsUntouched();
  }

  private updateValidityForCustomizedView(): void {
    if (this.isCustomizedView) {
      const totalQuantity = this.standardQuantity + this.premiumQuantity + this.premiumPlusQuantity;

      if (totalQuantity === 0) {
        this.validityControl.setValue('');
      } else {
        if (totalQuantity >= 5 && totalQuantity <= 19) {
          this.validityControl.setValue('6-months');
        } else if (totalQuantity >= 20 && totalQuantity <= 29) {
          this.validityControl.setValue('9-months');
        } else if (totalQuantity >= 30) {
          this.validityControl.setValue('12-months');
        }
      }

      this.validityControl.markAsPristine();
      this.validityControl.markAsUntouched();
    }
  }

  calculatePricing() {

    console.log('calculatePricing called - forcing change detection');

    const currentState = this.isTalentSearchExpanded();
    this.isTalentSearchExpanded.set(!currentState);
    this.isTalentSearchExpanded.set(currentState);
  }

  formatNumber(num: number): string {
    return num.toLocaleString('en-IN');
  }

  placeOrder(): void {
    try {
      const currency = this.currencyLabel;
      const packageId = this.selectedPackage.id;
      const packageName = this.selectedPackage.name;
      const quantity = this.isCustomizedView
        ? (this.standardQuantity + this.premiumQuantity + this.premiumPlusQuantity)
        : this.quantity;
      const totalAmount = this.totalAmount;
      const validity = this.selectedValidity;

      const orderRequest = this.orderService.createOrderRequest(
        packageId,
        packageName,
        quantity,
        currency as 'BDT' | 'USD',
        totalAmount
      );

      const validation = this.orderService.validateOrderRequest(orderRequest);
      if (!validation.isValid) {
        console.error('Order validation failed:', validation.errors);
        return;
      }

      this.orderService.logOrderRequest(orderRequest);

      this.orderService.getOrderURL(
        orderRequest.orderType,
        currency,
        quantity,
        packageId,
        packageName,
        totalAmount
      );

    } catch (error) {
      console.error('Error placing bulk subscription order:', error);
    }
  }
}
