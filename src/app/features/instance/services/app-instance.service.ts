import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable, OnDestroy } from "@angular/core";
import { AuthService } from "../../../core/services/auth.service";
import { WindowService } from "../../../core/services/window.service";
import { GetInstancesByAppRequest } from "../models/get-instances-by-app-request";
import { Observable, Subject, takeUntil } from "rxjs";
import { DeleteInstanceRequest } from "../models/delete-instance-request";
import { IResponse, IResponseAny } from "../../../shared/models/response";
import { GetInstancesResponseInstance } from "../models/get-instances-response-instance";
import { OpenSettingsDefaults } from "../../../shared/open-settings-defaults";

@Injectable({
    providedIn: 'root'
})
export class AppInstanceService implements OnDestroy {
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

    deleteAppInstance(request: DeleteInstanceRequest): Observable<IResponseAny> {

        const url = this.route + OpenSettingsDefaults.Routes.V1.AppInstancesEndpoints.deleteAppInstance(request.instanceId);

        return this.httpClient.delete<IResponseAny>(url, { headers: this.headers });
    }

    getAppInstancesByAppId(request: GetInstancesByAppRequest): Observable<IResponse<GetInstancesResponseInstance[]>> {

        let url = this.route + OpenSettingsDefaults.Routes.V1.AppsEndpoints.getAppInstancesByAppId(request.appIdOrSlug);

        let params = new HttpParams();

        if (request.identifierId !== undefined) {
            params = params.append("identifierId", request.identifierId);
        }

        return this.httpClient.get<IResponse<GetInstancesResponseInstance[]>>(url, { headers: this.headers, params });
    }

    getAppInstancesByAppSlug(request: GetInstancesByAppRequest): Observable<IResponse<GetInstancesResponseInstance[]>> {

        let url = this.route + OpenSettingsDefaults.Routes.V1.AppsEndpoints.getAppInstancesByAppSlug(request.appIdOrSlug);

        let params = new HttpParams();

        if (request.identifierId !== undefined) {
            params = params.append("identifierId", request.identifierId);
        }

        return this.httpClient.get<IResponse<GetInstancesResponseInstance[]>>(url, { headers: this.headers, params });
    }

    getAppInstancesByAppIdAndIdentifierId(request: GetInstancesByAppRequest): Observable<IResponse<GetInstancesResponseInstance[]>> {

        let url = this.route + OpenSettingsDefaults.Routes.V1.AppsEndpoints.getAppInstancesByAppIdAndIdentifierId(request.appIdOrSlug, request.identifierId!);

        return this.httpClient.get<IResponse<GetInstancesResponseInstance[]>>(url, { headers: this.headers });
    }

    getAppInstancesByAppSlugAndIdentifierSlug(request: GetInstancesByAppRequest): Observable<IResponse<GetInstancesResponseInstance[]>> {

        let url = this.route + OpenSettingsDefaults.Routes.V1.AppsEndpoints.getAppInstancesByAppSlugAndIdentifierSlug(request.appIdOrSlug, request.identifierId!);

        return this.httpClient.get<IResponse<GetInstancesResponseInstance[]>>(url, { headers: this.headers });
    }
}