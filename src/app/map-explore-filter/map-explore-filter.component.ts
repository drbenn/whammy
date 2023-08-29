import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngxs/store';
import { UpdateDateRange, UpdateMapFilter } from '../shared/state/appState.actions';
import { MatDatepicker } from '@angular/material/datepicker';

@Component({
  selector: 'app-map-explore-filter',
  templateUrl: './map-explore-filter.component.html',
  styleUrls: ['./map-explore-filter.component.scss']
})
export class MapExploreFilterComponent implements OnInit {
  activeFilters: string[] = [ "pointType1", "pointType2" ];

  // k:v = databuild assigned dataPoint: display name for filter
  dataPoints = {
    "pointType1": "Point Type 1",
    "pointType": "Point Type 2"
  };
  
  defaultStartDate: Date = new Date(Date.parse("2010-10-10"));
  defaultEndDate: Date = new Date();
  
  range = new FormGroup({
    start: new FormControl<Date | null>(this.defaultStartDate),
    end: new FormControl<Date | null>(this.defaultEndDate)
  });


  constructor(private store: Store) {}

  ngOnInit(): void {}

  dispatchToState() {
    this.store.dispatch(new UpdateMapFilter(this.activeFilters))
  }
    
  removeFromFilter(filterName: string) {
    const index = this.activeFilters.indexOf(filterName);
    this.activeFilters.splice(index, 1);
    this.dispatchToState();
  }
    
  updateActiveFilters(filterName: string) {
    const filter = filterName;
    const index = this.activeFilters.includes(filter) ? this.removeFromFilter(filter) : this.activeFilters.push(filter);
    this.dispatchToState();
  }
    
  onDateChange(dateRangeStart: HTMLInputElement, dateRangeEnd: HTMLInputElement) {
    const startDate: string = dateRangeStart.value;
    const endDate: string = dateRangeEnd.value;
    if (startDate.length > 0 && endDate.length > 0 ) {
      const dateRange: string[] = [startDate, endDate ];
      this.store.dispatch(new UpdateDateRange(dateRange))
    }
  }
}

