import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { Observable } from 'rxjs';
import { TopographyService } from '../shared/services/topography.service';
import { AppState } from '../shared/state/appState.state';

@Component({
  selector: 'app-map-explore',
  templateUrl: './map-explore.component.html',
  styleUrls: ['./map-explore.component.scss']
})
export class MapExploreComponent implements OnInit {
  @Select(AppState.filteredMapData) filteredMapData$: Observable<any[]>;
  allMapData: any;
  dateFilteredMapData: any;
  mapDataPoints: any;
  isInitialRender: boolean = true;

  // D3js svg to map properties
  @ViewChild('svgMap', {static: true}) svgRef: ElementRef;
  svg: any;
  projection: any;
  pathGenerator: any;
  center: [number, number] = [0,0];
  mapContainerRatio: number;
  topoFeatureCountries: any;

  // Zoom/Fade Properties
  zoom: any;
  zoomBehavior: any;
  isZoomControlAttached: boolean = false;
  zoomGroup: any; // d3 elements to be included in zoom
  minZoom: number = 1;
  maxZoom: number = 50;
  zoomScale: number = 6.0; // required as global for resize at will
  currentZoomLatLng: [number, number]; // required as global for resize at will
  fadeInTime: number = 1000;
  fadeoutTime: number = 2000;

  // Static story asset properties
  countriesGroup: any;
  markerGroup: any;
  iconGroup: any;
  polygonGroup: any;
  markerNameGroup: any;
  polygonTextBgGroup: any;
  polygonNameGroup: any;
  lineGroup: any;
  lineArrowGroup: any;
  curveGroup: any;
  curveArrowGroup: any;
  highlightedCountries: string[] = [];

  // Tooltip properties
  viewTooltip: boolean = false;
  ttData: any;
  ttPos = {
    'position': 'absolute',
    'z-index' : '0',
    'left': '0',
    'top': '0'
  }

  // Colors
  // C_DEFAULT_COUNTRY: string = '#263238';
  // C_HIGHLIGHT_COUNTRY: string = '#455a64';
  // C_OCEAN: string = '#212121';
  // C_COUNTRY_BORDER: string = '#708792';
  // C_GRATICULE: string = '#e6e6e612';
  // C_LABEL_TEXT: string = '#eee';
  C_DEFAULT_COUNTRY: string = 'purple';
  C_HIGHLIGHT_COUNTRY: string = 'violet';
  C_OCEAN: string = 'crimson';
  C_COUNTRY_BORDER: string = '#708792';
  C_GRATICULE: string = '#e6e6e612';
  C_LABEL_TEXT: string = '#eee';



  constructor(
    private topographyService: TopographyService,
    // private d3jsMapService: MapService,
    private el: ElementRef,
  ) {}

  ngOnInit(): void {
    this.initialMap();
    this.filteredMapData$.subscribe((data) => {
      console.log("FILTER DATA IN MAP");
      console.log(data);
      
      
    this.mapDataPoints = data;
    this.mapRefreshCycle()
    })
  }
  
  private mapRefreshCycle(): void {
    // delay on initial bc zoomGroup needs time to setup
    if (this.isInitialRender) { setTimeout(() => {
      if (this.zoomGroup) {
      this.mapRefreshOperations();
      this.isInitialRender = false;
      }}, 1000)
    }
    if (!this.isInitialRender) {
      if (this.zoomGroup) {
      this.mapRefreshOperations();
      }
    }
  }
   
  private mapRefreshOperations(): void {
    this.removeMarkers();
    this.drawCircleMarkers();
    // this.drawIcons();
    // this.drawCurve();
  }
   
  private removeMarkers(): void {
    d3.select("#circleMarkersGroup").remove();
    d3.select("#markersNameGroup").remove();
    d3.select("#iconGroup").remove();
    d3.selectAll("#curveGroup").remove();
  }
   

