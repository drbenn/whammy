import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Action, NgxsOnInit, Selector, State, StateContext, Store } from '@ngxs/store';
import { SetInitialData, UpdateDateRange, UpdateIntroChart, UpdateMapFilter, UpdateMapScene, UpdateStoryDialog, UpdateStoryIntersection, UpdateStuff } from './appState.actions';
import { forkJoin } from 'rxjs';


export interface AppStateModel {
  stuff: any,
  //storytelling
  observerSection: number;
  storyStructure: any;
  scrollBackdropSections: any[];
  mapScene: any;
  activeDialog: any | null;

  // full map
  fullMapDataPoints: any[];
  filteredFullMapDataPoints: any[];
  activeMapFilters: string[];
  mapDateRange: string[];

  // Story Chart
  activeIntroChart: string;
  deliveredGraphDataPoints: any[];
}

@State<AppStateModel>({
  name: 'appState',
  defaults: {
    stuff: 'jabroni',
    //storytelling
    observerSection: 0,
    storyStructure: [],
    scrollBackdropSections: [],
    mapScene: '',
    activeDialog: '',

    // full map
    fullMapDataPoints: [],
    filteredFullMapDataPoints: [],
    activeMapFilters: ["pointType1", "pointType2"],
    mapDateRange: ['10/10/10', new Date().toLocaleDateString("en-US")],

    // Story Chart
    activeIntroChart: '',
    deliveredGraphDataPoints: []
  },
})
@Injectable()
export class AppState implements NgxsOnInit {

  constructor(
    private http: HttpClient,
    private store: Store
  ) {}

  ngxsOnInit(ctx: StateContext<AppStateModel>) {
    forkJoin([this.http.get("../../assets/data/story-structure.json"), this.http.get("../../assets/data/dataBuild_data.json")]).subscribe(res => {
    this.store.dispatch(new SetInitialData(res))
    })
  }

  @Selector()
  static listStuff(state:AppStateModel) {
      return 'selector junk';
  }

  @Action(UpdateStuff)
  updateStuff(
    ctx: StateContext<AppStateModel>,
    payload: { stuff: any }
  ) {
    ctx.patchState({ stuff: payload.stuff });
  }

  
  @Action(SetInitialData)
  setInitialData(
  ctx: StateContext<AppStateModel>,
  payload: { appData: any }
  ) {
    console.log(payload.appData[1]);
    
    const dataBuildJsonData: any[] = payload.appData[1][0];
    const dataBuildWithDateTypes: any[] = this.mapDatesAsDateTypes(dataBuildJsonData["fullMapDataPoints"]);
    const storyStructure: any[] = payload.appData[0];
    const numberedStoryStructure = storyStructure.map((obj, index) => {
      return {
        ...obj,
        storyIntersection: Number(index) + 1
      }
    })
    console.log(numberedStoryStructure);
    
  const storySections: number[] = this.getBackDropSections(numberedStoryStructure);

  ctx.patchState({
    storyStructure: numberedStoryStructure,
    scrollBackdropSections: storySections,
    fullMapDataPoints: dataBuildWithDateTypes,
    filteredFullMapDataPoints: dataBuildWithDateTypes,
    deliveredGraphDataPoints: dataBuildJsonData["deliveredGraphDataPoints"]
  });
  }

  @Selector()
    static filteredMapData(state: AppStateModel) {
    const activeFilters: string[] = state.activeMapFilters;
    const dateRange: string[] = state.mapDateRange;
    const data: any[] = state.fullMapDataPoints;
    const filteredMapDataPoints = this.filteredMapDataPoints(dateRange,activeFilters, data)
    return filteredMapDataPoints;
  }

  static filteredMapDataPoints(dates: string[], filters: string[], allMapData: any[]) {
  const filterStart: Date = new Date(dates[0]);
  const filterEnd: Date = new Date(dates[1]);

  const filteredData: any[] = allMapData.filter((item) => {
    if (item["dataPoint"] === "pointType1" && filters.includes("pointType1") && filterStart <= item["date"] && filterEnd >= item["date"]) {
      return true;
    }
    if (item["dataPoint"] === "pointType2" && filters.includes("pointType2") && filterStart <= item["date"] && filterEnd >= item["date"]) {
      return true;
    }
    else {
      return false;
    }
  })
    return filteredData;
  }

  private mapDatesAsDateTypes(data: any): any[] {
    console.log(data);
    
    const dataWithDateTypes = data.map((item: any) => {
      if (item["dataPoint"] === "pointType1") {
        return {
        ...item,
        date: new Date(item.date),
      }}
      if (item["dataPoint"] === "pointType2") {
        return {
        ...item,
        date: new Date(item.date),
      }}
      else {
        return item
      }})
    return dataWithDateTypes
  }

  private getBackDropSections(storyStructure: any[]) {
    let backDropSections: number[] = [];
    storyStructure.forEach(obj => backDropSections.push(obj.storyIntersection));
    return backDropSections;
  }


  @Action(UpdateStoryIntersection)
  updateStoryIntersection(
    ctx: StateContext<AppStateModel>,
    payload: { storySection: any }
  ) {
    const obj = payload.storySection;
    const activeSection = Number(Object.keys(obj).find((key: any) => obj[key] === true));
    this.store.dispatch(new UpdateStoryDialog(activeSection));
    this.store.dispatch(new UpdateMapScene(activeSection));
    ctx.patchState({ observerSection: activeSection});
  }

  @Action(UpdateMapScene)
  updateMapScene(
  ctx: StateContext<AppStateModel>,
  payload: { storySection: {} }
  ) {
    const storyStructure: any = ctx.getState().storyStructure;
    const sceneObject = storyStructure.find((obj:any) => obj.storyIntersection === payload.storySection);
    ctx.patchState({ mapScene: sceneObject.mapChange });
  }

  @Action(UpdateStoryDialog)
  updateStoryDialog(
  ctx: StateContext<AppStateModel>,
  payload: { storySection: {} }
  ) {
    const storyStructure: any = ctx.getState().storyStructure;
    const newDialog = storyStructure.find((obj: any) => obj.storyIntersection === payload.storySection);
    ctx.patchState({ activeDialog: newDialog.dialogInput });
  }

  @Action(UpdateMapFilter)
  updateMapFilter(
  ctx: StateContext<AppStateModel>,
  payload: { mapFilters: string[] }
  ) {
    const activeMapFilters: string[] = payload.mapFilters;
    const allMapData = ctx.getState().fullMapDataPoints;
    const filteredMapDataPoints: any[] = this.filterMapDataPoints(allMapData, activeMapFilters)
    ctx.patchState({ 
      activeMapFilters: activeMapFilters,
      filteredFullMapDataPoints: filteredMapDataPoints
    });
  }

  private filterMapDataPoints(data: any, filters: string[]) {
    const filteredData: any[] = data.filter((item: any) => {
      return filters.includes(item.dataPoint)
  })
    return filteredData
  }

  @Action(UpdateIntroChart)
  updateIntroChart(
  ctx: StateContext<AppStateModel>,
  payload: { activeChart: string }
  ) {
    ctx.patchState({ activeIntroChart: payload.activeChart });
  }

  @Action(UpdateDateRange)
  updateDateRange(
  ctx: StateContext<AppStateModel>,
  payload: { dateRange: string[] }
  ) {
    ctx.patchState({ mapDateRange: payload.dateRange });
  }
}