import { Injectable } from '@angular/core';

export interface CompanyInfo {
  companyId: string;
  employeeMaxSize: number;
  isEntrepreneurCompany: boolean;
  companyCountry: string;
  companyIndustryTypes: number[];
}

@Injectable({
  providedIn: 'root'
})
export class SmeVisibilityService {

  // SME-related industry type IDs from the ASP logic
  private readonly SME_INDUSTRY_TYPES = [16, 17, 18, 19, 1119, 1120, 2136, 2137, 41, 42, 92, 93, 94, 95, 96, 97, 2127];

  constructor() { }

  /**
   * Determines if the SME package should be shown based on company criteria
   * This replicates the logic from services.asp
   */
  shouldShowSmePackage(): boolean {
    const companyInfo = this.getCompanyInfo();
    
    console.log('SME Visibility Check - Company Info:', companyInfo);
    
    // If no company session, show SME package
    if (!companyInfo.companyId) {
      console.log('SME Package: SHOWN (No company session)');
      return true;
    }

    // Check if company is from Bangladesh
    if (companyInfo.companyCountry.toLowerCase() !== 'bangladesh') {
      console.log('SME Package: HIDDEN (Company not from Bangladesh)');
      return false;
    }

    // Check company size condition
    if (companyInfo.isEntrepreneurCompany || companyInfo.employeeMaxSize <= 50) {
      console.log('SME Package: SHOWN (Entrepreneur company or ≤50 employees)');
      return true;
    }

    // Check industry type condition
    if (this.hasSmeIndustryType(companyInfo.companyIndustryTypes)) {
      console.log('SME Package: SHOWN (Has SME industry type)');
      return true;
    }

    console.log('SME Package: HIDDEN (Does not meet criteria)');
    return false;
  }

  /**
   * Get company information from localStorage
   */
  private getCompanyInfo(): CompanyInfo {
    const companyId = localStorage.getItem('CompanyId') || '';
    const employeeMaxSize = parseInt(localStorage.getItem('EmployeeMaxSize') || '0') || 0;
    const isEntrepreneurCompany = localStorage.getItem('IsEntrepreneurCompany') === 'true';
    const companyCountry = localStorage.getItem('CompanyCountry') || '';
    
    // For now, we'll use a default set of industry types
    // In a real implementation, this would come from an API call
    const companyIndustryTypes: number[] = [];
    
    return {
      companyId,
      employeeMaxSize,
      isEntrepreneurCompany,
      companyCountry,
      companyIndustryTypes
    };
  }

  /**
   * Check if company has any of the SME industry types
   */
  private hasSmeIndustryType(companyIndustryTypes: number[]): boolean {
    if (!companyIndustryTypes || companyIndustryTypes.length === 0) {
      return false;
    }
    
    return companyIndustryTypes.some(type => this.SME_INDUSTRY_TYPES.includes(type));
  }

  /**
   * Force show SME package (for promotional purposes like "uddokta-scheme")
   * This can be used when a specific URL parameter is present
   */
  forceShowSmePackage(): boolean {
    // Check for promotional URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const hasPromoParam = urlParams.get('frm') === 'uddokta-scheme';
    
    if (hasPromoParam) {
      console.log('SME Package: FORCE SHOWN (Promotional URL parameter)');
    }
    
    return hasPromoParam;
  }

  /**
   * Get the final decision on whether to show SME package
   */
  getFinalSmeVisibility(): boolean {
    // Check promotional override first
    if (this.forceShowSmePackage()) {
      return true;
    }
    
    // Then check business logic
    return this.shouldShowSmePackage();
  }

  /**
   * Debug method to show current localStorage values
   */
  debugCompanyInfo(): void {
    console.log('=== SME Visibility Debug Info ===');
    console.log('CompanyId:', localStorage.getItem('CompanyId'));
    console.log('EmployeeMaxSize:', localStorage.getItem('EmployeeMaxSize'));
    console.log('IsEntrepreneurCompany:', localStorage.getItem('IsEntrepreneurCompany'));
    console.log('CompanyCountry:', localStorage.getItem('CompanyCountry'));
    console.log('URL Parameters:', window.location.search);
    console.log('Final SME Visibility:', this.getFinalSmeVisibility());
    console.log('================================');
  }
}
