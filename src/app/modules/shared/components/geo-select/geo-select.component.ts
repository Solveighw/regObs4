import { Component, OnInit } from '@angular/core';
import { UserSettingService } from '../../../../core/services/user-setting/user-setting.service';
import { UserSetting } from '../../../../core/models/user-settings.model';
import { GeoHazard } from 'src/app/modules/common-core/models';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-geo-select',
  templateUrl: './geo-select.component.html',
  styleUrls: ['./geo-select.component.scss']
})
export class GeoSelectComponent implements OnInit {
  geoHazardTypes: Array<GeoHazard[]>;
  isOpen = false;
  userSettings$: Observable<UserSetting>;

  constructor(private userSettingService: UserSettingService) {}

  ngOnInit(): void {
    this.geoHazardTypes = [
      [GeoHazard.Snow],
      [GeoHazard.Ice],
      [GeoHazard.Water, GeoHazard.Soil]
    ];
    this.userSettings$ = this.userSettingService.userSetting$;
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
  }

  async changeGeoHazard(geoHazards: GeoHazard[]): Promise<void> {
    this.isOpen = false;
    const currentSettings = await this.userSettingService.userSetting$
      .pipe(take(1))
      .toPromise();
    this.userSettingService.saveUserSettings({
      ...currentSettings,
      currentGeoHazard: geoHazards
    });
  }
}
