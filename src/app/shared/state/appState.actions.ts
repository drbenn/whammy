
export class UpdateStuff {
  static readonly type = '[data] update stuff';
  constructor(public stuff: any[]) {}
}

export class SetInitialData {
  static readonly type = '[Init] Set App Data';
  constructor(public appData: any) {}
}
 
export class UpdateStoryIntersection {
  static readonly type = '[Intersection Observer] Update Intersection Trigger of Story Section';
  constructor(public storySection: {}) {}
}

export class UpdateStoryDialog {
  static readonly type = '[Dialog] Update Story Dialog Object';
  constructor(public storySection: number) {}
}

export class UpdateMapScene {
  static readonly type = '[Map] Update Map Scene';
  constructor(public storySection: {}) {}
}

export class UpdateMapFilter {
  static readonly type = '[Map] Update Map Filter';
  constructor(public mapFilters:string[]) {}
}

export class UpdateIntroChart {
  static readonly type = '[Intro] Update Intro Chart Selected';
  constructor(public activeChart: string) {}
}

export class UpdateDateRange {
  static readonly type = '[DateRange] Update Date Range for Map Filter';
  constructor(public dateRange: string[]) {}
}