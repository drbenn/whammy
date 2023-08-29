import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { NgxsModule } from '@ngxs/store';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { AppState } from './shared/state/appState.state';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ScrollBackdropComponent } from './scroll-backdrop/scroll-backdrop.component';
import { NarrativeComponent } from './narrative/narrative.component';
import { MapNarrativeComponent } from './map-narrative/map-narrative.component';
import { MapExploreComponent } from './map-explore/map-explore.component';
import { HighchartsChartModule } from 'highcharts-angular';
import { MatFormFieldModule } from '@angular/material/form-field'; 
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ObserveElementDirective } from './shared/directives/observe-element.directive';
import { HighchartStackedComponent } from './highchart-stacked/highchart-stacked.component';
import { NarrativePaneComponent } from './narrative-pane/narrative-pane.component';
import { ScrollDotsComponent } from './scroll-dots/scroll-dots.component';
import { ScrollDotComponent } from './scroll-dot/scroll-dot.component'; 
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NavbarComponent } from './navbar/navbar.component';
import { MapExploreFilterComponent } from './map-explore-filter/map-explore-filter.component';
import { MapTooltipComponent } from './map-tooltip/map-tooltip.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';

@NgModule({
  declarations: [
    AppComponent,
    ScrollBackdropComponent,
    NarrativeComponent,
    MapNarrativeComponent,
    MapExploreComponent,
    ObserveElementDirective,
    HighchartStackedComponent,
    NarrativePaneComponent,
    ScrollDotsComponent,
    ScrollDotComponent,
    NavbarComponent,
    MapExploreFilterComponent,
    MapTooltipComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    HighchartsChartModule,
    NgxsModule.forRoot([AppState]),
    NgxsReduxDevtoolsPluginModule.forRoot(),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
