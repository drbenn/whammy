import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TopographyService {

  constructor(private http: HttpClient) {}
  
  getTopographyData(): Observable<any> {
    const topoDataURL = 'assets/data/countries-50m.json';
    return this.http.get(topoDataURL);
  }
}
