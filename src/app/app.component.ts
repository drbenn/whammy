import { Component, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { AppState } from './shared/state/appState.state';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'ngxs-fifteen-test';
  data: any;

  @Select(AppState.listStuff) stuff$:Observable<any>;

  constructor(private store: Store) {}


  ngOnInit(): void {
      this.stuff$.subscribe((stuff: any) => {
        console.log('stuff subscribe oninit');
        console.log(stuff);
        this.data = stuff;
      })
  }
}
