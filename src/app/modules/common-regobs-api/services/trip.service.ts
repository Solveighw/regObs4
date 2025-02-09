/* eslint-disable */
import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpResponse, HttpHeaders } from '@angular/common/http';
import { BaseService as __BaseService } from '../base-service';
import { RegobsApiConfiguration as __Configuration } from '../regobs-api-configuration';
import { StrictHttpResponse as __StrictHttpResponse } from '../strict-http-response';
import { Observable as __Observable } from 'rxjs';
import { map as __map, filter as __filter } from 'rxjs/operators';

import { FinishTripDto } from '../models/finish-trip-dto';
import { CreateTripDto } from '../models/create-trip-dto';
@Injectable({
  providedIn: 'root',
})
class TripService extends __BaseService {
  static readonly TripGetPath = '/Trip/ObserverTrips';
  static readonly TripPutPath = '/Trip';
  static readonly TripPostPath = '/Trip';

  constructor(
    config: __Configuration,
    http: HttpClient
  ) {
    super(config, http);
  }

  /**
   * Fetches GeoJSON representations of the pre-approved observation trips.
   * Only available for users in Obskorps administrative group.
   */
  TripGetResponse(): __Observable<__StrictHttpResponse<null>> {
    let __params = this.newParams();
    let __headers = new HttpHeaders();
    let __body: any = null;
    let req = new HttpRequest<any>(
      'GET',
      this.rootUrl + `/Trip/ObserverTrips`,
      __body,
      {
        headers: __headers,
        params: __params,
        responseType: 'json'
      });

    return this.http.request<any>(req).pipe(
      __filter(_r => _r instanceof HttpResponse),
      __map((_r) => {
        return _r as __StrictHttpResponse<null>;
      })
    );
  }
  /**
   * Fetches GeoJSON representations of the pre-approved observation trips.
   * Only available for users in Obskorps administrative group.
   */
  TripGet(): __Observable<null> {
    return this.TripGetResponse().pipe(
      __map(_r => _r.body as null)
    );
  }

  /**
   * @param trip undefined
   */
  TripPutResponse(trip: FinishTripDto): __Observable<__StrictHttpResponse<null>> {
    let __params = this.newParams();
    let __headers = new HttpHeaders();
    let __body: any = null;
    __body = trip;
    let req = new HttpRequest<any>(
      'PUT',
      this.rootUrl + `/Trip`,
      __body,
      {
        headers: __headers,
        params: __params,
        responseType: 'json'
      });

    return this.http.request<any>(req).pipe(
      __filter(_r => _r instanceof HttpResponse),
      __map((_r) => {
        return _r as __StrictHttpResponse<null>;
      })
    );
  }
  /**
   * @param trip undefined
   */
  TripPut(trip: FinishTripDto): __Observable<null> {
    return this.TripPutResponse(trip).pipe(
      __map(_r => _r.body as null)
    );
  }

  /**
   * @param trip undefined
   */
  TripPostResponse(trip: CreateTripDto): __Observable<__StrictHttpResponse<null>> {
    let __params = this.newParams();
    let __headers = new HttpHeaders();
    let __body: any = null;
    __body = trip;
    let req = new HttpRequest<any>(
      'POST',
      this.rootUrl + `/Trip`,
      __body,
      {
        headers: __headers,
        params: __params,
        responseType: 'json'
      });

    return this.http.request<any>(req).pipe(
      __filter(_r => _r instanceof HttpResponse),
      __map((_r) => {
        return _r as __StrictHttpResponse<null>;
      })
    );
  }
  /**
   * @param trip undefined
   */
  TripPost(trip: CreateTripDto): __Observable<null> {
    return this.TripPostResponse(trip).pipe(
      __map(_r => _r.body as null)
    );
  }
}

module TripService {
}

export { TripService }
