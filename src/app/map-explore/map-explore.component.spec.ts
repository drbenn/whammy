import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapExploreComponent } from './map-explore.component';

describe('MapExploreComponent', () => {
  let component: MapExploreComponent;
  let fixture: ComponentFixture<MapExploreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MapExploreComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapExploreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
