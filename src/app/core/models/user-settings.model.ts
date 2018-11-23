import { GeoHazard } from './geo-hazard.enum';
import { AppMode } from './app-mode.enum';
import { SupportTile } from './support-tile.model';
import { AppCountry } from './app-country.enum';
import { LangKey } from './langKey';

export interface UserSetting {
    appMode: AppMode;
    language: LangKey;
    country: AppCountry;
    currentGeoHazard: Array<GeoHazard>;
    observationDaysBack: Array<{ geoHazard: GeoHazard, daysBack: number }>;
    completedStartWizard: boolean;
    supportTiles: Array<{ name: string; enabled: boolean; opacity: number }>;
    showMapCenter: boolean;
    tilesCacheSize: number;
    showObservations: boolean;
}
