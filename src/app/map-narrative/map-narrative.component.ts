import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { Observable } from 'rxjs';
import { Store } from '@ngxs/store';
import { MapService } from '../shared/services/map.service';
import { TopographyService } from '../shared/services/topography.service';
import { ZoomAlterOptions } from '../shared/app.models';


@Component({
  selector: 'app-map-narrative',
  templateUrl: './map-narrative.component.html',
  styleUrls: ['./map-narrative.component.scss']
})
export class MapNarrativeComponent implements OnInit {
    // state updates
  sceneChange$: Observable<any> = this.store.select((state) => state.appState.mapScene);
  sceneChange: [];
  allScenesData$: Observable<any> = this.store.select((state) => state.appState.storyStructure);
  allScenesData: [];
  sceneData: any;

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

  // Colors
  // C_DEFAULT_COUNTRY: string = '#263238';
  // C_HIGHLIGHT_COUNTRY: string = '#455a64';
  // C_OCEAN: string = '#212121';
  // C_COUNTRY_BORDER: string = '#708792';
  // C_GRATICULE: string = '#e6e6e612';
  // C_LABEL_TEXT: string = '#eee';
  C_DEFAULT_COUNTRY: string = 'lightseagreen';
  C_HIGHLIGHT_COUNTRY: string = 'chartreuse';
  C_OCEAN: string = 'cornflowerblue';
  C_COUNTRY_BORDER: string = '#708792';
  C_GRATICULE: string = '#e6e6e612';
  C_LABEL_TEXT: string = '#eee';

  constructor(
    private topographyService: TopographyService,
    private d3jsMapService: MapService,
    private el: ElementRef,
    private store: Store
    ) {}

  ngOnInit(): void {
    this.initialMap();
    this.allScenesData$.subscribe((data) => {
      if (data.length > 0) {
        this.allScenesData = this.getOnlyRelevantSceneData(data);
      }
    })
    this.sceneChange$.subscribe((scene: any) => {
      if (scene !==null && scene.length > 0) {
        this.sceneDirector(scene)
      }
    })
  }

  private getOnlyRelevantSceneData(data: any) {
    return data.map((item: any) => item.mapChange !== null ? item.mapScene : 'FILTER OUT')
      .filter((item: any) => item !== 'FILTER OUT')
    }
    
  private sceneDirector(sceneUpdates: string[]): void {
    sceneUpdates.forEach((change) => {
      if (this.allScenesData) {
        this.sceneData = this.allScenesData.filter((dataPoint: any) => {
        return dataPoint.topic === change;
    })
    this.sceneData[0].highlightCountries ? this.highlightedCountries = this.sceneData[0].highlightCountries : this.highlightedCountries = [];
    // use map service to pan/zoom to custom lat/lng/zoom
    const newZoom: ZoomAlterOptions = this.d3jsMapService.zoomLocationSetting(change);
    this.zoomPrecursor(newZoom.zoomLevel, newZoom.latLng, newZoom.duration);
    this.mapRefreshOperations();
    }
    })
  }
    
  private mapRefreshOperations(): void {
    this.redrawCountryColors();
    this.removeMarkers();
    this.drawCircleMarkers();
    this.drawIcons();
    this.drawPolygons();
    this.drawMarkerTextLabel();
    this.drawCurve();
    this.drawLine();
  }
    
