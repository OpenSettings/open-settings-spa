import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, Observable, of, Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { WindowService } from '../../../core/services/window.service';
import { GetAppsRequest } from '../models/get-apps-request';
import { CreateAppRequest } from '../models/create-app-request';
import { GetGroupedAppsRequest } from '../models/get-grouped-apps-request';
import { GetGroupedAppsResponse } from '../models/get-grouped-apps-response';
import { GetAppResponse } from '../models/get-app-response';
import { GetAppRequest } from '../models/get-app-request';
import { UpdateAppRequest } from '../models/update-app-request';
import { UpdateAppResponse } from '../models/update-app-response';
import { deleteAppRequest } from '../models/delete-app-request';
import { GetGroupedAppDataRequest } from '../models/get-grouped-app-data-request';
import { CreateAppResponse } from '../models/create-app-response';
import { IResponse, IResponseAny } from '../../../shared/models/response';
import { GetGroupedAppDataResponse } from '../models/get-grouped-app-data-response';
import { GetGroupedAppDataByIdentifierIdRequest } from '../models/get-grouped-app-data-by-identifier-id-request';
import { GetGroupedAppDataByIdentifierIdResponse } from '../models/get-grouped-app-data-by-identifier-id-response';
import { GetAppsResponseApp } from '../models/get-apps-response-app';

@Injectable({
  providedIn: 'root'
})
export class AppsService implements OnDestroy {
  private headers: HttpHeaders = new HttpHeaders();
  private route: string;
  private destroy$ = new Subject<void>();

  constructor(
    private httpClient: HttpClient,
    private authService: AuthService,
    windowService: WindowService) {
    this.route = windowService.controller.route;
    this.authService.isAuthenticated$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isAuthenticated => {
        this.headers = isAuthenticated
          ? new HttpHeaders({ 'Authorization': `${this.authService.token}` })
          : new HttpHeaders();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getGroupedApps(request: GetGroupedAppsRequest): Observable<IResponse<GetGroupedAppsResponse>> {

    let url = this.route + '/v1/apps/grouped';

    let params = new HttpParams();

    if (request.groupId) {
      params = params.append("groupId", request.groupId);
    }

    if (request.searchTerm) {
      params = params.append("searchTerm", request.searchTerm);
    }

    const queryParams = params.toString()

    url += queryParams ? '?' + queryParams : '';

    return this.httpClient.get<IResponse<GetGroupedAppsResponse>>(url, { headers: this.headers });
  }

  getAppById(request: GetAppRequest): Observable<IResponse<GetAppResponse>> {

    const url = this.route + '/v1/apps/' + request.appIdOrSlug;

    return this.httpClient.get<IResponse<GetAppResponse>>(url, { headers: this.headers });
  }

  getAppBySlug(request: GetAppRequest): Observable<IResponse<GetAppResponse>> {

    const url = this.route + '/v1/apps/slug/' + request.appIdOrSlug;

    return this.httpClient.get<IResponse<GetAppResponse>>(url, { headers: this.headers });
  }

  getApps(request: GetAppsRequest): Observable<IResponse<GetAppsResponseApp[]>> {

    let url = this.route + '/v1/apps';

    let params = new HttpParams();

    if (request.searchTerm) {
      params = params.append("searchTerm", request.searchTerm);
    }

    const queryParams = params.toString();

    url += queryParams ? '?' + queryParams : '';

    return this.httpClient.get<IResponse<GetAppsResponseApp[]>>(url, { headers: this.headers });
  }

  updateApp(request: UpdateAppRequest): Observable<IResponse<UpdateAppResponse>> {

    const url = this.route + '/v1/apps/' + request.appId;

    return this.httpClient.put<IResponse<UpdateAppResponse>>(url, request.body, { headers: this.headers }).pipe(
      catchError((response: HttpErrorResponse) => {
        if (response.status === 409) {
          return of(response.error as IResponse<UpdateAppResponse>);
        }

        return of();
      })
    );
  }

  createApp(request: CreateAppRequest): Observable<IResponse<CreateAppResponse>> {

    let url = this.route + '/v1/apps';

    return this.httpClient.post<IResponse<CreateAppResponse>>(url, request.body, { headers: this.headers });
  }

  getGroupedAppDataByAppId(request: GetGroupedAppDataRequest): Observable<IResponse<GetGroupedAppDataResponse>> {

    const url = this.route + '/v1/apps/' + request.appIdOrSlug + '/grouped';

    return this.httpClient.get<IResponse<GetGroupedAppDataResponse>>(url, { headers: this.headers });
  }

  getGroupedAppDataByAppSlug(request: GetGroupedAppDataRequest): Observable<IResponse<GetGroupedAppDataResponse>> {

    const url = this.route + '/v1/apps/slug/' + request.appIdOrSlug + '/grouped';

    return this.httpClient.get<IResponse<GetGroupedAppDataResponse>>(url, { headers: this.headers });
  }

  getGroupedAppDataByAppIdAndIdentifierId(request: GetGroupedAppDataByIdentifierIdRequest): Observable<IResponse<GetGroupedAppDataByIdentifierIdResponse>> {

    const url = this.route + '/v1/apps/' + request.appIdOrSlug + '/identifiers/' + request.identifierIdOrSlug + '/grouped';

    return this.httpClient.get<IResponse<GetGroupedAppDataByIdentifierIdResponse>>(url, { headers: this.headers });
  }

  getGroupedAppDataByAppSlugAndIdentifierSlug(request: GetGroupedAppDataByIdentifierIdRequest): Observable<IResponse<GetGroupedAppDataByIdentifierIdResponse>> {

    const url = this.route + '/v1/apps/slug/' + request.appIdOrSlug + '/identifiers/' + request.identifierIdOrSlug + '/grouped';

    return this.httpClient.get<IResponse<GetGroupedAppDataByIdentifierIdResponse>>(url, { headers: this.headers });
  }

  deleteApp(request: deleteAppRequest): Observable<IResponseAny> {

    const url = this.route + '/v1/apps/' + request.appId + '?rowVersion=' + encodeURIComponent(request.rowVersion);

    return this.httpClient.delete<IResponseAny>(url, { headers: this.headers });
  }
}