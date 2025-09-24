import { HttpHeaders, HttpClient } from "@angular/common/http";
import { Injectable, OnDestroy } from "@angular/core";
import { Observable, Subject, takeUntil } from "rxjs";
import { AuthService } from "../../../core/services/auth.service";
import { WindowService } from "../../../core/services/window.service";
import { IResponse } from "../../../shared/models/response";
import { PatchConfigurationRequest } from "../models/patch-configuration-request";
import { PatchConfigurationResponse } from "../models/patch-configuration-response";
import { GetAppConfigurationByAppAndIdentifierRequest } from "../../instance/models/get-configuration-by-app-and-identifier-request";
import { GetAppConfigurationByAppAndIdentifierResponse } from "../../instance/models/get-configuration-by-app-and-identifier-response";
import { OpenSettingsDefaults } from "../../../shared/open-settings-defaults";

@Injectable({
    providedIn: 'root'
})
export class AppConfigurationService implements OnDestroy {
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

    getAppConfigurationByAppAndIdentifier(request: GetAppConfigurationByAppAndIdentifierRequest): Observable<IResponse<GetAppConfigurationByAppAndIdentifierResponse>> {

        let url = this.route + OpenSettingsDefaults.Routes.V1.AppsEndpoints.getAppConfigurationByAppIdAndIdentifierId(request.appId, request.identifierId);

        return this.httpClient.get<IResponse<GetAppConfigurationByAppAndIdentifierResponse>>(url, { headers: this.headers });
    }

    patchAppConfiguration(request: PatchConfigurationRequest): Observable<IResponse<PatchConfigurationResponse>> {

        let url = this.route + OpenSettingsDefaults.Routes.V1.AppsEndpoints.patchAppConfiguration(request.appId, request.identifierId);

        return this.httpClient.patch<IResponse<PatchConfigurationResponse>>(url, request.body, { headers: this.headers });
    }
}