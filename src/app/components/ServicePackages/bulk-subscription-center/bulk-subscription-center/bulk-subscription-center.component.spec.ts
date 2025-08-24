import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkSubscriptionCenterComponent } from './bulk-subscription-center.component';

describe('BulkSubscriptionCenterComponent', () => {
  let component: BulkSubscriptionCenterComponent;
  let fixture: ComponentFixture<BulkSubscriptionCenterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BulkSubscriptionCenterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BulkSubscriptionCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
