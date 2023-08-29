import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScrollDotComponent } from './scroll-dot.component';

describe('ScrollDotComponent', () => {
  let component: ScrollDotComponent;
  let fixture: ComponentFixture<ScrollDotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScrollDotComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScrollDotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
