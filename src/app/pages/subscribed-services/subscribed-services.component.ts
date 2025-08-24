import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { DateRangePickerModalComponent } from '../../components/date-range-picker-modal/date-range-picker-modal.component';
import { SubscribedServiceService } from '../../Services/SubscribedServices/subscribed-service.service';
import { ServiceHistoryData, ServiceHistoryItem } from '../../Models/SubscribedService/subscribed';
import { ServiceDetailsModalComponent } from '../../components/service-details-modal/service-details-modal.component';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-subscribed-services',
  imports: [
    CommonModule,
    HttpClientModule,
    DateRangePickerModalComponent,
    ServiceDetailsModalComponent
  ],
  standalone: true,
  templateUrl: './subscribed-services.component.html',
  styleUrl: './subscribed-services.component.scss'
})
export class SubscribedServicesComponent implements OnInit {
  showDatePicker = false;
  startDate: Date | null = null;
  endDate: Date | null = null;
  
  showDetailsModal = false;
  selectedService: any = null;

  serviceData: ServiceHistoryData | null = null;
  loading = true;
  error: string | null = null;
  activeTab: 'all' | 'cm' | 'job' | 'sms' | 'cv' = 'all';
  currentPage = 1;
  itemsPerPage = 10;
  datePipe = new DatePipe('en-US');

  constructor(private subscribedService: SubscribedServiceService) {}

  ngOnInit() {
    this.loadServiceHistory();
  }

  loadServiceHistory() {
    this.loading = true;
    this.error = null;
    
    this.subscribedService.getServiceHistory().subscribe({
      next: (response) => {
        if (response && response.data) {
          this.serviceData = response.data;
        } else {
          this.error = 'Invalid response format from server';
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = error.message || 'Failed to load service history';
        this.loading = false;
        console.error('Error loading service history:', error);
      }
    });
  }

  // Tab methods
  setActiveTab(tab: 'all' | 'cm' | 'job' | 'sms' | 'cv') {
    this.activeTab = tab;
    this.currentPage = 1; 
    
    let v_type: number | undefined;
    switch (tab) {
      case 'job':
        v_type = 3; 
        break;
      case 'cm':
        v_type = 1; 
        break;
      case 'cv':
        v_type = 2; 
        break;
      case 'sms':
        v_type = 4;
        break;
      case 'all':
      default:
        v_type = undefined;
        break;
    }
    
    
    this.loadServiceHistoryWithVType(v_type);
  }

  getTabData(): ServiceHistoryItem[] {
    if (!this.serviceData || !this.serviceData.serviceHistoryLists) return [];
    
    return this.serviceData.serviceHistoryLists;
  }

  getTabCount(tab: 'all' | 'cm' | 'job' | 'sms' | 'cv'): number {
    if (!this.serviceData) return 0;
    
    switch (tab) {
      case 'all':
        return this.serviceData.allPurchase || 0;
      case 'cm':
        return this.serviceData.fullAccess || 0;
      case 'job':
        return this.serviceData.jobAccess || 0;
      case 'sms':
        return this.serviceData.smsAccess || 0;
      case 'cv':
        return this.serviceData.cvAccess || 0;
      default:
        return 0;
    }
  }

  getPaginatedData(): ServiceHistoryItem[] {
    const data = this.getTabData();
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return data.slice(startIndex, endIndex);
  }

  getTotalPages(): number {
    const data = this.getTabData();
    return Math.ceil(data.length / this.itemsPerPage);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
    }
  }

  getPageNumbers(): (number | string)[] {
    const totalPages = this.getTotalPages();
    const currentPage = this.currentPage;
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
    
      pages.push(1);

      if (currentPage > 4) {
        pages.push('...');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 3) {
        pages.push('...');
      }

      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  }

  navigateToPage(page: number | string) {
    if (typeof page === 'number') {
      this.goToPage(page);
    }
  }

  getUsageDisplay(item: ServiceHistoryItem): string {
    if (item.totalJob > 0) {
      return `${item.totalJob - item.restJob}/${item.totalJob} Jobs`;
    } else if (item.totalCV > 0) {
      return `${item.totalCV - item.restCV}/${item.totalCV} CVs`;
    } else if (item.totalPurchased > 0) {
      return `${item.totalPurchased - item.restSMS}/${item.totalPurchased} SMS`;
    }
    return 'N/A';
  }

