import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServicePackagesLeftbarComponent } from "../../components/ServicePackages/service-packages-leftbar/service-packages-leftbar.component";
import { ServicePackagesCenterComponent } from "../../components/ServicePackages/service-packages-center/service-packages-center.component";
import { ServicePackagesRightbarComponent } from "../../components/ServicePackages/service-packages-rightbar/service-packages-rightbar.component";
import { BulkSubscriptionLeftbarComponent } from "../../components/ServicePackages/bulk-subscription-leftbar/bulk-subscription-leftbar.component";
import { BulkSubscriptionCenterComponent } from "../../components/ServicePackages/bulk-subscription-center/bulk-subscription-center/bulk-subscription-center.component";
import { SmsTabComponent } from "../../components/ServicePackages/sms-tab/sms-tab.component";
import { TalentSearchLeftbarComponent } from "../../components/ServicePackages/talent-search-leftbar/talent-search-leftbar.component";
import { TalentSearchCenterComponent } from "../../components/ServicePackages/talent-search-center/talent-search-center.component";
import { TalentSearchRightbarComponent } from '../../components/ServicePackages/talent-search-rightbar/talent-search-rightbar.component';
import { BulkSubscriptionRightbarComponent } from '../../components/ServicePackages/bulk-subscription-rightbar/bulk-subscription-rightbar.component';
import { SmeVisibilityService } from '../../Services/sme-visibility.service';
import { ServicePackagesFooterComponent } from '../../components/Shared/service-packages-footer/service-packages-footer.component';
import { PackageId } from '../../components/ServicePackages/bulk-subscription-center/bulk-subscription-center/bulk-subscription-center.component';

interface Package {
  id: string;
  name: string;
  price: number;
  type: 'prepaid' | 'pay-as-you-go' | 'free';
  recommended?: boolean;
}

interface TalentSearchOption {
  id: string;
  name: string;
  isActive: boolean;
}

interface PNPLItem {
  contacts: string;
  price: number;
}

@Component({
  selector: 'app-service-packages',
  standalone: true,
  imports: [CommonModule, ServicePackagesLeftbarComponent, ServicePackagesCenterComponent, ServicePackagesRightbarComponent, TalentSearchLeftbarComponent, TalentSearchCenterComponent, BulkSubscriptionLeftbarComponent, BulkSubscriptionCenterComponent, BulkSubscriptionRightbarComponent, SmsTabComponent, ServicePackagesFooterComponent],
  templateUrl: './service-packages.component.html',
  styleUrl: './service-packages.component.scss'
})
export class ServicePackagesComponent implements OnInit {
  selectedPackage: Package | null = {
    id: 'standard-listing',
    name: 'Standard Listing',
    price: 2850,
    type: 'prepaid'
  };

  activeTab: 'jobs' | 'talent-search' | 'bulk-subscription' | 'sms' | 'others' = 'jobs';
  selectedTalentSearchOption: TalentSearchOption | null = null;
  selectedBulkSubscriptionItemId: PackageId = 'bulk-standard';
  showSmePackage: boolean = false;

  // PNPL pricing data
  pnplItems: PNPLItem[] = [
    { contacts: '5 Contacts', price: 1040 },
    { contacts: '10 Contacts', price: 1575 },
    { contacts: '15 Contacts', price: 1995 },
    { contacts: '20 Contacts', price: 2615 },
    { contacts: 'All Contacts', price: 5145 }
  ];

  pnplItemsUsd: PNPLItem[] = [
    { contacts: '5 Contacts', price: 18 },
    { contacts: '10 Contacts', price: 28 },
    { contacts: '15 Contacts', price: 35 },
    { contacts: '20 Contacts', price: 46 },
    { contacts: 'All Contacts', price: 73 }
  ];

  constructor(private smeVisibilityService: SmeVisibilityService) { }

  ngOnInit() {
    // Check SME package visibility on component initialization
    this.showSmePackage = this.smeVisibilityService.getFinalSmeVisibility();

    // If SME package is hidden and it's currently selected, switch to standard listing
    if (!this.showSmePackage && this.selectedPackage?.id === 'sme-listing') {
      this.selectedPackage = {
        id: 'standard-listing',
        name: 'Standard Listing',
        price: 2850,
        type: 'prepaid'
      };
    }
  }

  onPackageSelected(selectedPackage: Package) {
    this.selectedPackage = selectedPackage;
  }

  setActiveTab(tab: 'jobs' | 'talent-search' | 'bulk-subscription' | 'sms' | 'others') {
    this.activeTab = tab;

    // Set default talent search option when talent-search tab is activated
    if (tab === 'talent-search') {
      this.selectedTalentSearchOption = {
        id: 'instant-buy',
        name: 'Instant Buy',
        isActive: true
      };
    }
  }

  onTalentSearchOptionSelected(option: TalentSearchOption) {
    this.selectedTalentSearchOption = option;
  }

  onBulkSubscriptionItemSelected(item: { id: string; label: string }) {
    this.selectedBulkSubscriptionItemId = item.id as PackageId;
  }

  // Currency helpers aligned with other components
  get isInternational(): boolean {
    const country = (localStorage.getItem('CompanyCountry') || '').trim().toLowerCase();
    return country !== '' && country !== 'bangladesh';
  }

  // Debug method for SME visibility
  debugSmeVisibility(): void {
    this.smeVisibilityService.debugCompanyInfo();
  }

  // Getter for localStorage access in template
  get localStorage(): Storage {
    return localStorage;
  }

  get currencyLabel(): string {
    return this.isInternational ? 'USD' : 'BDT';
  }

  get pnplItemsDisplay(): PNPLItem[] {
    return this.isInternational ? this.pnplItemsUsd : this.pnplItems;
  }

  get pnplStartingPrice(): number {
    return this.isInternational ? 18 : 1040;
  }

  formatNumber(num: number): string {
    return num.toLocaleString('en-IN');
  }
}
