import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReadEmailsComponent } from './read-emails.component';

describe('ReadEmailsComponent', () => {
  let component: ReadEmailsComponent;
  let fixture: ComponentFixture<ReadEmailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReadEmailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReadEmailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
