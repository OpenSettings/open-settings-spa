import { HttpHeaders, HttpClient } from "@angular/common/http";
import { Injectable, OnDestroy } from "@angular/core";
import { Observable, Subject, takeUntil } from "rxjs";
import { AuthService } from "../../../core/services/auth.service";
import { WindowService } from "../../../core/services/window.service";
import { IResponse } from "../../../shared/models/response";
import { PatchConfigurationRequest } from "../models/patch-configuration-request";
import { PatchConfigurationResponse } from "../models/patch-configuration-response";
import { GetConfigurationByAppAndIdentifierRequest } from "../../instance/models/get-configuration-by-app-and-identifier-request";
import { GetConfigurationByAppAndIdentifierResponse } from "../../instance/models/get-configuration-by-app-and-identifier-response";

@Injectable({
    providedIn: 'root'
})
export class ConfigurationsService implements OnDestroy {
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

    getConfigurationByAppAndIdentifier(request: GetConfigurationByAppAndIdentifierRequest): Observable<IResponse<GetConfigurationByAppAndIdentifierResponse>> {

        let url = this.route + `/v1/apps/${request.appId}/identifiers/${request.identifierId}/configuration`;

        return this.httpClient.get<IResponse<GetConfigurationByAppAndIdentifierResponse>>(url, { headers: this.headers });
    }

    patchConfiguration(request: PatchConfigurationRequest): Observable<IResponse<PatchConfigurationResponse>> {

        let url = this.route + `/v1/apps/${request.appId}/identifiers/${request.identifierId}/configuration`;

        return this.httpClient.patch<IResponse<PatchConfigurationResponse>>(url, request.body, { headers: this.headers });
    }
}