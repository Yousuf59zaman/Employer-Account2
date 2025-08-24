import { Injectable } from '@angular/core';
import { PACKAGE_ORDER_TYPE_MAPPING, ORDER_TYPE_LABELS } from '../constants/order-types.constants';

export interface OrderRequest {
  orderType: string;
  employerType: 'Local' | 'Foreign';
  quantity?: number;
  currency: 'BDT' | 'USD';
  packageId: string;
  packageName: string;
  totalAmount: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor() { }

  getOrderURL(orderType: string, currency: string, quantity: number = 0, packageId: string = '', packageName: string = '', totalAmount: number = 0): void {
    console.log('=== getOrderURL called ===');
    console.log('Parameters:', { orderType, currency, quantity, packageId, packageName, totalAmount });
    
    let employerType: 'Local' | 'Foreign' = 'Local';
    
    if (currency && currency.toLowerCase().includes('usd')) {
      employerType = 'Foreign';
    }

    console.log('Employer type determined:', employerType);

    // Map package IDs to order types using constants
    const mappedOrderType = PACKAGE_ORDER_TYPE_MAPPING[packageId] || orderType;
    console.log('Mapped order type:', mappedOrderType);

    // Construct order URL
    const baseUrl = '//corporate3.bdjobs.com/csi/default.asp';
    const queryParams = new URLSearchParams({
      order: 'order',
      EmployerType: employerType,
      ordType: mappedOrderType
    });

    // Add additional parameters for tracking
    if (quantity >= 0) {
      queryParams.append('quantity', quantity.toString());
    }
    if (packageId) {
      queryParams.append('packageId', packageId);
    }
    if (packageName) {
      queryParams.append('packageName', packageName);
    }
    if (totalAmount > 0) {
      queryParams.append('totalAmount', totalAmount.toString());
    }

    const fullUrl = `${baseUrl}?${queryParams.toString()}`;
    console.log('Full URL constructed:', fullUrl);

    // Open order page in new tab (matching ASP behavior)
    console.log('Opening URL in new tab...');
    window.open(fullUrl, '_blank');
    console.log('URL opened successfully');
  }

//  order request
  createOrderRequest(
    packageId: string,
    packageName: string,
    quantity: number,
    currency: 'BDT' | 'USD',
    totalAmount: number
  ): OrderRequest {
    return {
      orderType: this.getOrderTypeFromPackageId(packageId),
      employerType: currency === 'BDT' ? 'Local' : 'Foreign',
      quantity,
      currency,
      packageId,
      packageName,
      totalAmount
    };
  }

  
  private getOrderTypeFromPackageId(packageId: string): string {
    return PACKAGE_ORDER_TYPE_MAPPING[packageId] || '1';
  }

  
  getOrderTypeLabel(packageId: string): string {
    const orderType = this.getOrderTypeFromPackageId(packageId);
    return ORDER_TYPE_LABELS[orderType as keyof typeof ORDER_TYPE_LABELS] || 'Standard Listing';
  }

 
  logOrderRequest(request: OrderRequest): void {
    console.log('Order Request:', request);
    console.log('Order Type Label:', this.getOrderTypeLabel(request.packageId));
  }

  
  validateOrderRequest(request: OrderRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!request.packageId) {
      errors.push('Package ID is required');
    }

    if (!request.packageName) {
      errors.push('Package name is required');
    }

    if (!request.currency) {
      errors.push('Currency is required');
    }

    // Note: Quantity and totalAmount can be 0 as users can set these on the order form
    // Only validate that they are numbers if provided
    if (request.quantity !== undefined && request.quantity < 0) {
      errors.push('Quantity cannot be negative');
    }

    if (request.totalAmount < 0) {
      errors.push('Total amount cannot be negative');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
