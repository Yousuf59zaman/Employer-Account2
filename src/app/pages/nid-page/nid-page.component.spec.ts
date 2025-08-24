import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NidPageComponent } from './nid-page.component';

describe('NidPageComponent', () => {
  let component: NidPageComponent;
  let fixture: ComponentFixture<NidPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NidPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NidPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
