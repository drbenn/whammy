import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScrollBackdropComponent } from './scroll-backdrop.component';

describe('ScrollBackdropComponent', () => {
  let component: ScrollBackdropComponent;
  let fixture: ComponentFixture<ScrollBackdropComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScrollBackdropComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScrollBackdropComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
