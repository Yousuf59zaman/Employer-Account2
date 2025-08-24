import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicePackagesCenterComponent } from './service-packages-center.component';

describe('ServicePackagesCenterComponent', () => {
  let component: ServicePackagesCenterComponent;
  let fixture: ComponentFixture<ServicePackagesCenterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServicePackagesCenterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServicePackagesCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