  private removeMarkers(): void {
    d3.select("#circleMarkersGroup").remove();
    d3.select("#markerNameGroup").remove();
    d3.select("#polygonsGroup").remove();
    d3.select("#iconGroup").remove();
    d3.selectAll("#lineGroup").remove();
    d3.selectAll("#lineArrowGroup").remove();
    d3.selectAll("#curveGroup").remove();
    d3.selectAll("#curveArrowGroup").remove();
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


  // ======================================  Line & Curve Path Functions  =============================================
  private drawLine(resize: boolean = false): void {
    console.log("draw line called");
    
    const lineData: any[] = this.sceneData[0].mapping.filter((obj: any) => obj?.markerType === 'line');
    lineData.forEach((line) => {
      console.log("each line");
      console.log(line);
      this.lineGroup = this.zoomGroup.append('g').attr("id", "lineGroup");
      const lineLatLngArray: [number, number][] = line.coords.map((coords: any) => [coords.lat, coords.lng]);
      const lineSvgCoords: [number, number][] = [];
      let arrowDegreeAngle: number = 0;
      this.lineGroup.selectAll('path')
      .data(lineLatLngArray)
        .join('path')
        .style("opacity", '0')
        .attr('d', (d: any, i: any) => {
          const svgCoords: [number, number] = this.latLngToSvgCoords(d);
          lineSvgCoords.push(svgCoords)
          if (lineSvgCoords.length === 2) {
            arrowDegreeAngle = Math.atan2(lineLatLngArray[1][1] - lineLatLngArray[0][1], lineLatLngArray[1][0] - lineLatLngArray[0][0] * (180/Math.PI))
          }
          console.log(lineSvgCoords);
          
          // this.drawLineArrow(lineSvgCoords[1], arrowDegreeAngle, line.strokeColor,false) //draw arrowhead for each line
          return d3.line().x((p)=> p[0]).y((p) => p[1])(lineSvgCoords)}) // add line to map
        .style("stroke", (d: any) => line.strokeColor)
        .style("stroke-width", "0.2px")
        .style("fill", "#FF000032")
        .transition().duration(resize ? 0 : this.fadeInTime)
        .style("opacity", '1');
    })
  }
  
  private drawLineArrow(data: any, angle: number, color: string, resize: boolean = false): void {
    const sideSize: number = 0.8; // px
    // if (data && data !== [undefined] && data.length) {
    if (data && data.length) {
      this.lineArrowGroup = this.zoomGroup.append('g').attr("id", "lineArrowGroup");
      this.lineArrowGroup.selectAll('path')
      .data([data])
      .join('path')
        .style("opacity", '0')
        .attr('d', (d: any) => {
          const triangleCenter = d;
          const triangleTop: [number, number] = [triangleCenter[0], triangleCenter[1] - sideSize];
          const triangleLeft: [number, number] = [triangleCenter[0] - sideSize, triangleCenter[1] + sideSize];
          const triangleRight: [number, number] = [triangleCenter[0] + sideSize, triangleCenter[1] + sideSize];
          const newTriangleSvgCoords: [number, number][] = [triangleTop, triangleLeft, triangleRight, triangleTop];
          return d3.line()(newTriangleSvgCoords)
        })
        .style("stroke", "black")
        .style("stroke-width", ".1px")
        .style("fill", color)
        .transition().duration(resize ? 0 : this.fadeInTime)
        .style("opacity", '1')
        .attr('transform-origin', (d: any) => {
          return `${d[0]} ${d[1]}`
        })
        .style('transform', `translate(0px, 0px) rotate(${Math.abs(angle - 5)}deg)`)
    }
  }
  
  private drawCurve(resize: boolean = false): void {
    // console.log("draw curve called");
   const curveData: any[] = this.sceneData[0].mapping.filter((obj: any) => obj?.markerType === 'curve');
    curveData.forEach((curve) => {
      // console.log("each curve");
      // console.log(curve);
      
      
      this.curveGroup = this.zoomGroup.append('g').attr("id", "curveGroup");
      const curveLatLngArray: [number, number][] = curve.coords.map((coords: any) => [coords.lat, coords.lng]);
      const curveSvgCoords: [number, number][] = [];
      const endPts: [number, number][] = [];
      let arrowDegreeAngle: number = 0;
      this.curveGroup.selectAll('path')
      .data(curveLatLngArray)
      .join('path')
      .style("opacity", '0')
      .attr('d', (d: any, i: any): any => {
        const svgCoords: [number, number] = this.latLngToSvgCoords(d);
        curveSvgCoords.push(svgCoords)
        if (i === 0 || curveLatLngArray.length === curveSvgCoords.length) {
          endPts.push(svgCoords);
        }
        if (curveLatLngArray.length === curveSvgCoords.length) {
          arrowDegreeAngle = Math.atan2(endPts[1][1] - endPts[0][1], endPts[1][0] - endPts[0][0] * (180/Math.PI))
          const endCoords = [svgCoords];
          this.drawCurveArrow(endCoords, arrowDegreeAngle, curve.strokeColor, false) //draw arrowhead for each line
          return d3.line().x((p)=> p[0]).y((p) => p[1]).curve(d3.curveBasis)(curveSvgCoords);
        }
      })
      .style("stroke", (d: any) => d.strokeColor)
      .style("stroke-width", "0.2px")
      .style("fill", "transparent")
      .transition().duration(resize ? 0 : this.fadeInTime)
      .style("opacity", '1');
    })
  }
  
  
  private drawCurveArrow(data: any, angle: number, color: string, resize: boolean = false): void {
    const sideSize: number = 0.8; // px
    // if (data && data !== [undefined] && data.length) {
    if (data && data.length) {
      this.curveArrowGroup = this.zoomGroup.append('g').attr("id", "curveArrowGroup");
      this.curveArrowGroup.selectAll('path')
      .data(data)
      .join('path')
      .style("opacity", '0')
      .attr('d', (d: any) => {
        const triangleCenter = d;
        const triangleTop: [number, number] = [triangleCenter[0], triangleCenter[1] - sideSize];
        const triangleLeft: [number, number] = [triangleCenter[0] - sideSize, triangleCenter[1] + sideSize];
        const triangleRight: [number, number] = [triangleCenter[0] + sideSize, triangleCenter[1] + sideSize];
        const newTriangleSvgCoords: [number, number][] = [triangleTop, triangleLeft, triangleRight, triangleTop];
        return d3.line()(newTriangleSvgCoords)
      })
      .style("stroke", "ffccbc")
      .style("stroke-width", "0.1px")
      .style("fill", color)
      .transition().duration(resize ? 0 : this.fadeInTime)
      .style("opacity", '1')
      .attr('transform-origin', (d: any) => {
        return `${d[0]} ${d[1]}`
      })
      .style('transform', `translate(0px, 0px) rotate(${Math.abs(angle)}deg)`)
    }
  }

  // ======================================  Text Labels  =============================================

  private drawMarkerTextLabel(resize: boolean = false): void {
    const markersToNameData = this.sceneData[0].mapping.filter((obj: any) => obj?.markerType === 'point' || obj?.markerType === 'icon');
    this.markerNameGroup = this.zoomGroup.append('g').attr("id", "markerNameGroup");
    this.markerNameGroup.selectAll('text')
    .data(markersToNameData)
    .join('text')
      .style("opacity", '0')
      .attr('x', (d: any) => this.projection([d.coords[0].lng, d.coords[0].lat])[0] - d.title.length/4)
      .attr('y', (d: any) => this.projection([d.coords[0].lng, d.coords[0].lat])[1] - 1.5)
      .attr("font-size", "0.07rem")
      .attr("fill", this.C_LABEL_TEXT)
      .text((d: any) => d.title)
      // .each(function(d: any) {
      //   d.textBox = this.getBBox(); // adds bounding box dimensions for rect text
      // })
      .attr('vector-effect', "non-scaling-stroke")
      .transition().duration(resize ? 0 : this.fadeInTime)
      .style("opacity", '1')
  }
  
  // ======================================  Static Map Story Asset Functions  =============================================

  private drawCircleMarkers(resize: boolean = false): void {
    const markersOfShapeData = this.sceneData[0].mapping.filter((obj: any) => obj?.markerType?.includes('point'));
    this.markerGroup = this.zoomGroup.append('g').attr("id", "circleMarkersGroup");
    this.markerGroup.selectAll('circle')
      .data(markersOfShapeData)
      .join('circle')
      .style("opacity", '0')
      .attr('cx', (d: any) => this.projection([d.coords[0].lng, d.coords[0].lat])[0])
      .attr('cy', (d: any) => this.projection([d.coords[0].lng, d.coords[0].lat])[1])
      .attr("fill", (d: any) => d.fillColor)
      .attr('r', "0.55")
      .attr('id', (d: any) => d.title )
      .style("stroke", "#000000")
      .style("stroke-width", "0.1px")
      .transition().duration(resize ? 0 : this.fadeInTime)
      .style("opacity", '1')
  }
  
  private drawIcons(resize: boolean = false): void {
    const xyCoords: any[] = [];
    const iconPxSize: number = 3;
    this.iconGroup = this.zoomGroup.append('g').attr("id", "iconGroup");
    const iconData = this.sceneData[0].mapping.filter((obj: any) => obj?.markerType === 'icon');
    const icons = this.iconGroup.selectAll('images')
    .data(iconData);
    icons
    .enter()
      .append('image')
      .merge(icons)
      .style("opacity", '0')
      .attr("xlink:href" ,(d: any) => `../../assets/icon/${d.icon}.png`)
      .attr("width", `${iconPxSize}px`)
      .attr("height", `${iconPxSize}px`)
      .attr('x', (d: any) => this.projection([d.coords[0].lng, d.coords[0].lat])[0])
      .attr('y', (d: any) => this.projection([d.coords[0].lng, d.coords[0].lat])[1])
      .attr("fill", (d: any) => d.fillColor)
      .attr('r', "0.55")
      .attr('id', (d: any) => 'icon-id' + d.title )
      .attr('transform-origin', `${xyCoords[0]} ${xyCoords[1]}`)
      .style("transform", `translate(-${iconPxSize / 2}px , -${ iconPxSize / 2}px)`)
      .transition().duration(resize ? 0 : this.fadeInTime)
      .style("opacity", '1')
  }
  
  private drawPolygons(resize: boolean = false): void {
    this.polygonGroup = this.zoomGroup.append('g').attr("id", "polygonsGroup");
    const polygonData = this.sceneData[0].mapping.filter((obj: any) => obj?.markerType === 'polygon');
    this.polygonGroup.selectAll('path')
    .data(polygonData)
    .join('path')
    .style("opacity", '0')
    .attr('d', (d: any): any => {
    if (d.markerType === "polygon") {
      let polygonSvgCoords: [number, number][] = [];
      d.coords.forEach((latLngObject: any) => {
        const lngLatArray: [number, number] = [latLngObject.lng, latLngObject.lat];
        let xCoord = this.projection(lngLatArray)[0];
        let yCoord = this.projection(lngLatArray)[1];
        const svgCoords: [number, number] = [xCoord, yCoord];
        polygonSvgCoords.push(svgCoords)
      })
      polygonSvgCoords.push(polygonSvgCoords[0]) // adds 1st coord to end of array to complete path/outside border for polygon
      return d3.line()(polygonSvgCoords)
    }
    })
    // .each(function(d: any) {
    //   d.polygonBbox = this.getBBox() // adds bounding box dimensions for rect text
    // })
    .attr('id', (d: any) => 'polygon - ' + d.title )
    .style("stroke", "#fff")
    .style("stroke-width", "0.3px")
    .attr("fill", (d: any) => d.fillColor)
    .transition().duration(resize ? 0 : this.fadeInTime)
    .style("opacity", '1')
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
  
  private redrawCountryColors(): void {
    this.countriesGroup.selectAll('path').transition().duration(this.fadeInTime).style('fill', this.C_DEFAULT_COUNTRY); // redraw all countries with default color
    this.highlightedCountries.forEach((countryId) => {
      this.countriesGroup.selectAll('path').filter(function(d: any) {return d.id === countryId}).transition().duration(this.fadeInTime).style('fill', this.C_HIGHLIGHT_COUNTRY)
    })
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