  private draw(topography: any): void {
    const { width, height } = this.getMapContainerWidthAndHeight();
    this.topoFeatureCountries = topojson.feature(topography, topography.objects.countries);
    this.center = [width/2, height/2];
    this.projection = d3.geoMercator().fitSize([width, height], this.topoFeatureCountries); // .geoNaturalEarth1(), .geoEquirectangular(), .geoIdentity()
    this.pathGenerator = d3.geoPath(this.projection);
    this.renderBaseSvg(width, height);
    this.renderOceanBackground();
    // Attach zoom controls to svg on first draw only
    if (!this.isZoomControlAttached) {
    this.createZoomControls();
    this.isZoomControlAttached = true;
    }
    this.renderCountriesAndGraticule(topography); // Features added on map that need to scale/transform on zoom/pan
    // this.preventZoomGroupClickPan();
    d3.select(window).on('resize', this.resizeMap); // resize event
  }
    
    
  // private preventZoomGroupClickPan() {
  // //prevents ouse button pan behavior on clock, drag, and dblclick zoom on each item added to zoomGroup rendered in each redraw
  //   .on("mousedown", (event) => {event.stopPropagation();})
  //   .on("click", (event) => {event.stopPropagation();})
  //   .on("dblclick", (event) => {event.stopPropagation();})
  // }



// ======================================  Static Map Story Asset Functions  =============================================

private drawCircleMarkers(resize: boolean = false): void {
  const markerData = this.mapDataPoints.filter((item) => item.markerType === "circle")
  console.log(markerData);
  
  this.markerGroup = this.zoomGroup.append('g').attr("id", "circleMarkersGroup");
  this.markerGroup.selectAll('circle')
  .data(markerData)
  .join('circle')
  .style("opacity", '0')
  .attr('cx', d=> this.projection([d.lng, d.lat])[0])
  .attr('cy', d=> this.projection([d.lng, d.lat])[1])
  .attr("fill", d => d.fillColor)
  .attr('r', "0.55")
  .attr('id', d => d.title )
  .style("stroke", "#000000")
  .style("stroke-width", "0.1px")
  .on("mouseover", (d, event) => this.tooltipMouseover(d,event))
  .on("mouseout", () => this.tooltipMouseout())
  .transition().duration(resize ? 0 : this.fadeInTime)
  .style("opacity", '1')
  }
  
  
  // icons/curve similar... just with different filter
  
  
  private tooltipMouseover = (event, d) => {
    this.ttData = d;
    this.ttPos["left"] = String(event.clientX + 30) + "px";
    this.ttPos["top"] = String(event.clientY + 80) + "px";
    this.ttPos["z-index"] = "1000";
    this.viewTooltip = true;
  };
  
  private tooltipMouseout = () => {
    this.viewTooltip = false;
    this.ttPos["z-index"] = "-1000";
  }



  // ======================================  Map Render Functions  =============================================

  private initialMap(): void {
    this.topographyService.getTopographyData().subscribe((topography: any) => {
      this.draw(topography);
    });
  }
  
  private renderCountriesAndGraticule(topography: any): void {
    // this.drawGraticule(); //draw graticule under countries
    this.defaultMapZoomLocation();
    this.renderCountryFeatures(topography);
    this.drawGraticule();//draw graticule over countries
  }

  private renderBaseSvg(width: number, height: number): void {
    this.svg = d3.select(this.svgRef.nativeElement).attr('width', width).attr('height', height);
    this.svg.append("rect").attr("width", "100%").attr("height", "100%");
  }
  
  private renderOceanBackground(): void {
    this.svg.append("rect").attr("width", "100%").attr("height", "100%").attr('id', 'world-bg')
      .attr("fill", this.C_OCEAN)
    // prevents mouse button pan behavior on click drag and dblClick zoom
    .on("mousedown", (event: any) => {event.stopPropagation();})
    .on("click", (event: any) => {event.stopPropagation();})
    .on("dblclick", (event: any) => {event.stopPropagation();})
  }
  
  private renderCountryFeatures(topography: any): void {
    let featureData = topojson.feature(topography, topography.objects.countries as any);
    this.countriesGroup = this.zoomGroup.append('g').attr("id", "mapCountriesGroup");
    this.countriesGroup.selectAll(".segment")
    .data(featureData['features'])
    .enter().append("path")
    .attr("class", "country")
    .attr("d", this.pathGenerator)
    .style("stroke", this.C_COUNTRY_BORDER)
    .style("stroke-width", "0.05px")
    .attr("fill", (d: any,i: any) => this.C_DEFAULT_COUNTRY)
    // .transition().duration(resize ? 0 : this.fadeInTime)
    .style("opacity", '1')
    .append('title').text((d: any) => d.properties.name)
  }
  
  private drawGraticule() {
    const graticule = d3.geoGraticule()
      .step([10, 10]);
    this.zoomGroup.append("path")
      .datum(graticule)
      .attr("class", "graticule")
      .attr("d", this.pathGenerator)
      .style("fill", "none")
      .style("stroke", this.C_GRATICULE)
      .style("stroke-width", "0.1px");
  }








