import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NarrativeComponent } from './narrative.component';

describe('NarrativeComponent', () => {
  let component: NarrativeComponent;
  let fixture: ComponentFixture<NarrativeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NarrativeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NarrativeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
