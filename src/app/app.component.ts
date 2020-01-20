import { Component, ViewChild, ElementRef, OnInit, AfterViewInit } from '@angular/core';
import { AutoCompleteModel } from './autocompletemodel';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import * as _ from 'lodash';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'here-project';
  searchInput = '';
  map: google.maps.Map;
  lat = 48.210033;
  lng = 16.363449;
  marker = new google.maps.Marker();
  autoCompleteArray: AutoCompleteModel[] = [];
  // auto complete api request --> click auf auf beitrag --> place api request für geometrys
  coordinates = new google.maps.LatLng(this.lat, this.lng);
  mapOptions: google.maps.MapOptions = {
    center: this.coordinates,
    zoom: 9,
    zoomControl: true,
    mapTypeControl: false,
    scaleControl: false,
    streetViewControl: false,
    rotateControl: true,
    fullscreenControl: false,
    styles: [
      {
        elementType: 'geometry',
        stylers: [
          {
            color: '#f5f5f5'
          }
        ]
      },
      {
        elementType: 'labels.icon',
        stylers: [
          {
            visibility: 'off'
          }
        ]
      },
      {
        elementType: 'labels.text.fill',
        stylers: [
          {
            color: '#616161'
          }
        ]
      },
      {
        elementType: 'labels.text.stroke',
        stylers: [
          {
            color: '#f5f5f5'
          }
        ]
      },
      {
        featureType: 'administrative.land_parcel',
        elementType: 'labels.text.fill',
        stylers: [
          {
            color: '#bdbdbd'
          }
        ]
      },
      {
        featureType: 'poi',
        elementType: 'geometry',
        stylers: [
          {
            color: '#eeeeee'
          }
        ]
      },
      {
        featureType: 'poi',
        elementType: 'labels.text.fill',
        stylers: [
          {
            color: '#757575'
          }
        ]
      },
      {
        featureType: 'poi.park',
        elementType: 'geometry',
        stylers: [
          {
            color: '#e5e5e5'
          }
        ]
      },
      {
        featureType: 'poi.park',
        elementType: 'labels.text.fill',
        stylers: [
          {
            color: '#9e9e9e'
          }
        ]
      },
      {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [
          {
            color: '#ffffff'
          }
        ]
      },
      {
        featureType: 'road.arterial',
        elementType: 'labels.text.fill',
        stylers: [
          {
            color: '#757575'
          }
        ]
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [
          {
            color: '#dadada'
          }
        ]
      },
      {
        featureType: 'road.highway',
        elementType: 'labels.text.fill',
        stylers: [
          {
            color: '#616161'
          }
        ]
      },
      {
        featureType: 'road.local',
        elementType: 'labels.text.fill',
        stylers: [
          {
            color: '#9e9e9e'
          }
        ]
      },
      {
        featureType: 'transit.line',
        elementType: 'geometry',
        stylers: [
          {
            color: '#e5e5e5'
          }
        ]
      },
      {
        featureType: 'transit.station',
        elementType: 'geometry',
        stylers: [
          {
            color: '#eeeeee'
          }
        ]
      },
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [
          {
            color: '#c9c9c9'
          }
        ]
      },
      {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [
          {
            color: '#9e9e9e'
          }
        ]
      }
    ]
  };
  autocompletetoken: any;
  @ViewChild('mapContainer', { static: false }) gmap: ElementRef;

  constructor() { }

  public ngOnInit() { }

  public ngAfterViewInit() {
    this.mapInitializer();
  }
  mapInitializer() {
    // Create a div to hold the control.
    const controlDiv = document.createElement('div');

    // Set CSS for the control border
    const controlUI = document.createElement('img');
    controlUI.style.cursor = 'pointer';
    controlUI.style.marginBottom = '22px';
    controlUI.style.textAlign = 'center';
    controlUI.style.width = '40px';
    controlUI.style.marginRight = '10px';
    controlUI.style.borderRadius = '20px';
    controlUI.style.backgroundColor = '#2C71D4';
    controlUI.title = 'Delete Polygon';
    controlUI.src = './assets/ic_trash_white.png';
    controlDiv.appendChild(controlUI);

    this.map = new google.maps.Map(this.gmap.nativeElement, this.mapOptions);
    this.map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(controlDiv);



    const drawingManager = new google.maps.drawing.DrawingManager({
      drawingMode: google.maps.drawing.OverlayType.MARKER,
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_CENTER,
        drawingModes: ['polygon' as any]
      },
      polygonOptions: {
        fillColor: '#2C71D4',
        strokeColor: '#2C71D4',
        strokeWeight: 1,
        clickable: true,
        editable: true,
        zIndex: 1
      }
    });
    drawingManager.setDrawingMode('polygon' as any);
    drawingManager.setMap(this.map);
    google.maps.event.addListener(drawingManager, 'polygoncomplete', event => {
      drawingManager.setMap(null);
    });
  }
  onSelectionChanged(event: MatAutocompleteSelectedEvent) {
    console.log('onSelectionChanged');
    const selectedItem = this.autoCompleteArray.filter(x => x.mainText === event.option.value)[0];
    this.autocompletetoken = null;
    const placesService = new google.maps.places.PlacesService(this.map);
    placesService.getDetails(
      { placeId: selectedItem.placeId }, (results, status) => {
        if (status === 'OK') {
          this.marker.setMap(null);
          const selectedCoordinates = new google.maps.LatLng(results.geometry.location.lat(), results.geometry.location.lng());
          this.marker = new google.maps.Marker({
            position: selectedCoordinates,
            map: this.map
          });
          const contentString = '<div id="content"><div>' +
          selectedItem.mainText +
          '</div> <div>' +
          selectedItem.secondaryText +
          '</div></div>';
          const infowindow = new google.maps.InfoWindow({
            content: contentString
          });
          this.marker.setMap(this.map);
          infowindow.open(this.map, this.marker);
          this.map.setCenter(this.marker.getPosition());
          this.map.setZoom(15);
          this.marker.setVisible(false);
        }
      }
    );

  }

  searchString = "";

  debouncedValueChange = _.debounce(() => this.getAutoCompleteFromGoogle(this.searchString), 500, {trailing: true});


  valuechange(event: any) {
    console.log('valuechange');
    console.log(event);
    if (event === '') {
      this.autoCompleteArray = [];
      return;
    }
    
    this.searchString = event;
    this.debouncedValueChange();
  }
  getAutoCompleteFromGoogle(event: any) {
    if (!this.autocompletetoken) {
      this.autocompletetoken = new google.maps.places.AutocompleteSessionToken();
    }
    const autocompleteService = new google.maps.places.AutocompleteService();
    autocompleteService.getPlacePredictions({
      input: event,
      sessionToken: this.autocompletetoken,
    }, result => {
      console.log('autocomplete Service', result);
      const suggestions = [];
      if (result) {
        this.displaySuggestions(result, suggestions);
      }
      this.autoCompleteArray = suggestions;
    });
  }
  displaySuggestions(result: any, suggestions: any[]) {
    console.log('displaySuggestions');
    result.forEach(item => {
      const acItem = new AutoCompleteModel();
      acItem.mainText = item.structured_formatting.main_text;
      acItem.secondaryText = item.structured_formatting.secondary_text;
      acItem.placeId = item.place_id;
      suggestions.push(acItem);
    });
  }
}
