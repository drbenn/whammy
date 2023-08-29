import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { UpdateStoryIntersection } from '../shared/state/appState.actions';

@Component({
  selector: 'app-scroll-backdrop',
  templateUrl: './scroll-backdrop.component.html',
  styleUrls: ['./scroll-backdrop.component.scss']
})
export class ScrollBackdropComponent implements OnInit {
  backdropSections$: Observable<any> = this.store.select((state) => state.appState.scrollBackdropSections);
  intersectionItems: number[] = []; // iterable items to sync intersection observer with content changes
  intersectionObject: any = {};

  constructor (private store: Store) {}

  ngOnInit(): void { 
    this.backdropSections$.subscribe((backdrops: any) => {
      if (backdrops && backdrops.length > 0) {
        this.intersectionItems = backdrops;
        this.intersectionItems.forEach((item: number) => this.intersectionObject[item] = false);
      }
    })
  }

  public storyIsIntersecting(status: boolean, index: number) {
    // console.log('Element #' + index + ' is intersecting ' + status);
    if (status) {
      this.intersectionItems.forEach(item => this.intersectionObject[item] = false);
      this.intersectionObject[index] = true;
      this.store.dispatch(new UpdateStoryIntersection(this.intersectionObject))
    }
  }
}