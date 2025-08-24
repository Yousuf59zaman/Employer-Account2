import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { SmeVisibilityService } from '../../../Services/sme-visibility.service';

interface Package {
  id: string;
  name: string;
  price: number;
  type: 'prepaid' | 'pay-as-you-go' | 'free';
  recommended?: boolean;
}

@Component({
  selector: 'app-service-packages-leftbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './service-packages-leftbar.component.html',
  styleUrl: './service-packages-leftbar.component.scss',
  animations: [
    trigger('expandCollapse', [
      transition(':enter', [
        style({ height: 0, opacity: 0, transform: 'translateY(-16px)' }),
        animate('200ms cubic-bezier(0.4,0,0.2,1)', style({ height: '*', opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms cubic-bezier(0.4,0,0.2,1)', style({ height: 0, opacity: 0, transform: 'translateY(16px)' }))
      ])
    ])
  ]
})
export class ServicePackagesLeftbarComponent implements OnInit {
  @Output() packageSelected = new EventEmitter<Package>();

  selectedPackage: string = 'standard-listing';
  showSmePackage: boolean = false;

  packages: Package[] = [
    { id: 'sme-listing', name: 'SME Listing', price: 500, type: 'prepaid' },
    { id: 'standard-listing', name: 'Standard Listing', price: 2850, type: 'prepaid' },
    { id: 'premium-listing', name: 'Premium Listing', price: 3900, type: 'prepaid', recommended: true },
    { id: 'premium-plus', name: 'Premium Plus', price: 5900, type: 'prepaid' },
    { id: 'hot-job', name: 'Hot Job', price: 13500, type: 'prepaid' },
    { id: 'pnpl', name: 'PNPL', price: 1040, type: 'pay-as-you-go' },
    { id: 'internship-announcement', name: 'Internship Announcement', price: 0, type: 'free' },
    { id: 'blue-collar', name: 'Blue Collar', price: 0, type: 'free' }
  ];

  expandedSections = {
    prepaid: true,
    payAsYouGo: false,
    free: false
  };

  constructor(private smeVisibilityService: SmeVisibilityService) {}

  ngOnInit() {
    this.showSmePackage = this.smeVisibilityService.getFinalSmeVisibility();
    
    if (!this.showSmePackage && this.selectedPackage === 'sme-listing') {
      this.selectPackage('standard-listing');
    }
  }

  get isInternational(): boolean {
    const country = (localStorage.getItem('CompanyCountry') || '').trim().toLowerCase();
    return country !== '' && country !== 'bangladesh';
  }

  isRecommended(packageId: string): boolean {
    const packageData = this.packages.find(p => p.id === packageId);
    return packageData?.recommended || false;
  }

  selectPackage(packageId: string) {
    this.selectedPackage = packageId;
    const packageData = this.packages.find(p => p.id === packageId);
    if (packageData) {
      this.packageSelected.emit(packageData);
    }
  }

  toggleSection(section: 'prepaid' | 'payAsYouGo' | 'free') {
    const wasOpen = this.expandedSections[section];
    this.expandedSections = { prepaid: false, payAsYouGo: false, free: false };
    if (!wasOpen) {
      this.expandedSections[section] = true;
    }
  }
}
