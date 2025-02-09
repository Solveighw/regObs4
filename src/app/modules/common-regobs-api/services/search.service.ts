/* eslint-disable */
import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpResponse, HttpHeaders } from '@angular/common/http';
import { BaseService as __BaseService } from '../base-service';
import { RegobsApiConfiguration as __Configuration } from '../regobs-api-configuration';
import { StrictHttpResponse as __StrictHttpResponse } from '../strict-http-response';
import { Observable as __Observable } from 'rxjs';
import { map as __map, filter as __filter } from 'rxjs/operators';

import { RegistrationViewModel } from '../models/registration-view-model';
import { SearchCriteriaRequestDto } from '../models/search-criteria-request-dto';
import { SearchCriteriaExclUserRequestDto } from '../models/search-criteria-excl-user-request-dto';
import { SearchCountResponseDto } from '../models/search-count-response-dto';
import { SearchSideBarDto } from '../models/search-side-bar-dto';
import { SearchSideBarRequestDto } from '../models/search-side-bar-request-dto';
import { AtAGlanceViewModel } from '../models/at-aglance-view-model';

/**
 * Search for registrations.
 * Some methods use POST although they don't change anything in Regobs. The search criteria is too complex to put in the url, so we chose POST in order to have the search criteria in the body.
 */
@Injectable({
  providedIn: 'root',
})
class SearchService extends __BaseService {
  static readonly SearchSearchPath = '/Search';
  static readonly SearchPostSearchMyRegistrationsPath = '/Search/MyRegistrations';
  static readonly SearchCountPath = '/Search/Count';
  static readonly SearchGetSearchCriteriaPath = '/Search/SearchCriteria/{geoHazards}/{langKey}';
  static readonly SearchSearchCriteriaPath = '/Search/SearchCriteria';
  static readonly SearchAtAGlancePath = '/Search/AtAGlance';

  constructor(
    config: __Configuration,
    http: HttpClient
  ) {
    super(config, http);
  }

  /**
   * Example critera for returning the 10 newest registrations:
   * <code>
   *     { "NumberOfRecords": 10 }
   * </code>
   * @param criteria Use this to filter out registrations and change ordering of them.
   * The attribute "ObserverGuid" is deprecated and will be removed in the future.
   * @return OK
   */
  SearchSearchResponse(criteria: SearchCriteriaRequestDto): __Observable<__StrictHttpResponse<Array<RegistrationViewModel>>> {
    const __params = this.newParams();
    const __headers = new HttpHeaders();
    let __body: any = null;
    __body = criteria;
    const req = new HttpRequest<any>(
      'POST',
      this.rootUrl + '/Search',
      __body,
      {
        headers: __headers,
        params: __params,
        responseType: 'json'
      });

    return this.http.request<any>(req).pipe(
      __filter(_r => _r instanceof HttpResponse),
      __map((_r) => {
        return _r as __StrictHttpResponse<Array<RegistrationViewModel>>;
      })
    );
  }
  /**
   * Example critera for returning the 10 newest registrations:
   * <code>
   *     { "NumberOfRecords": 10 }
   * </code>
   * @param criteria Use this to filter out registrations and change ordering of them.
   * The attribute "ObserverGuid" is deprecated and will be removed in the future.
   * @return OK
   */
  SearchSearch(criteria: SearchCriteriaRequestDto): __Observable<Array<RegistrationViewModel>> {
    return this.SearchSearchResponse(criteria).pipe(
      __map(_r => _r.body as Array<RegistrationViewModel>)
    );
  }

  /**
   * Example critera for returning the 10 newest registrations:
   * <code>
   *     { "NumberOfRecords": 10 }
   * </code>
   * @param criteria Use this to filter out registrations and change ordering of them
   * @return OK
   */
  SearchPostSearchMyRegistrationsResponse(criteria: SearchCriteriaExclUserRequestDto): __Observable<__StrictHttpResponse<Array<RegistrationViewModel>>> {
    const __params = this.newParams();
    const __headers = new HttpHeaders();
    let __body: any = null;
    __body = criteria;
    const req = new HttpRequest<any>(
      'POST',
      this.rootUrl + '/Search/MyRegistrations',
      __body,
      {
        headers: __headers,
        params: __params,
        responseType: 'json'
      });

    return this.http.request<any>(req).pipe(
      __filter(_r => _r instanceof HttpResponse),
      __map((_r) => {
        return _r as __StrictHttpResponse<Array<RegistrationViewModel>>;
      })
    );
  }
  /**
   * Example critera for returning the 10 newest registrations:
   * <code>
   *     { "NumberOfRecords": 10 }
   * </code>
   * @param criteria Use this to filter out registrations and change ordering of them
   * @return OK
   */
  SearchPostSearchMyRegistrations(criteria: SearchCriteriaExclUserRequestDto): __Observable<Array<RegistrationViewModel>> {
    return this.SearchPostSearchMyRegistrationsResponse(criteria).pipe(
      __map(_r => _r.body as Array<RegistrationViewModel>)
    );
  }

