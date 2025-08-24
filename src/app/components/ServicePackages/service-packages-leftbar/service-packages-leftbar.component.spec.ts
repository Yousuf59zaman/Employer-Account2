import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicePackagesLeftbarComponent } from './service-packages-leftbar.component';

describe('ServicePackagesLeftbarComponent', () => {
  let component: ServicePackagesLeftbarComponent;
  let fixture: ComponentFixture<ServicePackagesLeftbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServicePackagesLeftbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServicePackagesLeftbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
