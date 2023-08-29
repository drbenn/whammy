import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapExploreFilterComponent } from './map-explore-filter.component';

describe('MapExploreFilterComponent', () => {
  let component: MapExploreFilterComponent;
  let fixture: ComponentFixture<MapExploreFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MapExploreFilterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapExploreFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
