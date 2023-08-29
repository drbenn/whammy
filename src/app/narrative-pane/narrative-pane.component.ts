import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { Dialog } from '../shared/app.models';

@Component({
  selector: 'app-narrative-pane',
  templateUrl: './narrative-pane.component.html',
  styleUrls: ['./narrative-pane.component.scss'],
  animations: [
    trigger(
      'inOutAnimation-storyblock',
      [
        transition(
          ':enter',
          [
            style({ opacity: 0, transform: 'translate(0rem, 20rem)' }),
            animate('800ms ease-out',
            style({ opacity: 1, transform: 'translate(0rem, 0rem)' }))
          ]
        ),
        transition(
          ':leave',
          [
            style({ opacity: 1, transform: 'translate(0rem, 0rem)' }),
            animate('400ms ease-in',
            style({ opacity: 0, transform: 'translate(0rem, -10rem)' }))
          ]
  )])]
})
export class NarrativePaneComponent implements OnInit {
  dialogObject$: Observable<any> = this.store.select((state) => state.appState.activeDialog);
  dialogObject: Dialog | null;
  isOpen: boolean = false;
  
  testData = [
    {
      "event": "A",
      "color": "lorem50"
    },
    {
      "event": "B",
      "color": "lorem50"
    }
  ]
  
  constructor (private store: Store) {}
  
  ngOnInit(): void {
    this.dialogObject$.subscribe((dialog: any) => {
    if (dialog === null) {
      this.dialogObject = null;
      this.isOpen = false;
    }
    if (dialog && dialog.title) {
      this.isOpen = true; // Each dialog to be open and maximized on each new story block
      this.dialogObject = dialog;
    }})
  }

}
