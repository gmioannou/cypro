import { Injectable } from '@angular/core';
import { loadModules } from 'esri-loader';
import { Platform } from '@ionic/angular';
import { GeolocationOptions, Geolocation } from '@capacitor/core';
import axios from 'axios'
import formurlencoded from 'form-urlencoded';
import { environment } from '../../environments/environment';

// service layers
const featureServiceUrl = environment.serviceUrl + "/FeatureServer/0";
const mapServiceUrl = environment.serviceUrl + "/MapServer/0";

@Injectable({
  providedIn: 'root'
})
export class MapViewService {

  constructor(public platform: Platform) { }
  
  featureLayer: any = null
  
  getFetureLayerDescriptor() {
    let featureLayerDescriptor: any
    featureLayerDescriptor = axios.get(mapServiceUrl + "?f=json")

    return featureLayerDescriptor
  }

  async getMapView() {
    await this.platform.ready();

    //
    // Load the ArcGIS API for JavaScript modules
    //
    const [Map, WebMap, MapView, Locate, Editor, FeatureLayer, Track, Graphic, Compass, BasemapToggle, PopupTemplate, AttachmentsContent]: any = await loadModules([
      'esri/Map',
      'esri/WebMap',
      'esri/views/MapView',
      'esri/widgets/Locate',
      'esri/widgets/Editor',
      'esri/layers/FeatureLayer',
      'esri/widgets/Track',
      'esri/Graphic',
      'esri/widgets/Compass',
      'esri/widgets/BasemapToggle',
      'esri/PopupTemplate',
      'esri/popup/content/AttachmentsContent'
    ])
      .catch(err => {
        console.error('ArcGIS: ', err);
      });

    return new Promise((resolve, reject) => {

      // Create the fields popup element
      let fieldInfosElement = {
        type: "fields",
        fieldInfos: [
          {
            fieldName: "hazard_type",
            label: "Hazard Type"
          },
          {
            fieldName: "description",
            label: "Description"
          },
          {
            fieldName: "instructions",
            label: "Instructions"
          },
          {
            fieldName: "status",
            label: "Status"
          },
          {
            fieldName: "priority",
            label: "Priority"
          },
          {
            fieldName: "longitude",
            label: "Longitude"
          },
          {
            fieldName: "latitude",
            label: "Latitude"
          },
          {
            fieldName: "altitude",
            label: "Altitude"
          },
          {
            fieldName: "accuracy",
            label: "Accuracy"
          },
          {
            fieldName: "created_date",
            label: "Date"
          },
          {
            fieldName: "collected_user",
            label: "Collected by"
          }
        ]
      }

      // Create the AttachmentsContent popup element
      let attachmentsElement = new AttachmentsContent({
        displayType: "list"
      });


      // create the popup template object
      var template = new PopupTemplate({
        title: "CyPRO",
        content: [
          fieldInfosElement,
          attachmentsElement
        ]
      });

      // create the feature layer object
      let featureLayer = new FeatureLayer({
        url: mapServiceUrl,
        popupTemplate: template
      });
      this.featureLayer = featureLayer

      // create the mapview and the map
      let mapView = new MapView({
        center: [33.22861, 35.07287],
        zoom: 8,
        map: new Map({
          basemap: 'osm',
          layers: [featureLayer]
        })
      });

      
      //
      // Add widgets to the MapView
      //

      // locateWidget
      var locateWidget = new Locate({
        view: mapView,
        useHeadingEnabled: true,
        goToOverride: function (view, options) {
          options.target.scale = 1500;  // Override the default map scale
          return view.goTo(options.target);
        }
      });
      mapView.ui.add(locateWidget, "top-left");

      // compassWidget
      var compassWidget = new Compass({
        view: mapView
      });
      mapView.ui.add(compassWidget, "top-left");

      // basemapToggleWidget
      var basemapToggleWidget = new BasemapToggle({
        view: mapView,
        nextBasemap: "satellite"
      });
      mapView.ui.add(basemapToggleWidget, "bottom-left");

      // zoom to current location
      mapView.when(function () {
        locateWidget.locate();
      });

      resolve(mapView)
    })

  }

  // create the new hazard event position and send it to the backend for storage
  async captureEvent(eventForm, photoList) {

    // get current device position
    const geolocationOptions: GeolocationOptions = {
      enableHighAccuracy: true,
      requireAltitude: true
    }
    const devicePosition = await Geolocation.getCurrentPosition(geolocationOptions)

    // update the eventForm
    eventForm.controls['longitude'].setValue(devicePosition.coords.longitude);
    eventForm.controls['latitude'].setValue(devicePosition.coords.latitude);
    eventForm.controls['altitude'].setValue(devicePosition.coords.altitude);
    eventForm.controls['accuracy'].setValue(devicePosition.coords.accuracy);

    //convert eventForm to data
    const eventFormData = eventForm.value;
    console.log(eventFormData);

    // prepare the event position object
    let eventPosition = [{
      "geometry": {
        "spatialReference": {
          wkid: 4326
        },
        "x": devicePosition.coords.longitude,
        "y": devicePosition.coords.latitude
      },
      "attributes": eventFormData
    }]
    let eventPositionEncodedStr = formurlencoded({ f: "json", adds: JSON.stringify(eventPosition) })

    // execute the post request - create event
    try {
      const res = await axios.post(featureServiceUrl + "/applyEdits", eventPositionEncodedStr, {
        headers: {
          'content-type': 'application/x-www-form-urlencoded;'
        }
      })

      // get the objectID of the newly created feature to link the attachements
      let objectID = res.data.addResults[0].objectId

      // convert photos to images and send them to the backend for storage ony by one
      if (photoList.length > 0) {
        photoList.map(async (photo) => {
          let img = this.dataURItoBlob(photo.dataUrl)
          const formData = new FormData();
          formData.append("f", "json")
          formData.append("attachment", new File([img], Date.now().toString() + ".png", { type: "image/png", lastModified: Date.now() }))

          // post request for the attachments - creare photo attachment
          await axios.post(featureServiceUrl + '/' + objectID + "/addAttachment", formData, {
            headers: {
              'content-type': 'multipart/form-data'
            }
          })

        })
      }

      // refresh feature layer
      this.featureLayer.refresh()
      return objectID

    } catch (e) {
      console.log(e)
    }
  }

  delay(num) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve("success")
      }, num)
    })
  }

  // convert the dataURI image format to binary
  dataURItoBlob(dataURI) {
    var byteStr;

    if (dataURI.split(',')[0].indexOf('base64') >= 0)
      byteStr = atob(dataURI.split(',')[1]);
    else
      byteStr = unescape(dataURI.split(',')[1]);

    var mimeStr = dataURI.split(',')[0].split(':')[1].split(';')[0];

    var arr = new Uint8Array(byteStr.length);
    for (var i = 0; i < byteStr.length; i++) {
      arr[i] = byteStr.charCodeAt(i);
    }

    return new Blob([arr], { type: mimeStr });
  }

}