  /**
   * @param criteria Search criteria
   * @return OK
   */
  SearchCountResponse(criteria: SearchCriteriaRequestDto): __Observable<__StrictHttpResponse<SearchCountResponseDto>> {
    const __params = this.newParams();
    const __headers = new HttpHeaders();
    let __body: any = null;
    __body = criteria;
    const req = new HttpRequest<any>(
      'POST',
      this.rootUrl + '/Search/Count',
      __body,
      {
        headers: __headers,
        params: __params,
        responseType: 'json'
      });

    return this.http.request<any>(req).pipe(
      __filter(_r => _r instanceof HttpResponse),
      __map((_r) => {
        return _r as __StrictHttpResponse<SearchCountResponseDto>;
      })
    );
  }
  /**
   * @param criteria Search criteria
   * @return OK
   */
  SearchCount(criteria: SearchCriteriaRequestDto): __Observable<SearchCountResponseDto> {
    return this.SearchCountResponse(criteria).pipe(
      __map(_r => _r.body as SearchCountResponseDto)
    );
  }

  /**
   * @param params The `SearchService.SearchGetSearchCriteriaParams` containing the following parameters:
   *
   * - `langKey`: NO = 1, EN = 2, DE = 3, SL = 4, SV = 5, IT = 6, NN = 7
   *
   * - `geoHazards`: A comma separated list of geo hazard ID's. Snow = 10, dirt = 20, water = 60, ice = 70. At least one geo hazard is required.
   *
   * @return OK
   */
  SearchGetSearchCriteriaResponse(params: SearchService.SearchGetSearchCriteriaParams): __Observable<__StrictHttpResponse<SearchSideBarDto>> {
    const __params = this.newParams();
    const __headers = new HttpHeaders();
    const __body: any = null;


    const req = new HttpRequest<any>(
      'GET',
      this.rootUrl + `/Search/SearchCriteria/${params.geoHazards}/${params.langKey}`,
      __body,
      {
        headers: __headers,
        params: __params,
        responseType: 'json'
      });

    return this.http.request<any>(req).pipe(
      __filter(_r => _r instanceof HttpResponse),
      __map((_r) => {
        return _r as __StrictHttpResponse<SearchSideBarDto>;
      })
    );
  }
  /**
   * @param params The `SearchService.SearchGetSearchCriteriaParams` containing the following parameters:
   *
   * - `langKey`: NO = 1, EN = 2, DE = 3, SL = 4, SV = 5, IT = 6, NN = 7
   *
   * - `geoHazards`: A comma separated list of geo hazard ID's. Snow = 10, dirt = 20, water = 60, ice = 70. At least one geo hazard is required.
   *
   * @return OK
   */
  SearchGetSearchCriteria(params: SearchService.SearchGetSearchCriteriaParams): __Observable<SearchSideBarDto> {
    return this.SearchGetSearchCriteriaResponse(params).pipe(
      __map(_r => _r.body as SearchSideBarDto)
    );
  }

  /**
   * @param request A request for relevant search criteria
   * @return OK
   */
  SearchSearchCriteriaResponse(request: SearchSideBarRequestDto): __Observable<__StrictHttpResponse<SearchSideBarDto>> {
    const __params = this.newParams();
    const __headers = new HttpHeaders();
    let __body: any = null;
    __body = request;
    const req = new HttpRequest<any>(
      'POST',
      this.rootUrl + '/Search/SearchCriteria',
      __body,
      {
        headers: __headers,
        params: __params,
        responseType: 'json'
      });

    return this.http.request<any>(req).pipe(
      __filter(_r => _r instanceof HttpResponse),
      __map((_r) => {
        return _r as __StrictHttpResponse<SearchSideBarDto>;
      })
    );
  }
  /**
   * @param request A request for relevant search criteria
   * @return OK
   */
  SearchSearchCriteria(request: SearchSideBarRequestDto): __Observable<SearchSideBarDto> {
    return this.SearchSearchCriteriaResponse(request).pipe(
      __map(_r => _r.body as SearchSideBarDto)
    );
  }

  /**
   * @param criteria Search criteria
   * @return OK
   */
  SearchAtAGlanceResponse(criteria: SearchCriteriaRequestDto): __Observable<__StrictHttpResponse<Array<AtAGlanceViewModel>>> {
    const __params = this.newParams();
    const __headers = new HttpHeaders();
    let __body: any = null;
    __body = criteria;
    const req = new HttpRequest<any>(
      'POST',
      this.rootUrl + '/Search/AtAGlance',
      __body,
      {
        headers: __headers,
        params: __params,
        responseType: 'json'
      });

    return this.http.request<any>(req).pipe(
      __filter(_r => _r instanceof HttpResponse),
      __map((_r) => {
        return _r as __StrictHttpResponse<Array<AtAGlanceViewModel>>;
      })
    );
  }
  /**
   * @param criteria Search criteria
   * @return OK
   */
  SearchAtAGlance(criteria: SearchCriteriaRequestDto): __Observable<Array<AtAGlanceViewModel>> {
    return this.SearchAtAGlanceResponse(criteria).pipe(
      __map(_r => _r.body as Array<AtAGlanceViewModel>)
    );
  }
}

namespace SearchService {

  /**
   * Parameters for SearchGetSearchCriteria
   */
  export interface SearchGetSearchCriteriaParams {

    /**
     * NO = 1, EN = 2, DE = 3, SL = 4, SV = 5, IT = 6, NN = 7
     */
    langKey: number;

    /**
     * A comma separated list of geo hazard ID's. Snow = 10, dirt = 20, water = 60, ice = 70. At least one geo hazard is required.
     */
    geoHazards: string;
  }
}

export { SearchService };
