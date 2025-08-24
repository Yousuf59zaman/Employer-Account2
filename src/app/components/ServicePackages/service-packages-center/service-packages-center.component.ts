import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../../Services/order.service';
import { SmeVisibilityService } from '../../../Services/sme-visibility.service';
import { NumericOnlyDirective } from '../../../directives/numeric-only.dir';


interface Package {
  id: string;
  name: string;
  price: number;
  type: 'prepaid' | 'pay-as-you-go' | 'free';
  recommended?: boolean;
}

interface PNPLItem {
  contacts: string;
  price: number;
}

@Component({
  selector: 'app-service-packages-center',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NumericOnlyDirective],
  templateUrl: './service-packages-center.component.html',
  styleUrl: './service-packages-center.component.scss'
})
export class ServicePackagesCenterComponent implements OnChanges {
  @Input() selectedPackage: Package | null = null;

  quantityControl = new FormControl(0, { nonNullable: true });
  pricePerJob: number = 500;
  vatRate: number = 0.05;

  constructor(
    private orderService: OrderService,
    private smeVisibilityService: SmeVisibilityService
  ) {}

  // Hot Jobs pricing tiers
  hotJobsPricing = [
    { quantity: 1, price: 13500 },
    { quantity: 2, price: 9500 },
    { quantity: 3, price: 7400 },
    { quantity: 4, price: 7000 },
    { quantity: 5, price: 6750 },
    { quantity: 6, price: 6100 },
    { quantity: 7, price: 6100 },
    { quantity: 8, price: 6100 },
    { quantity: 9, price: 6100 },
    { quantity: 10, price: 6100 }
  ];

  private readonly usdPerJobByPackageId: Record<string, number> = {
    'sme-listing': 55,           // SMEPriceUSD
    'standard-listing': 35,      // StandardPriceUSD
    'premium-listing': 45,       // PremiumPriceUSD
    'premium-plus': 65,          // PremiumPlusPriceUSD
    'hot-job': 150               // HotJobPriceUSD
  };

  // BDT prices from ASP logic
  private readonly bdtPerJobByPackageId: Record<string, number> = {
    'sme-listing': 500,          // SMEPrice from ASP
    'standard-listing': 2850,    // StandardPrice
    'premium-listing': 3900,     // PremiumPrice
    'premium-plus': 5900,        // PremiumPlusPrice
    'hot-job': 13500             // HotJobPrice
  };

  pnplItems: PNPLItem[] = [
    { contacts: '5 Contacts', price: 1040 },
    { contacts: '10 Contacts', price: 1575 },
    { contacts: '15 Contacts', price: 1995 },
    { contacts: '20 Contacts', price: 2615 },
    { contacts: 'All Contacts', price: 5145 }
  ];

  get selectedPackageData(): Package | null {
    return this.selectedPackage || {
      id: 'standard-listing',
      name: 'Standard Listing',
      price: 500,
      type: 'prepaid'
    };
  }

  get isPNPL(): boolean {
    return this.selectedPackage?.id === 'pnpl';
  }

  get isHotJob(): boolean {
    return this.selectedPackage?.id === 'hot-job';
  }

  get isSmeListing(): boolean {
    return this.selectedPackage?.id === 'sme-listing';
  }

  // Country
  get isInternational(): boolean {
    const country = (localStorage.getItem('CompanyCountry') || '').trim().toLowerCase();
    return country !== '' && country !== 'bangladesh';
  }

  get currencyLabel(): string {
    return this.isInternational ? 'USD' : 'BDT';
  }

  get quantity(): number {
    return this.quantityControl.value ?? 0;
  }

  get hotJobPricePerJob(): number {
    if (!this.isHotJob || this.quantity === 0) {
      return this.isInternational
        ? (this.selectedPackage ? (this.usdPerJobByPackageId[this.selectedPackage.id] || this.pricePerJob) : this.pricePerJob)
        : this.pricePerJob;
    }
    if (this.isInternational) {
      const q = this.quantity;
      if (q <= 1) return 150; // 1 job
      if (q === 2) return 110;
      if (q === 3) return 85;
      if (q === 4) return 80;
      if (q === 5) return 75;
      // 6 to 10 and 10+ => 70 USD per job
      return 70;
    }

    const pricingTier = this.hotJobsPricing.find(tier => tier.quantity === this.quantity);
    if (pricingTier) {
      return pricingTier.price;
    }
    if (this.quantity > 10) {
      const maxTier = this.hotJobsPricing.find(tier => tier.quantity === 10);
      return maxTier ? maxTier.price : this.pricePerJob;
    }
    return this.pricePerJob;
  }

