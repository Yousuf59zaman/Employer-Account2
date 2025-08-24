import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicePackagesComponent } from './service-packages.component';

describe('ServicePackagesComponent', () => {
  let component: ServicePackagesComponent;
  let fixture: ComponentFixture<ServicePackagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServicePackagesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServicePackagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
