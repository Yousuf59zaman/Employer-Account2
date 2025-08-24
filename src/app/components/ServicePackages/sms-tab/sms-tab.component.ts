import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { NumericOnlyDirective } from '../../../directives/numeric-only.dir';
import { SmsVerificationModalComponent } from './sms-verification-modal.component';

@Component({
  selector: 'app-sms-tab',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NumericOnlyDirective, SmsVerificationModalComponent],
  templateUrl: './sms-tab.component.html',
  styleUrl: './sms-tab.component.scss'
})
export class SmsTabComponent {
  showVerificationModal = false;

  // Quantity must be at least 1 lot
  quantityControl = new FormControl<number>(1, { nonNullable: true, validators: [Validators.min(1), Validators.max(9999)] });
  private readonly smsPerLot = 200;
  private readonly perSmsBDT = 0.50; // 0.50 BDT per SMS
  private readonly perSmsUSD = 0.05; // 0.05 USD per SMS
  private readonly fallbackUsdToBdtRate = 80; // Fallback like services.asp

  get isInternational(): boolean {
    const country = (localStorage.getItem('CompanyCountry') || '').trim().toLowerCase();
    return country !== '' && country !== 'bangladesh';
  }

  get perSmsDisplayLabel(): string {
    if (this.isInternational) {
      const usd = this.perSmsUSD.toFixed(2).replace(/^0/, '');
      return `${usd} USD`;
    }
    return `${this.perSmsBDT.toFixed(2)} Tk`;
  }

  get smsPerLotSize(): number {
    return this.smsPerLot;
  }

  get currencyLabel(): 'BDT' | 'USD' {
    return this.isInternational ? 'USD' : 'BDT';
  }

  get unitPrice(): number {
    // Per-lot price = 200 * per-SMS rate
    return this.isInternational
      ? Math.round(this.smsPerLot * this.perSmsUSD)
      : Math.round(this.smsPerLot * this.perSmsBDT);
  }

  get totalPrice(): number {
    return (this.quantityControl.value || 0) * this.unitPrice;
  }

  formatNumber(value: number): string {
    try {
      return new Intl.NumberFormat('en-US').format(value);
    } catch {
      return String(value);
    }
  }

  decrement(): void {
    const current = this.quantityControl.value || 1;
    if (current > 1) this.quantityControl.setValue(current - 1);
  }

  increment(): void {
    const current = this.quantityControl.value || 0;
    this.quantityControl.setValue(current + 1);
  }

  onQuantityInput(value: string): void {
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed) && parsed >= 1) {
      this.quantityControl.setValue(parsed);
    }
  }

  async placeOrder(): Promise<void> {
    const companyId = (localStorage.getItem('CompanyId') || '').trim();
    // const smsPackageAllowed = (localStorage.getItem('SMSPackage') || '').toLowerCase() === 'true';
    if (!companyId) {
      this.showVerificationModal = true;
      return;
    }

    //  async placeOrder(): Promise<void> {
    // const companyId = (localStorage.getItem('CompanyId') || '').trim();
    // const smsPackageAllowed = (localStorage.getItem('SMSPackage') || '').toLowerCase() === 'true';
    // if (!companyId || !smsPackageAllowed) {
    //   this.showVerificationModal = true;
    //   return;
    // }


    // Safety: enforce minimum of 1 lot at order time
    const lots = Math.max(1, this.quantityControl.value || 1);
    const totalSms = lots * this.smsPerLot;

    try {
      if (this.isInternational) {
        const usdAmount = this.totalPrice;
        const rate = await this.getUsdToBdtRateSafe();
        const bdtAmount = Math.round(usdAmount * rate);
        this.buildAndSubmitSmsForm(bdtAmount, totalSms, usdAmount);
      } else {
        const bdtAmount = this.totalPrice;
        this.buildAndSubmitSmsForm(bdtAmount, totalSms);
      }
    } catch (error) {
      console.error('Error while placing SMS order:', error);
    }
  }

  private async getUsdToBdtRateSafe(): Promise<number> {
    try {
      const res = await fetch('https://api.exchangerate.host/latest?base=USD&symbols=BDT', { cache: 'no-store' });
      if (!res.ok) throw new Error('FX fetch failed');
      const data = await res.json();
      const rate = Number(data?.rates?.BDT);
      if (!isFinite(rate) || rate <= 0) return this.fallbackUsdToBdtRate;
      return rate;
    } catch {
      return this.fallbackUsdToBdtRate;
    }
  }

  private buildAndSubmitSmsForm(totalAmountBDT: number, totalSms: number, usdAmount?: number): void {
    const form = document.createElement('form');
    form.method = 'POST';
    form.target = '_blank';
    form.action = 'https://corporate3.bdjobs.com/Job_Posting_PaymentDetails.asp';

    const hidden = (name: string, value: string) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value;
      form.appendChild(input);
    };

    hidden('hidInvoiceDate', '');
    hidden('hidInvoice', 'False');
    hidden('hdInvoiceOrJobId', '0');
    hidden('hidServiceId', '78');
    hidden('hidServiceName', 'SMS Package');
    hidden('hidTotalAmount', String(totalAmountBDT));

    hidden('hidCompanyId', '');
    hidden('hidCom', '');
    hidden('hidServiceType', '0');
    hidden('hidPaymentDolar', usdAmount ? String(usdAmount) : '0');
    hidden('hidTotalSMS', String(totalSms));

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  }
}


