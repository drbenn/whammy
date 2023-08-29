import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NarrativeComponent } from './narrative/narrative.component';
import { MapExploreComponent } from './map-explore/map-explore.component';

const routes: Routes = [
  {path: "", component: NarrativeComponent},
  {path: "map", component: MapExploreComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
