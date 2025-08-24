import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicePackagesRightbarComponent } from './service-packages-rightbar.component';

describe('ServicePackagesRightbarComponent', () => {
  let component: ServicePackagesRightbarComponent;
  let fixture: ComponentFixture<ServicePackagesRightbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServicePackagesRightbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServicePackagesRightbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
