import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-scroll-dots',
  templateUrl: './scroll-dots.component.html',
  styleUrls: ['./scroll-dots.component.scss']
})
export class ScrollDotsComponent implements OnInit {
  backdropSections$: Observable<any> = this.store.select((state) => state.appState.scrollBackdropSections);
  scrollDots: number[] = [];
  
  constructor (private store: Store) {}
  
  ngOnInit(): void {
    this.backdropSections$.subscribe((backdrops: any) => {
    if (backdrops.length > 0) {
      let dots = Math.round(( (backdrops.length) / 2) - 1 );
      this.scrollDots = Array(dots).fill(0);
    }
    })
  }
}
