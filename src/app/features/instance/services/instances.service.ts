import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable, OnDestroy } from "@angular/core";
import { AuthService } from "../../../core/services/auth.service";
import { WindowService } from "../../../core/services/window.service";
import { GetInstancesByAppRequest } from "../models/get-instances-by-app-request";
import { Observable, Subject, takeUntil } from "rxjs";
import { DeleteInstanceRequest } from "../models/delete-instance-request";
import { DeleteInstanceResponse } from "../models/delete-instance-response";
import { IResponse, IResponseAny } from "../../../shared/models/response";
import { GetInstancesResponseInstance } from "../models/get-instances-response-instance";

@Injectable({
    providedIn: 'root'
})
export class InstancesService implements OnDestroy {
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

    deleteInstance(request: DeleteInstanceRequest): Observable<IResponseAny> {
        const url = this.route + '/v1/instances/' + request.instanceId;

        return this.httpClient.delete<IResponseAny>(url, { headers: this.headers });
    }

    getInstancesByAppId(request: GetInstancesByAppRequest): Observable<IResponse<GetInstancesResponseInstance[]>> {

        let url = this.route + '/v1/apps/' + request.appIdOrSlug + '/instances';

        let params = new HttpParams();

        if (request.identifierId !== undefined) {
            params = params.append("identifierId", request.identifierId);
        }

        const queryParams = params.toString()

        url += queryParams ? '?' + queryParams : '';

        return this.httpClient.get<IResponse<GetInstancesResponseInstance[]>>(url, { headers: this.headers });
    }

    getInstancesByAppBySlug(request: GetInstancesByAppRequest): Observable<IResponse<GetInstancesResponseInstance[]>> {

        let url = this.route + '/v1/apps/slug/' + request.appIdOrSlug + '/instances';

        let params = new HttpParams();

        if (request.identifierId !== undefined) {
            params = params.append("identifierId", request.identifierId);
        }

        const queryParams = params.toString()

        url += queryParams ? '?' + queryParams : '';

        return this.httpClient.get<IResponse<GetInstancesResponseInstance[]>>(url, { headers: this.headers });
    }

    getInstancesByAppIdAndIdentifierId(request: GetInstancesByAppRequest): Observable<IResponse<GetInstancesResponseInstance[]>> {

        let url = this.route + '/v1/apps/' + request.appIdOrSlug + '/identifiers/' + request.identifierId + '/instances';

        return this.httpClient.get<IResponse<GetInstancesResponseInstance[]>>(url, { headers: this.headers });
    }

    getInstancesByAppSlugAndIdentifierSlug(request: GetInstancesByAppRequest): Observable<IResponse<GetInstancesResponseInstance[]>> {

        let url = this.route + '/v1/apps/slug/' + request.appIdOrSlug + '/identifiers/' + request.identifierId + '/instances';

        return this.httpClient.get<IResponse<GetInstancesResponseInstance[]>>(url, { headers: this.headers });
    }
}