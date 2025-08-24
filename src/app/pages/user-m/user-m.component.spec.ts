import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserMComponent } from './user-m.component';

describe('UserMComponent', () => {
  let component: UserMComponent;
  let fixture: ComponentFixture<UserMComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserMComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserMComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
