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
import { GetSettingDataResponse } from '../models/get-setting-data-response';
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

@Injectable({
    providedIn: 'root'
})
export class SettingsService implements OnDestroy {
    private headers: HttpHeaders = new HttpHeaders();
    private route: string;
    private destroy$ = new Subject<void>();

    constructor(
        private httpClient: HttpClient,
        private authService: AuthService,
        windowService: WindowService) {
        this.route = windowService.controllerOptions.route;
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

    getSettingsByAppIdAndIdentifierId(request: GetSettingsByIdentifierIdRequest): Observable<IResponse<GetSettingsByIdentifierIdResponseData[]>> {

        const url = this.route + '/v1/apps/' + request.appIdOrSlug + '/identifiers/' + request.identifierIdOrSlug + '/settings';

        return this.httpClient.get<IResponse<GetSettingsByIdentifierIdResponseData[]>>(url, { headers: this.headers });
    }

    getSettingsByAppSlugAndIdentifierSlug(request: GetSettingsByIdentifierIdRequest): Observable<IResponse<GetSettingsByIdentifierIdResponseData[]>> {

        const url = this.route + '/v1/apps/slug' + request.appIdOrSlug + '/identifiers/' + request.identifierIdOrSlug + '/settings';

        return this.httpClient.get<IResponse<GetSettingsByIdentifierIdResponseData[]>>(url, { headers: this.headers });
    }

    getSettingsData(request: GetSettingsDataRequest): Observable<IResponse<GetSettingsDataResponse>> {

        let url = this.route + '/v1/apps/' + request.appId + '/settings/data';

        let params = new HttpParams();

        if (request.identifierId) {
            params = params.append('identifierId', request.identifierId);
        }

        if (request.ids && request.ids.length > 0) {
            params = params.append('ids', request.ids.join(','));
        }

        const queryParams = params.toString()

        url += queryParams ? '?' + queryParams : '';

        return this.httpClient.get<IResponse<GetSettingsDataResponse>>(url, { headers: this.headers });
    }

    copySettingTo(request: CopySettingToRequest): Observable<IResponse<CopySettingToResponse>> {
        
        const url = this.route + '/v1/settings/' + request.settingId + '/copy';

        return this.httpClient.post<IResponse<CopySettingToResponse>>(url, request.body, { headers: this.headers });
    }

    getSettingData(request: GetSettingDataRequest): Observable<IResponse<GetSettingDataResponse>> {

        const url = this.route + '/v1/settings/' + request.settingId + '/data';

        return this.httpClient.get<IResponse<GetSettingDataResponse>>(url, { headers: this.headers });
    }

    deleteSetting(request: DeleteSettingRequest): Observable<IResponseAny> {

        const url = this.route + '/v1/settings/' + request.settingId + '?rowVersion=' + encodeURIComponent(request.rowVersion);

        return this.httpClient.delete<IResponseAny>(url, { headers: this.headers });
    }

    getSettingById(request: GetSettingByIdRequest): Observable<IResponse<GetSettingByIdResponse>> {

        let url = this.route + '/v1/settings/' + request.settingId;

        let params = new HttpParams();

        if(request.excludes){
            params = params.append('excludes', request.excludes.join(','));
        }

        const queryParams = params.toString();

        url +=  queryParams ? '?' + queryParams : '';

        return this.httpClient.get<IResponse<GetSettingByIdResponse>>(url, { headers: this.headers });
    }

    updateSetting(request: UpdateSettingRequest): Observable<IResponse<UpdateSettingResponse>> {

        const url = this.route + '/v1/settings/' + request.settingId;

        return this.httpClient.put<IResponse<UpdateSettingResponse>>(url, request.body, { headers: this.headers }).pipe(
            catchError((response: HttpErrorResponse) => {
                if(response.status === 409){
                    return of(response.error as IResponse<UpdateSettingResponse>);
                }

                throw response;
            })
        );;
    }

    createSetting(request: CreateSettingRequest): Observable<IResponse<CreateSettingResponse>> {

        const url = this.route + '/v1/settings';

        return this.httpClient.post<IResponse<CreateSettingResponse>>(url, request.body, { headers: this.headers });
    }

    updateSettingData(request: UpdateSettingDataRequest): Observable<IResponse<UpdateSettingDataResponse>> {

        const url = this.route + '/v1/settings/' + request.settingId + '/data';

        return this.httpClient.put<IResponse<UpdateSettingDataResponse>>(url, request.body, { headers: this.headers }).pipe(
            catchError((response: HttpErrorResponse) => {
                if(response.status === 409){
                    return of(response.error as IResponse<UpdateSettingDataResponse>);
                }

                throw response;
            })
        );
    }
}