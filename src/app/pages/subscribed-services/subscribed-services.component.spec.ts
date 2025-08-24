import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscribedServicesComponent } from './subscribed-services.component';

describe('SubscribedServicesComponent', () => {
  let component: SubscribedServicesComponent;
  let fixture: ComponentFixture<SubscribedServicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscribedServicesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubscribedServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
