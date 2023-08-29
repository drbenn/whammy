import { Injectable } from '@angular/core';
import { ZoomAlterOptions } from '../app.models';

@Injectable({
  providedIn: 'root'
})
export class MapService {

  constructor() { }

  public zoomLocationSetting(change: string): ZoomAlterOptions {
    console.log('change in service: ', change);
    if (change === "one") {
      return { zoomLevel: 6, latLng: [-5, 5], duration: 500 };
    }
    if (change === "two") {
      return { zoomLevel: 3, latLng: [0, -5], duration: 1000 };
    }
    else {
      return { zoomLevel: 8, latLng: [0, 0], duration: 2000 };
    }
  }
}
