import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkSubscriptionRightbarComponent } from './bulk-subscription-rightbar.component';

describe('BulkSubscriptionRightbarComponent', () => {
  let component: BulkSubscriptionRightbarComponent;
  let fixture: ComponentFixture<BulkSubscriptionRightbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BulkSubscriptionRightbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BulkSubscriptionRightbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show standard listing features by default', () => {
    const features = component.bulkSubscriptionFeatures();
    
    expect(features).toContain('Purchase Bulk Packages and enjoy <b>amazing discounts (up to 55%)</b>.');
    expect(features).toContain('Packages start from <b>5 job posts</b>.');
    expect(features).toContain('Pay upfront and start posting jobs as and when necessary.');
    expect(features).toContain('Get direct Access to the Talent Search.');
    expect(features).toContain('Jobs will be displayed as Standard Listing jobs.');
  });

  it('should update features when selectedBulkItemId changes', () => {
    // Test standard listing features
    component.selectedBulkItemId = 'bulk-standard';
    component.ngOnChanges({
      selectedBulkItemId: {
        currentValue: 'bulk-standard',
        previousValue: undefined,
        firstChange: true,
        isFirstChange: () => true
      }
    });
    
    let features = component.bulkSubscriptionFeatures();
    expect(features).toContain('Jobs will be displayed as Standard Listing jobs.');
    
    // Test premium listing features
    component.selectedBulkItemId = 'bulk-premium';
    component.ngOnChanges({
      selectedBulkItemId: {
        currentValue: 'bulk-premium',
        previousValue: 'bulk-standard',
        firstChange: false,
        isFirstChange: () => false
      }
    });
    
    features = component.bulkSubscriptionFeatures();
    expect(features).toContain('Jobs will be displayed as Premium Listing jobs with enhanced visibility.');
  });

  it('should handle premium plus features', () => {
    component.selectedBulkItemId = 'bulk-premium-plus';
    component.ngOnChanges({
      selectedBulkItemId: {
        currentValue: 'bulk-premium-plus',
        previousValue: 'bulk-standard',
        firstChange: false,
        isFirstChange: () => false
      }
    });
    
    const features = component.bulkSubscriptionFeatures();
    expect(features).toContain('Jobs will be displayed as Premium Plus jobs with top positioning.');
  });

  it('should handle customized features', () => {
    component.selectedBulkItemId = 'bulk-customized';
    component.ngOnChanges({
      selectedBulkItemId: {
        currentValue: 'bulk-customized',
        previousValue: 'bulk-standard',
        firstChange: false,
        isFirstChange: () => false
      }
    });
    
    const features = component.bulkSubscriptionFeatures();
    expect(features).toContain('Customized job display options based on your requirements.');
  });

  it('should return default features for unknown item ID', () => {
    component.selectedBulkItemId = 'unknown-id';
    component.ngOnChanges({
      selectedBulkItemId: {
        currentValue: 'unknown-id',
        previousValue: 'bulk-standard',
        firstChange: false,
        isFirstChange: () => false
      }
    });
    
    const features = component.bulkSubscriptionFeatures();
    expect(features).toContain('Jobs will be displayed as Standard Listing jobs.');
  });
});
