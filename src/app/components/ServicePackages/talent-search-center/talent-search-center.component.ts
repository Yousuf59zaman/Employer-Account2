import { Component, Input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../../Services/order.service';

interface CVItem {
  numberOfCV: string;
  price: string;
}

interface TalentSearchOption {
  id: string;
  name: string;
  isActive: boolean;
}



@Component({
  selector: 'app-talent-search-center',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './talent-search-center.component.html',
  styleUrl: './talent-search-center.component.scss'
})
export class TalentSearchCenterComponent {
  @Input() selectedTalentSearchOption: TalentSearchOption | null = null;

  private companyCountry = signal<string>('');
  
  // Bulk selection signals
  selectedQuantity = signal<number>(1000);
  selectedValidity = signal<number>(1);

  cvItems = signal<CVItem[]>([
    { numberOfCV: '3 CV', price: '99 BDT total' },
    { numberOfCV: '4 CV and above', price: '30 BDT per CV' }
  ]);

  resumeOnDemandPrice = signal(15000);
  vatRate = signal(0.05);

  // Bulk pricing configuration - matching Services.asp cvPriceArr structure
  // [month, quantity, bdtPrice, usdPrice]
  bulkPricingConfig: number[][] = [
    [1, 1000, 4000, 65],    // 1 month, 1000 CV, 4000 BDT, 65 USD
    [1, 2000, 7000, 100],   // 1 month, 2000 CV, 7000 BDT, 100 USD
    [1, 2500, 7500, 110],   // 1 month, 2500 CV, 7500 BDT, 110 USD
    [3, 1000, 5000, 80],    // 3 months, 1000 CV, 5000 BDT, 80 USD
    [3, 2000, 9000, 125],   // 3 months, 2000 CV, 9000 BDT, 125 USD
    [3, 2500, 10000, 135],  // 3 months, 2500 CV, 10000 BDT, 135 USD
    [3, 5000, 15000, 200],  // 3 months, 5000 CV, 15000 BDT, 200 USD
    [6, 2500, 15000, 200],  // 6 months, 2500 CV, 15000 BDT, 200 USD
    [6, 5000, 20000, 260],  // 6 months, 5000 CV, 20000 BDT, 260 USD
    [6, 10000, 30000, 380], // 6 months, 10000 CV, 30000 BDT, 380 USD
    [12, 5000, 25000, 320], // 12 months, 5000 CV, 25000 BDT, 320 USD
    [12, 10000, 35000, 440], // 12 months, 10000 CV, 35000 BDT, 440 USD
    [12, 15000, 45000, 560] // 12 months, 15000 CV, 45000 BDT, 560 USD
  ];

  constructor(private orderService: OrderService) {
    this.companyCountry.set(localStorage.getItem('CompanyCountry') || '');
  }

  protected readonly isInternational = computed(() => {
    const country = this.companyCountry().trim().toLowerCase();
    return country !== '' && country !== 'bangladesh';
  });

  protected readonly currencyLabel = computed(() => 
    this.isInternational() ? 'USD' : 'BDT'
  );

  protected readonly cvItemsDisplay = computed(() => {
    if (this.isInternational()) {
      return [
        { numberOfCV: '3 CV', price: '2.5 USD total' },
        { numberOfCV: '4 CV and above', price: '0.5 USD per CV' }
      ];
    }
    return this.cvItems();
  });

  protected readonly resumeOnDemandPriceDisplay = computed(() => 
    this.isInternational() ? 200 : this.resumeOnDemandPrice()
  );

  protected readonly vatAmount = computed(() => 
    this.resumeOnDemandPriceDisplay() * this.vatRate()
  );

  protected readonly totalAmount = computed(() => 
    this.resumeOnDemandPriceDisplay() + this.vatAmount()
  );

  protected readonly bulkPrice = computed(() => {
    const month = this.selectedValidity();
    const quantity = this.selectedQuantity();
    
    const config = this.bulkPricingConfig.find(c => c[0] === month && c[1] === quantity);
    
    if (this.isInternational()) {
      return config ? config[3] : 65; // USD price
    }
    return config ? config[2] : 4000; // BDT price
  });

  protected readonly bulkVatAmount = computed(() => 
    this.isInternational() ? 0 : (this.bulkPrice() * this.vatRate())
  );

  protected readonly bulkTotalAmount = computed(() => 
    this.bulkPrice() + this.bulkVatAmount()
  );

  protected getValidityOptions(): number[] {
    const quantity = this.selectedQuantity();
    
    const validityOptions = this.bulkPricingConfig
      .filter(c => c[1] === quantity)
      .map(c => c[0])
      .sort((a, b) => a - b);
    
    return validityOptions.length > 0 ? validityOptions : [1];
  }

  protected getDefaultValidity(): number {
    const quantity = this.selectedQuantity();
    
    const validityOptions = this.getValidityOptions();
    return validityOptions.length > 0 ? validityOptions[0] : 1;
  }

  protected getBulkSubscriptionDetails(): void {
    const quantity = this.selectedQuantity();
    const validity = this.selectedValidity();
    const currency = this.currencyLabel();
    const basePrice = this.bulkPrice();
    const totalAmount = this.bulkTotalAmount();
    
    console.log(`Bulk Subscription Details (Services.asp style):
      Quantity: ${quantity}
      Validity: ${validity} months
      Base Price: ${basePrice} ${currency}
      VAT: ${this.bulkVatAmount()} ${currency}
      Total Amount: ${totalAmount} ${currency}
      Price per Job: ${basePrice} ${currency} (${validity} months validity)
    `);
  }

  protected onQuantityChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newQuantity = parseInt(target.value);
    this.selectedQuantity.set(newQuantity);
    
    const defaultValidity = this.getDefaultValidity();
    this.selectedValidity.set(defaultValidity);
    
    // Get bulk subscription details when quantity changes (like Services.asp)
    this.getBulkSubscriptionDetails();
    
    // Log the change for debugging
    console.log(`Bulk quantity changed to: ${newQuantity}, validity reset to: ${defaultValidity} months`);
  }

  protected onValidityChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newValidity = parseInt(target.value);
    this.selectedValidity.set(newValidity);
    
    this.getBulkSubscriptionDetails();
    
    console.log(`Bulk validity changed to: ${newValidity} months`);
  }

  protected placeResumeOnDemandOrder(): void {
    if (this.selectedTalentSearchOption?.id !== 'resume-on-demand') {
      console.warn('Cannot place order: Resume on Demand not selected');
      return;
    }

    try {
      const currency = this.currencyLabel();
      const packageId = 'resume-on-demand';
      const packageName = 'Resume on Demand';
      const totalAmount = this.totalAmount();

      const orderRequest = this.orderService.createOrderRequest(
        packageId,
        packageName,
        1,
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
        1,
        packageId,
        packageName,
        totalAmount
      );

      console.log(`Resume on Demand order placed successfully - Total: ${totalAmount} ${currency}`);
      console.log(`Order Type: ${this.orderService.getOrderTypeLabel(packageId)}`);
    } catch (error) {
      console.error('Error placing Resume on Demand order:', error);
    }
  }

  protected placeInstantBuyOrder(): void {
    if (this.selectedTalentSearchOption?.id !== 'instant-buy') {
      console.warn('Cannot place order: Instant Buy not selected');
      return;
    }

    try {
      const currency = this.currencyLabel();
      const packageId = 'instant-buy';
      const packageName = 'Instant Buy';
      const totalAmount = this.isInternational() ? 2.5 : 99; // Base price for Instant Buy

      const orderRequest = this.orderService.createOrderRequest(
        packageId,
        packageName,
        1, // Default quantity for Instant Buy
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
        1, // Default quantity
        packageId,
        packageName,
        totalAmount
      );

      console.log(`Instant Buy order placed successfully - Total: ${totalAmount} ${currency}`);
      console.log(`Order Type: ${this.orderService.getOrderTypeLabel(packageId)}`);
    } catch (error) {
      console.error('Error placing Instant Buy order:', error);
    }
  }

  protected placeBulkOrder(): void {
    if (this.selectedTalentSearchOption?.id !== 'bulk') {
      console.warn('Cannot place order: Bulk not selected');
      return;
    }

    try {
      this.getBulkSubscriptionDetails();
      
      const currency = this.currencyLabel();
      const packageId = 'bulk-cv';
      const packageName = 'Bulk CV/Talent Search';
      const totalAmount = this.bulkTotalAmount();

      const orderRequest = this.orderService.createOrderRequest(
        packageId,
        packageName,
        this.selectedQuantity(),
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
        this.selectedQuantity(),
        packageId,
        packageName,
        totalAmount
      );

      console.log(`Bulk order placed successfully - Quantity: ${this.selectedQuantity()}, Validity: ${this.selectedValidity()} months, Total: ${totalAmount} ${currency}`);
      console.log(`Order Type: ${this.orderService.getOrderTypeLabel(packageId)}`);
    } catch (error) {
      console.error('Error placing Bulk order:', error);
    }
  }

  formatNumber(num: number): string {
    return num.toLocaleString('en-IN');
  }
}

