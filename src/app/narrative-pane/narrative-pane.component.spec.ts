import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NarrativePaneComponent } from './narrative-pane.component';

describe('NarrativePaneComponent', () => {
  let component: NarrativePaneComponent;
  let fixture: ComponentFixture<NarrativePaneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NarrativePaneComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NarrativePaneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