  // ======================================  Zoom Functions  =============================================

  private defaultMapZoomLocation(): void {
    this.zoomPrecursor(4, [0,0], 1000);
  }
  
  private createZoomControls(): void {
    // 1. Creates group to append svg elements that are included in zoom
    this.zoomGroup = this.svg.append("g").attr("id", "mapZoomables");
    // 2. Creates zoom Behavior that when attached to element that calls listens and triggers the zoom event then performs the zoom handler with {tranform} values
    this.zoomBehavior = d3.zoom().scaleExtent([this.minZoom, this.maxZoom]).on('zoom', ({transform}) => {
      // console.log(transform);
      this.svg.select("#mapZoomables").attr("transform", transform);
    })
    // 3. Attaches zoomBehavior onto svg element
    this.svg.call(this.zoomBehavior)
      // uncomment below to prevent mouse scroll from interfering with map zoom while scrolling over map component
      // additional stopPropagation commands attached to each eleemtn to prevent panning
      .on("wheel.zoom", null);
  }
  
  /**
  * zoomToLocation function requires a sizable repetitive formula, abstracted precurosr function to reduce crowding and seperate functionality
  * @param zoomScale between minZoom and maxZoom
  * @param zoomLatLng Actual decimal degrees lat/lng
  * @param duration in ms
  */
  private zoomPrecursor(zoomScale: number, zoomLatLng:[number, number], duration: number): void {
    this.zoomScale = zoomScale;
    this.currentZoomLatLng = zoomLatLng;
    const svgCoords = this.latLngToSvgCoords(zoomLatLng);
    const windowHeight = this.getMapContainerWidthAndHeight().height
    this.zoomToLocation(
      this.zoomScale,
      // -(svgCoords[0] * zoomScale) * ((zoomScale - (this.mapContainer / 1.8)) / zoomScale) - windowHeight/5,
      // -(svgCoords[1] * zoomScale) * ((zoomScale - (this.mapContainer)) / zoomScale),
      -(svgCoords[0] * zoomScale) * ((zoomScale - (this.mapContainerRatio / 1.8)) / zoomScale) - windowHeight/5,
      -(svgCoords[1] * zoomScale) * ((zoomScale - (this.mapContainerRatio)) / zoomScale),
      duration
    )
  }
    
  private latLngToSvgCoords([latitude, longitude]: [number, number]): any {
    const svgCoords = this.projection([longitude, latitude]);
    return svgCoords;
  }
  
  /**
  * creates zoom identity to use as d3js zoomBehavior and zoom to specific zoom identity location
  * @param k scale
  * @param x svg coordinate
  * @param y svg coordinate
  * @param duration in ms
  */
  private zoomToLocation(k:number,x:number, y:number, duration:number) {
    const zoomId: any = d3.zoomIdentity.translate(x, y).scale(k);
    this.svg.select("#mapZoomables").transition().duration(duration).call(this.zoomBehavior.transform, zoomId)
  }
  
  // private preventZoomGroupClickPan() {
  // //prevents ouse button pan behavior on clock, drag, and dblclick zoom on each item added to zoomGroup rendered in each redraw
  // .on("mousedown", (event) => {event.stopPropagation();})
  // .on("click", (event) => {event.stopPropagation();})
  // .on("dblclick", (event) => {event.stopPropagation();})
  // }

  // ======================================  Resize/Redraw/Cleanup Functions  =============================================


  private resizeMap = (): void => {
    const { width, height } = this.getMapContainerWidthAndHeight();
    this.svg.attr('width', width).attr('height', height);
    //update projection
    this.projection.fitSize([width, height], this.topoFeatureCountries);
    // resize the map paths(countries, countryShadow, graticules)
    this.svg.selectAll('path').attr('d', this.pathGenerator);
    // redraw markers at new projection location
    this.mapRefreshOperations();
    // adjust zoom/pan
    this.zoomPrecursor(this.zoomScale, this.currentZoomLatLng, 0);
  };
  
  private getMapContainerWidthAndHeight = (): { width: number; height: number } => {
    const mapContainerEl = this.el.nativeElement.querySelector('#map') as HTMLDivElement;
    const width = mapContainerEl.clientWidth;
    const height = (width / 960) * 600;
    this.mapContainerRatio = width/height;
    return { width, height };
  };


}
