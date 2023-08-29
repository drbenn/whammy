import { Component, Input, OnInit } from '@angular/core';
import { TTData } from '../shared/app.models';

@Component({
  selector: 'app-map-tooltip',
  templateUrl: './map-tooltip.component.html',
  styleUrls: ['./map-tooltip.component.scss']
})
export class MapTooltipComponent implements OnInit {
  @Input() ttData: TTData

  ngOnInit(): void { 

  }
}
