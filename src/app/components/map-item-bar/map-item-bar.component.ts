import { Component, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { MapItem } from '../../core/models/map-item.model';
import * as moment from 'moment';
import { RegObsObservation } from '../../core/models/regobs-observation.model';
import { Geolocation, Geoposition } from '@ionic-native/geolocation/ngx';
import * as L from 'leaflet';
import { HelperService } from '../../core/services/helpers/helper.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { GeoHazard } from '../../core/models/geo-hazard.enum';

@Component({
  selector: 'app-map-item-bar',
  templateUrl: './map-item-bar.component.html',
  styleUrls: ['./map-item-bar.component.scss']
})
export class MapItemBarComponent implements OnInit {

  visible: boolean;
  topHeader: string;
  title: string;
  distanceAndType: string;
  name: string;
  id: number;
  geoHazard: GeoHazard;

  private _isVisible: Subject<boolean>;

  get isVisible(): Observable<boolean> {
    return this._isVisible.asObservable();
  }

  constructor(
    private geolocation: Geolocation,
    private helper: HelperService,
    private translateService: TranslateService,
    private router: Router
  ) {
    this.visible = false;
    this._isVisible = new Subject();
  }

  ngOnInit() {
  }

  getTitle(item: RegObsObservation) {
    const allRegistrationNames: Array<string> = (item.Registrations || []).map((registration) => registration.RegistrationName);
    const uniqueValues = Array.from(new Set(allRegistrationNames));
    return uniqueValues.join(', ');
  }

  show(item: MapItem) {
    this.id = item.RegId;
    this.topHeader = moment(item.DtObsTime).format('d/M HH:mm');
    this.title = this.getTitle(item);
    this.name = item.NickName;
    this.setDistanceAndType(item);
    this.visible = true;
    this.publishChange();
    this.geoHazard = item.GeoHazardTid;
  }

  hide() {
    this.visible = false;
    this.publishChange();
  }

  navigateToItem() {
    this.router.navigateByUrl(`view-observation/${this.id}`);
  }

  private publishChange() {
    this._isVisible.next(this.visible);
  }

  private async setDistanceAndType(item: MapItem) {
    this.distanceAndType = ''; // set by promise
    const translations = await this.translateService.get(['MAP_ITEM_BAR.OBSERVATION', 'MAP_ITEM_BAR.AWAY']).toPromise();
    try {
      const currentPosition = await this.geolocation.getCurrentPosition(
        {
          enableHighAccuracy: true,
          timeout: 20 * 1000,
          maximumAge: 10 * 60 * 1000
        });
      const distance = L.latLng(item.Latitude, item.Longitude)
        .distanceTo(L.latLng(currentPosition.coords.latitude, currentPosition.coords.longitude));
      this.distanceAndType = `${item.GeoHazardName}${translations['MAP_ITEM_BAR.OBSERVATION'].toLowerCase()} `
        + `${this.helper.getDistanceText(distance)} ${translations['MAP_ITEM_BAR.AWAY'].toLowerCase()}`;
    } catch {
      this.distanceAndType = `${item.GeoHazardName}${translations['MAP_ITEM_BAR.OBSERVATION'].toLowerCase()}`;
    }
  }
}
