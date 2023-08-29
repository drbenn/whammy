import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapNarrativeComponent } from './map-narrative.component';

describe('MapNarrativeComponent', () => {
  let component: MapNarrativeComponent;
  let fixture: ComponentFixture<MapNarrativeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MapNarrativeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapNarrativeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
