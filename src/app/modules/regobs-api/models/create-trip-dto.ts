/* tslint:disable */
export interface CreateTripDto {
  Comment?: string;
  DeviceGuid?: string;
  GeoHazardID?: number;
  Lat?: string;
  Lng?: string;
  ObservationExpectedMinutes?: number;
  ObserverGuid?: string;
  TripTypeID?: number;
}
