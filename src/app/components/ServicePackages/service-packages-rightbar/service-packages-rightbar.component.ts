
import { Component, Input } from '@angular/core';
import { SampleViewModalComponent } from '../../sample-view-modal/sample-view-modal.component';
import { TalentSearchRightbarComponent } from '../talent-search-rightbar/talent-search-rightbar.component';

@Component({
  selector: 'app-service-packages-rightbar',
  standalone: true,
  imports: [SampleViewModalComponent, TalentSearchRightbarComponent],
  templateUrl: './service-packages-rightbar.component.html',
  styleUrl: './service-packages-rightbar.component.scss'
})
export class ServicePackagesRightbarComponent {
  @Input() selectedPackageId: string | null = null;
  @Input() selectedTalentSearchOption: any = null;
  @Input() activeTab: string = 'jobs';
  
  isSampleModalOpen: boolean = false;

  get isInternational(): boolean {
    const country = (localStorage.getItem('CompanyCountry') || '').trim().toLowerCase();
    return country !== '' && country !== 'bangladesh';
  }

  get shouldShowViewSample(): boolean {
    if (this.isInternational) {
      return false;
    }
    
    // Hide View Sample for pay-as-you-go, free, and hot job packages
    const hiddenPackages = ['pnpl', 'internship-announcement', 'blue-collar', 'hot-job'];
    return !hiddenPackages.includes(this.selectedPackageId || '');
  }

  openSampleModal() {
    this.isSampleModalOpen = true;
  }

  closeSampleModal() {
    this.isSampleModalOpen = false;
  }

  get features(): string[] {
    if (this.selectedPackageId === 'sme-listing') {
      return [
        'Jobs displayed in the <b>Category/Classified</b> section.',
        'Job will be live for <b>10 days</b> with maximum <b>100 applicants</b>',
        '<b>60 times</b> cheaper than a newspaper advertisement.',
        "<b>Sort matching CVs, short-list, interview scheduling</b> through convenient employer's panel.",
        'Search candidate by <b>category, skill, experience, keywords,</b> etc.'
      ];
    }
    if (this.selectedPackageId === 'standard-listing') {
      return [
        'Jobs displayed in the <b>Category/Classified</b> section.',
        'Job will be live for <b>30 days (max)</b>',
        "Sort matching CVs, short-list, interview scheduling through convenient employer's panel.",
        '<b>10 times</b> cheaper than a newspaper advertisement.'
      ];
    }
    if (this.selectedPackageId === 'premium-listing') {
      return [
        'Make your job circular <b>Stand-out</b> among thousands of job circular.',
        'Jobs displayed in the Category/Classified section with <b>Logo</b> and different <b>background-color</b>.',
        'Jobs will be displayed for <b>30 days</b> (max).',
        '<b>20%</b> more view than Standard Listing jobs.'
      ];
    }
    if (this.selectedPackageId === 'premium-plus') {
      return [
        'Your job circular will be displayed on the top of the <b>1st page</b> of its particular category for 3 days and the next <b>3 days</b> on the 2nd page.',
        'All the other features will be as Premium listing.'
      ];
    }
    if (this.selectedPackageId === 'hot-job') {
      return [
        'Display your company <b>logo</b> and <b>position name</b> on the <b>homepage</b> of bdjobs.com.',
        'Customized web page for your job circular.',
        '<b>15 days display</b> in the Hot Jobs section, then in the classified section up to 30 days as <b>Premium Listing jobs</b>.'
      ];
    }
     if (this.selectedPackageId === 'pnpl') {
      return [
        'Pay only for the candidates that you want to contact with',
        'Job will be live for <b>15 days (max)</b>.',
        'Sort matching CVs, short-list, interview scheduling through convenient employer\'s panel.',
        'Choose your desired candidates in a budget friendly way.'
      ];
    }
     if (this.selectedPackageId === 'internship-announcement') {
      return [
        'Post jobs to find Intern with totally free of cost.',
        'Job will be live for <b>15 days (max)</b>.',
        'Sort matching CVs, short-listing, interview scheduling through convenient employer\'s panel.',
        'Hire future leaders without affecting your revenue.'
      ];
    }
    if (this.selectedPackageId === 'blue-collar') {
      return [
        'Post jobs to find selected blue collar persons with totally free of cost.',
        'Job will be live for <b>30 days (max)</b>.',
        'Sort matching CVs, short-listing, interview scheduling through convenient employer\'s panel.',
        'Get your helping hand without spending any money.'
      ];
    }
    return [
      'Jobs displayed in the <b>Category/Classified</b> section.',
        'Job will be live for <b>30 days (max)</b>',
        "Sort matching CVs, short-list, interview scheduling through convenient employer's panel.",
        '<b>10 times</b> cheaper than a newspaper advertisement.'
    ];
  }
}