  get displayPricePerJob(): number {
    if (this.isHotJob) {
      return this.hotJobPricePerJob;
    }
    if (this.isInternational) {
      const id = this.selectedPackage?.id || '';
      return this.usdPerJobByPackageId[id] || this.pricePerJob;
    }
    return this.pricePerJob;
  }

  get totalPrice(): number {
    if (this.isHotJob && this.quantity > 0) {
      return this.hotJobPricePerJob * this.quantity;
    }
    if (this.isInternational) {
      return this.displayPricePerJob * this.quantity;
    }
    return this.quantity * this.pricePerJob;
  }

  get discountPercent(): number {
    if (!this.isHotJob || this.quantity === 0) {
      return 0;
    }
    if (this.isInternational) {
      return 0;
    }
    
    const originalPrice = this.quantity * this.pricePerJob;
    const tierPrice = this.totalPrice;
    const discountAmount = originalPrice - tierPrice;
    const discountPercent = (discountAmount / originalPrice) * 100;
    
    return discountPercent;
  }

  get roundedDiscountPercent(): number {
    const rawPercent = this.discountPercent;
    const decimalPart = rawPercent - Math.floor(rawPercent);
    
    if (decimalPart >= 0.5) {
      return Math.ceil(rawPercent);
    } else {
      return Math.floor(rawPercent);
    }
  }

  get discountAmount(): number {
    if (!this.isHotJob || this.quantity === 0) {
      return 0;
    }
    
    const originalPrice = this.quantity * this.pricePerJob;
    const tierPrice = this.totalPrice;
    return originalPrice - tierPrice;
  }

  get priceAfterDiscount(): number {
    if (!this.isHotJob) {
      return this.totalPrice;
    }
    
    return this.totalPrice;
  }

  get vatAmount(): number {
    if (this.isInternational) {
      return 0;
    }
    const rawVat = this.priceAfterDiscount * this.vatRate;
    const decimalPart = rawVat - Math.floor(rawVat);
    if (decimalPart >= 0.5) {
      return Math.ceil(rawVat);
    } else {
      return Math.floor(rawVat);
    }
  }

  get totalAmount(): number {
    if (this.isInternational) {
      return this.priceAfterDiscount;
    }
    return this.priceAfterDiscount + this.vatAmount;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedPackage'] && this.selectedPackage) {
      // Set the correct price based on package and currency
      this.updatePricePerJob();
      this.quantityControl.setValue(0);
    }
  }

  private updatePricePerJob(): void {
    if (!this.selectedPackage) return;
    const packageId = this.selectedPackage.id;
    if (this.isInternational) {
      // Use USD pricing
      this.pricePerJob = this.usdPerJobByPackageId[packageId] || 500;
    } else {
      // Use BDT pricing
      this.pricePerJob = this.bdtPerJobByPackageId[packageId] || 500;
    }
  }

  incrementQuantity() {
    this.quantityControl.setValue(this.quantity + 1);
  }

  decrementQuantity() {
    if (this.quantity > 0) {
      this.quantityControl.setValue(this.quantity - 1);
    }
  }

  onQuantityChange(value: string) {
    if (value === '') {
      this.quantityControl.setValue(0);
      return;
    }
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 0) {
      this.quantityControl.setValue(num);
    } else {
      this.quantityControl.setValue(0);
    }
  }

  formatNumber(num: number): string {
    return num.toLocaleString('en-IN');
  }

 
  placeOrder(): void {
    if (!this.selectedPackage) {
      console.warn('Cannot place order: No package selected');
      return;
    }

    try {
      const currency = this.currencyLabel;
      const packageId = this.selectedPackage.id;
      const packageName = this.selectedPackage.name;
      const quantity = this.quantity; 
      const totalAmount = this.totalAmount; 

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

      console.log(`Order placed successfully for ${packageName} - Quantity: ${quantity}, Total: ${totalAmount} ${currency}`);
      console.log(`Order Type: ${this.orderService.getOrderTypeLabel(packageId)}`);
    } catch (error) {
      console.error('Error placing order:', error);
    }
  }
}
