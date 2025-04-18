import { HttpHeaders, HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable, OnDestroy } from "@angular/core";
import { catchError, Observable, of, Subject, takeUntil } from "rxjs";
import { AuthService } from "../../core/services/auth.service";
import { WindowService } from "../../core/services/window.service";
import { IResponse, IResponseAny } from "../models/response";
import { CreateAppIdentifierMappingRequest } from "../../features/app/models/create-app-identifier-mapping-request";
import { CreateAppIdentifierMappingResponse } from "../../features/app/models/create-app-identifier-mapping-response";

@Injectable({
    providedIn: 'root'
})
export class AppIdentifierMappingsService implements OnDestroy {
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

    getAppIdentifierMappingsByAppId(request: GetAppIdentifierMappingsRequest): Observable<IResponse<GetAppIdentifierMappingsResponse>> {

        const url = this.route + '/v1/apps/' + request.appIdOrSlug + '/identifiers';

        return this.httpClient.get<IResponse<GetAppIdentifierMappingsResponse>>(url, { headers: this.headers });
    }

    getAppIdentifierMappingsByAppSlug(request: GetAppIdentifierMappingsRequest): Observable<IResponse<GetAppIdentifierMappingsResponse>> {

        const url = this.route + '/v1/apps/slug' + request.appIdOrSlug + '/identifiers';

        return this.httpClient.get<IResponse<GetAppIdentifierMappingsResponse>>(url, { headers: this.headers });
    }

    getAppIdentifierMappingByAppIdAndIdentifierId(request: GetAppIdentifierMappingByAppAndIdentifierRequest): Observable<IResponse<GetAppIdentifierMappingByAppAndIdentifierResponse>> {

        const url = this.route + '/v1/apps/' + request.appIdOrSlug + '/identifiers/' + request.identifierIdOrSlug;

        return this.httpClient.get<IResponse<GetAppIdentifierMappingByAppAndIdentifierResponse>>(url, { headers: this.headers });
    }

    getAppIdentifierMappingByAppSlugAndIdentifierSlug(request: GetAppIdentifierMappingByAppAndIdentifierRequest): Observable<IResponse<GetAppIdentifierMappingByAppAndIdentifierResponse>> {

        const url = this.route + '/v1/apps/slug/' + request.appIdOrSlug + '/identifiers/' + request.identifierIdOrSlug;

        return this.httpClient.get<IResponse<GetAppIdentifierMappingByAppAndIdentifierResponse>>(url, { headers: this.headers });
    }

    createAppIdentifierMapping(request: CreateAppIdentifierMappingRequest): Observable<IResponse<CreateAppIdentifierMappingResponse>> {

        const url = this.route + '/v1/apps/' + request.appId + '/identifiers';

        return this.httpClient.post<IResponse<CreateAppIdentifierMappingResponse>>(url, request.body, { headers: this.headers });
    }

    deleteAppIdentifierMapping(request: DeleteAppIdentifierMappingRequest): Observable<IResponseAny> {

        const url = this.route + '/v1/apps/' + request.appId + '/identifiers/' + request.identifierId + '?rowVersion=' + encodeURIComponent(request.mappingRowVersion);

        return this.httpClient.delete<IResponseAny>(url, { headers: this.headers });
    }

    updateAppIdentifierMappingSortOrder(request: UpdateAppIdentifierMappingSortOrderRequest): Observable<IResponse<UpdateAppIdentifierMappingSortOrderResponse>> {

        const url = this.route + '/v1/apps/' + request.appId + '/identifiers/' + request.identifierId + '/sort-order';

        return this.httpClient.put<IResponse<UpdateAppIdentifierMappingSortOrderResponse>>(url, request.body, { headers: this.headers }).pipe(
            catchError((response: HttpErrorResponse) => {
                if (response.status === 409) {
                    return of(response.error as IResponse<UpdateAppIdentifierMappingSortOrderResponse>);
                }

                throw response;
            })
        );;
    }
}

export interface DeleteAppIdentifierMappingRequest {
    appId: string;
    identifierId: string;
    mappingRowVersion: string;
}

export interface UpdateAppIdentifierMappingSortOrderRequest {
    appId: string;
    identifierId: string;
    body: UpdateAppIdentifierMappingSortOrderRequestBody;
}

export interface UpdateAppIdentifierMappingSortOrderRequestBody {
    ascent: boolean;
    rowVersion: string;
}

export interface UpdateAppIdentifierMappingSortOrderResponse {
    sortOrder: number;
    rowVersion: string;
}

export interface GetAppIdentifierMappingsRequest {
    appIdOrSlug: string;
}

export interface GetAppIdentifierMappingsResponseIdentifier {
    id: string;
    sortOrder: number;
    mappingSortOrder: number;
    mappingRowVersion: string;
}

export interface GetAppIdentifierMappingsResponse {
    minSortOrder: number;
    maxSortOrder: number;
    mappingMinSortOrder: number;
    mappingMaxSortOrder: number;
    identifiers: GetAppIdentifierMappingsResponseIdentifier[];
}

export interface GetAppIdentifierMappingByAppAndIdentifierRequest {
    appIdOrSlug: string;
    identifierIdOrSlug: string;
}

export interface GetAppIdentifierMappingByAppAndIdentifierResponse {
    mappingSortOrder: number;
    appId: string;
    identifier: GetAppIdentifierMappingByAppAndIdentifierResponseSettingIdentifer
}

export interface GetAppIdentifierMappingByAppAndIdentifierResponseSettingIdentifer {
    id: string;
    sortOrder: number;
}