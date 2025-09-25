import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, Observable, of, Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { WindowService } from '../../../core/services/window.service';
import { CreateSettingRequest } from '../models/create-setting-request';
import { CreateSettingResponse } from '../models/create-setting-response';
import { GetSettingsDataRequest } from '../models/get-settings-data-request';
import { UpdateSettingDataRequest } from '../models/update-setting-data-request';
import { UpdateSettingDataResponse } from '../models/update-setting-data-response';
import { GetSettingDataRequest } from '../models/get-setting-data-request';
import { GetAppSettingDataResponse } from '../models/get-app-setting-data-response';
import { CopySettingToRequest } from '../models/copy-setting-to-request';
import { CopySettingToResponse } from '../models/copy-setting-to-response';
import { DeleteSettingRequest } from '../models/delete-setting-request';
import { UpdateSettingRequest } from '../models/update-setting-request';
import { UpdateSettingResponse } from '../models/update-setting-response';
import { IResponse, IResponseAny } from '../../../shared/models/response';
import { GetSettingByIdRequest } from '../models/get-setting-by-id-request';
import { GetSettingByIdResponse } from '../models/get-setting-by-id-response';
import { GetSettingsDataResponse } from '../models/get-settings-data-response';
import { GetSettingsByIdentifierIdResponseData } from '../models/get-settings-by-identifier-id-response-data';
import { GetSettingsByIdentifierIdRequest } from '../models/get-settings-by-identifier-id-request';
import { OpenSettingsDefaults } from '../../../shared/open-settings-defaults';
import { GetSettingsByIdentifierIdResponseDataSetting } from '../models/get-settings-by-identifier-id-response-data-setting';

@Injectable({
    providedIn: 'root'
})
export class AppSettingService implements OnDestroy {
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

    getAppSettingsByAppIdAndIdentifierId(request: GetSettingsByIdentifierIdRequest): Observable<IResponse<GetSettingsByIdentifierIdResponseData>> {

        const url = this.route + OpenSettingsDefaults.Routes.V1.AppsEndpoints.getAppSettingsByAppIdAndIdentifierId(request.appIdOrSlug, request.identifierIdOrSlug);

        return this.httpClient.get<IResponse<GetSettingsByIdentifierIdResponseData>>(url, { headers: this.headers });
    }

    getAppSettingsByAppSlugAndIdentifierSlug(request: GetSettingsByIdentifierIdRequest): Observable<IResponse<GetSettingsByIdentifierIdResponseData>> {

        const url = this.route + OpenSettingsDefaults.Routes.V1.AppsEndpoints.getAppSettingsByAppSlugAndIdentifierSlug(request.appIdOrSlug, request.identifierIdOrSlug);

        return this.httpClient.get<IResponse<GetSettingsByIdentifierIdResponseData>>(url, { headers: this.headers });
    }

    getAppSettingsData(request: GetSettingsDataRequest): Observable<IResponse<GetSettingsDataResponse>> {

        const url = this.route + OpenSettingsDefaults.Routes.V1.AppsEndpoints.getAppSettingsData(request.appId);

        let params = new HttpParams();

        if (request.identifierId) {
            params = params.append('identifierId', request.identifierId);
        }

        if (request.ids && request.ids.length > 0) {
            params = params.append('ids', request.ids.join(','));
        }

        return this.httpClient.get<IResponse<GetSettingsDataResponse>>(url, { headers: this.headers, params });
    }

    copyAppSettingTo(request: CopySettingToRequest): Observable<IResponse<CopySettingToResponse>> {

        const url = this.route + OpenSettingsDefaults.Routes.V1.AppSettingsEndpoints.copyAppSettingTo(request.settingId);

        return this.httpClient.post<IResponse<CopySettingToResponse>>(url, request.body, { headers: this.headers });
    }

    getAppSettingData(request: GetSettingDataRequest): Observable<IResponse<GetAppSettingDataResponse>> {

        const url = this.route + OpenSettingsDefaults.Routes.V1.AppSettingsEndpoints.getAppSettingData(request.settingId);

        return this.httpClient.get<IResponse<GetAppSettingDataResponse>>(url, { headers: this.headers });
    }

    deleteAppSetting(request: DeleteSettingRequest): Observable<IResponseAny> {

        const url = this.route + OpenSettingsDefaults.Routes.V1.AppSettingsEndpoints.deleteAppSetting(request.settingId);

        let params = new HttpParams().append('rowVersion', request.rowVersion);

        return this.httpClient.delete<IResponseAny>(url, { headers: this.headers, params });
    }

    getAppSettingById(request: GetSettingByIdRequest): Observable<IResponse<GetSettingByIdResponse>> {

        let url = this.route + OpenSettingsDefaults.Routes.V1.AppSettingsEndpoints.getAppSettingById(request.settingId);

        let params = new HttpParams();

        if (request.excludes) {
            params = params.append('excludes', request.excludes.join(','));
        }

        return this.httpClient.get<IResponse<GetSettingByIdResponse>>(url, { headers: this.headers, params });
    }

    updateAppSetting(request: UpdateSettingRequest): Observable<IResponse<UpdateSettingResponse>> {

        const url = this.route + OpenSettingsDefaults.Routes.V1.AppSettingsEndpoints.updateAppSetting(request.settingId);

        return this.httpClient.put<IResponse<UpdateSettingResponse>>(url, request.body, { headers: this.headers }).pipe(
            catchError((response: HttpErrorResponse) => {
                if (response.status === 409) {
                    return of(response.error as IResponse<UpdateSettingResponse>);
                }

                throw response;
            })
        );;
    }

    createAppSetting(request: CreateSettingRequest): Observable<IResponse<CreateSettingResponse>> {

        const url = this.route + OpenSettingsDefaults.Routes.V1.AppSettingsEndpoints.createAppSetting();

        return this.httpClient.post<IResponse<CreateSettingResponse>>(url, request.body, { headers: this.headers });
    }

    updateAppSettingData(request: UpdateSettingDataRequest): Observable<IResponse<UpdateSettingDataResponse>> {

        const url = this.route + '/v1/app-settings/' + request.settingId + '/data';

        return this.httpClient.put<IResponse<UpdateSettingDataResponse>>(url, request.body, { headers: this.headers }).pipe(
            catchError((response: HttpErrorResponse) => {
                if (response.status === 409) {
                    return of(response.error as IResponse<UpdateSettingDataResponse>);
                }

                throw response;
            })
        );
    }
}