import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HighchartStackedComponent } from './highchart-stacked.component';

describe('HighchartStackedComponent', () => {
  let component: HighchartStackedComponent;
  let fixture: ComponentFixture<HighchartStackedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HighchartStackedComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HighchartStackedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