  getStatus(item: ServiceHistoryItem): 'Active' | 'Expired' {
    return item.isActive ? 'Active' : 'Expired';
  }

  getSubscriptionDuration(item: ServiceHistoryItem): string {
    return item.duration > 0 ? `${item.duration} days` : 'N/A';
  }

  getExpireDate(item: ServiceHistoryItem): string {
    if (this.isSmsPackage(item)) {
      return 'N/A';
    }
    
    if (item.expireDate) {
      const formatted = this.datePipe.transform(item.expireDate, 'd MMMM yyyy');
      return formatted ? formatted : 'N/A';
    }
    return 'N/A';
  }

  loadServiceHistoryWithVType(v_type?: number) {
    this.loading = true;
    this.error = null;
    
    const startDateStr = this.startDate ? this.startDate.toISOString().split('T')[0] : '';
    const endDateStr = this.endDate ? this.endDate.toISOString().split('T')[0] : '';
    
    this.subscribedService.getServiceHistory(startDateStr, endDateStr, v_type).subscribe({
      next: (response) => {
        if (response && response.data) {
          this.serviceData = response.data;
        } else {
          this.error = 'Invalid response format from server';
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = error.message || 'Failed to load service history';
        this.loading = false;
        console.error('Error loading service history:', error);
      }
    });
  }

  openDatePicker() {
    this.showDatePicker = true;
  }

  closeDatePicker() {
    this.showDatePicker = false;
  }

  onDateRangeApply(event: { start: Date | null, end: Date | null }) {
    this.startDate = event.start;
    this.endDate = event.end;
    this.showDatePicker = false;
    
    let v_type: number | undefined;
    switch (this.activeTab) {
      case 'job':
        v_type = 3;
        break;
      case 'cm':
        v_type = 1;
        break;
      case 'cv':
        v_type = 2;
        break;
      case 'sms':
        v_type = 4;
        break;
      default:
        v_type = undefined;
        break;
    }
    
    this.loadServiceHistoryWithVType(v_type);
  }

  loadServiceHistoryWithFilters(startDate?: string, endDate?: string) {
    this.loading = true;
    this.error = null;
    
    let v_type: number | undefined;
    switch (this.activeTab) {
      case 'job':
        v_type = 3;
        break;
      case 'cm':
        v_type = 1;
        break;
      case 'cv':
        v_type = 2;
        break;
      case 'sms':
        v_type = 4;
        break;
      default:
        v_type = undefined;
        break;
    }
    
    this.subscribedService.getServiceHistory(startDate, endDate, v_type).subscribe({
      next: (response) => {
        if (response && response.data) {
          this.serviceData = response.data;
        } else {
          this.error = 'Invalid response format from server';
        }
        this.loading = false;
        this.currentPage = 1;
      },
      error: (error) => {
        this.error = error.message || 'Failed to load service history';
        this.loading = false;
        console.error('Error loading service history:', error);
      }
    });
  }

  clearDateFilters() {
    this.startDate = null;
    this.endDate = null;
    
    let v_type: number | undefined;
    switch (this.activeTab) {
      case 'job':
        v_type = 3;
        break;
      case 'cm':
        v_type = 1;
        break;
      case 'cv':
        v_type = 2;
        break;
      case 'sms':
        v_type = 4;
        break;
      default:
        v_type = undefined;
        break;
    }
    
    this.loadServiceHistoryWithVType(v_type);
  }

  printTable() {
    window.print();
  }


  isSmsPackage(item: ServiceHistoryItem): boolean {
    return (
      item.totalPurchased > 0 &&
      typeof item.restSMS === 'number' &&
      item.totalJob === 0 &&
      item.totalCV === 0
    );
  }

  openDetailsModal(item: ServiceHistoryItem) {
    if (this.isSmsPackage(item)) {
      return;
    }
    this.subscribedService.getServiceDetails(item.id).subscribe({
      next: (response) => {
        this.selectedService = response.data;
        this.showDetailsModal = true;
      },
      error: (error) => {
        this.error = error.message || 'Failed to load service details';
        console.error('Error loading service details:', error);
      }
    });
  }
}
