import { HttpHeaders, HttpClient, HttpParams, HttpErrorResponse } from "@angular/common/http";
import { Injectable, OnDestroy } from "@angular/core";
import { AuthService } from "../../../core/services/auth.service";
import { WindowService } from "../../../core/services/window.service";
import { GetAppGroupsRequest } from "../models/get-app-groups-request";
import { catchError, Observable, of, Subject, takeUntil } from "rxjs";
import { CreateAppGroupRequest } from "../models/create-app-group-request";
import { CreateAppGroupResponse } from "../models/create-app-group-response";
import { GetPaginatedRequest } from "../../../shared/models/get-paginated-request";
import { UpdateAppGroupRequest } from "../models/update-app-group-request";
import { DeleteAppGroupRequest } from "../models/delete-app-group-request";
import { UpdateAppGroupOrderRequest } from "../models/update-app-group-order-request";
import { DragItemSortOrderRequest } from "../../../shared/models/drag-item-sort-order-request";
import { DragItemSortOrderResponse } from "../../../shared/models/drag-item-sort-order-response";
import { IResponse, IResponseAny } from "../../../shared/models/response";
import { DeleteUnmappedItemsResponse } from "../../../shared/models/delete-unmapped-items-response";
import { GetAppGroupsResponse } from "../models/get-app-groups-response";
import { GetPaginatedAppGroupsResponse } from "../models/get-paginated-app-groups-response";
import { UpdateSortOrderResponse } from "../../../shared/models/update-sort-order-response";
import { GetAppGroupResponse } from "../models/get-app-group-response";
import { GetAppGroupRequest } from "../models/get-app-group-request";
import { UpdateAppGroupResponse } from "../models/update-app-group-response";
import { OpenSettingsDefaults } from "../../../shared/open-settings-defaults";

@Injectable({
    providedIn: 'root'
})
export class AppGroupService implements OnDestroy {
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

    getPaginatedAppGroups(request: GetPaginatedRequest): Observable<IResponse<GetPaginatedAppGroupsResponse>> {

        let url = this.route + OpenSettingsDefaults.Routes.V1.AppGroupsEndpoints.getPaginatedAppGroups();

        let params = new HttpParams();

        if (request.pageIndex) {
            params = params.append("page", request.pageIndex);
        }

        if (request.pageSize) {
            params = params.append("size", request.pageSize);
        }

        if (request.searchTerm) {
            params = params.append("searchTerm", request.searchTerm);
        }

        if (request.sortBy) {

            params = params.append("sortBy", request.sortBy);

            if (request.sortDirection) {
                params = params.append("sortDirection", request.sortDirection)
            }
        }

        return this.httpClient.get<IResponse<GetPaginatedAppGroupsResponse>>(url, { headers: this.headers, params });
    }

    deleteUnmappedAppGroups(): Observable<IResponse<DeleteUnmappedItemsResponse>> {

        const url = this.route + OpenSettingsDefaults.Routes.V1.AppGroupsEndpoints.deleteUnmappedAppGroups();

        return this.httpClient.delete<IResponse<DeleteUnmappedItemsResponse>>(url, { headers: this.headers });
    }

    getAppGroups(request: GetAppGroupsRequest): Observable<IResponse<GetAppGroupsResponse>> {

        let url = this.route + OpenSettingsDefaults.Routes.V1.AppGroupsEndpoints.getAppGroups();

        let params = new HttpParams();

        if (request.searchTerm) {
            params = params.append("searchTerm", request.searchTerm);
        }

        if (request.hasMappings) {
            params = params.append("hasMappings", request.hasMappings);
        }

        return this.httpClient.get<IResponse<GetAppGroupsResponse>>(url, { headers: this.headers, params });
    }

    createAppGroup(request: CreateAppGroupRequest): Observable<IResponse<CreateAppGroupResponse>> {

        const url = this.route + OpenSettingsDefaults.Routes.V1.AppGroupsEndpoints.createAppGroup();

        return this.httpClient.post<IResponse<CreateAppGroupResponse>>(url, request.body, { headers: this.headers });
    }

    getAppGroupById(request: GetAppGroupRequest): Observable<IResponse<GetAppGroupResponse>> {

        const url = this.route + OpenSettingsDefaults.Routes.V1.AppGroupsEndpoints.getAppGroupById(request.groupIdOrSlug);

        return this.httpClient.get<IResponse<GetAppGroupResponse>>(url, { headers: this.headers });
    }

    getAppGroupBySlug(request: GetAppGroupRequest): Observable<IResponse<GetAppGroupResponse>> {

        const url = this.route + OpenSettingsDefaults.Routes.V1.AppGroupsEndpoints.getAppGroupBySlug(request.groupIdOrSlug);

        return this.httpClient.get<IResponse<GetAppGroupResponse>>(url, { headers: this.headers });
    }

    deleteAppGroup(request: DeleteAppGroupRequest): Observable<IResponseAny> {

        let url = this.route + OpenSettingsDefaults.Routes.V1.AppGroupsEndpoints.deleteAppGroup(request.id);

        let params = new HttpParams().append('rowVersion', request.rowVersion);

        return this.httpClient.delete<IResponseAny>(url, { headers: this.headers, params }).pipe(
            catchError((response: HttpErrorResponse) => {
                if (response.status === 409) {
                    return of(response.error as IResponseAny);
                }

                throw response;
            })
        );
    }

    updateAppGroupSortOrder(request: UpdateAppGroupOrderRequest): Observable<IResponse<UpdateSortOrderResponse>> {

        const url = this.route + OpenSettingsDefaults.Routes.V1.AppGroupsEndpoints.updateAppGroupSortOrder(request.id);

        return this.httpClient.post<IResponse<UpdateSortOrderResponse>>(url, request.body, { headers: this.headers }).pipe(
            catchError((response: HttpErrorResponse) => {
                if (response.status === 409) {
                    return of(response.error as IResponse<UpdateSortOrderResponse>);
                }

                throw response;
            })
        );
    }

    dragAppGroup(request: DragItemSortOrderRequest): Observable<IResponse<DragItemSortOrderResponse>> {

        const url = this.route + OpenSettingsDefaults.Routes.V1.AppGroupsEndpoints.dragAppGroup(request.sourceId, request.targetId);

        return this.httpClient.post<IResponse<DragItemSortOrderResponse>>(url, request.body, { headers: this.headers }).pipe(
            catchError((response: HttpErrorResponse) => {
                if (response.status === 409) {
                    return of(response.error as IResponse<DragItemSortOrderResponse>);
                }

                throw response;
            })
        );
    }

    updateAppGroup(request: UpdateAppGroupRequest): Observable<IResponse<UpdateAppGroupResponse>> {

        const url = this.route + OpenSettingsDefaults.Routes.V1.AppGroupsEndpoints.updateAppGroup(request.groupId);

        return this.httpClient.put<IResponse<UpdateAppGroupResponse>>(url, request.body, { headers: this.headers }).pipe(
            catchError((response: HttpErrorResponse) => {
                if (response.status === 409) {
                    return of(response.error as IResponse<UpdateAppGroupResponse>);
                }

                throw response;
            })
        );
    }

    reorderAppGroup() {

        const url = this.route + OpenSettingsDefaults.Routes.V1.AppGroupsEndpoints.reorderAppGroup();

        return this.httpClient.post<IResponseAny>(url, null, { headers: this.headers }).pipe(
            catchError((response: HttpErrorResponse) => {
                if (response.status === 409) {
                    return of(response.error as IResponse<DragItemSortOrderResponse>);
                }

                throw response;
            })
        );
    }
}