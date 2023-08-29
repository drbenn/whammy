import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-scroll-dot',
  templateUrl: './scroll-dot.component.html',
  styleUrls: ['./scroll-dot.component.scss']
})
export class ScrollDotComponent implements OnInit {
  observerSection$: Observable<any> = this.store.select((state) => state.appState.observerSection);
  @Input() dotNumber: number = 1;
  activeDot: number = 1;
  
  constructor (private store: Store) {}
  
  ngOnInit(): void {
    this.observerSection$.subscribe((activeSection: number) => {
    // if (backdrops.length > 0) {
    if (activeSection > 0) {
      this.activeDot = Math.floor(activeSection / 2);
    }})
  }
}

