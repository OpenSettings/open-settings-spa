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

@Injectable({
    providedIn: 'root'
})
export class GroupsService implements OnDestroy {
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

    getPaginatedGroups(request: GetPaginatedRequest): Observable<IResponse<GetPaginatedAppGroupsResponse>> {

        let url = this.route + '/v1/app-groups/paginated';

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

        const queryParams = params.toString()

        url += queryParams ? '?' + queryParams : '';

        return this.httpClient.get<IResponse<GetPaginatedAppGroupsResponse>>(url, { headers: this.headers });
    }

    deleteUnmappedGroups(): Observable<IResponse<DeleteUnmappedItemsResponse>> {

        const url = this.route + '/v1/app-groups/unmapped';

        return this.httpClient.delete<IResponse<DeleteUnmappedItemsResponse>>(url, { headers: this.headers });
    }

    getGroups(request: GetAppGroupsRequest): Observable<IResponse<GetAppGroupsResponse>> {

        let url = this.route + '/v1/app-groups';

        let params = new HttpParams();

        if (request.searchTerm) {
            params = params.append("searchTerm", request.searchTerm);
        }

        if (request.hasMappings) {
            params = params.append("hasMappings", request.hasMappings);
        }

        const queryParams = params.toString()

        url += queryParams ? '?' + queryParams : '';

        return this.httpClient.get<IResponse<GetAppGroupsResponse>>(url, { headers: this.headers });
    }

    createGroup(request: CreateAppGroupRequest): Observable<IResponse<CreateAppGroupResponse>> {

        const url = this.route + '/v1/app-groups';

        return this.httpClient.post<IResponse<CreateAppGroupResponse>>(url, request.body, { headers: this.headers });
    }

    getGroupById(request: GetAppGroupRequest): Observable<IResponse<GetAppGroupResponse>> {

        const url = this.route + '/v1/app-groups/' + request.groupIdOrSlug;

        return this.httpClient.get<IResponse<GetAppGroupResponse>>(url, { headers: this.headers });
    }

    getGroupBySlug(request: GetAppGroupRequest): Observable<IResponse<GetAppGroupResponse>> {

        const url = this.route + '/v1/app-groups/slug/' + request.groupIdOrSlug;

        return this.httpClient.get<IResponse<GetAppGroupResponse>>(url, { headers: this.headers });
    }

    deleteGroup(request: DeleteAppGroupRequest): Observable<IResponseAny> {

        const url = this.route + '/v1/app-groups/' + request.id + '?rowVersion=' + encodeURIComponent(request.rowVersion);

        return this.httpClient.delete<IResponseAny>(url, { headers: this.headers }).pipe(
            catchError((response: HttpErrorResponse) => {
                if (response.status === 409) {
                    return of(response.error as IResponseAny);
                }

                throw response;
            })
        );
    }

    updateGroupSortOrder(request: UpdateAppGroupOrderRequest): Observable<IResponse<UpdateSortOrderResponse>> {

        const url = this.route + '/v1/app-groups/' + request.id + '/sort-order?ascent=' + request.ascent + '&rowVersion=' + encodeURIComponent(request.rowVersion);

        return this.httpClient.post<IResponse<UpdateSortOrderResponse>>(url, null, { headers: this.headers }).pipe(
            catchError((response: HttpErrorResponse) => {
                if (response.status === 409) {
                    return of(response.error as IResponse<UpdateSortOrderResponse>);
                }

                throw response;
            })
        );
    }

    dragGroup(request: DragItemSortOrderRequest): Observable<IResponse<DragItemSortOrderResponse>> {

        const url = this.route + '/v1/app-groups/' + request.sourceId + '/drag/' + request.targetId + '?ascent=' + request.ascent + '&sourceRowVersion=' + encodeURIComponent(request.sourceRowVersion);

        return this.httpClient.post<IResponse<DragItemSortOrderResponse>>(url, null, { headers: this.headers }).pipe(
            catchError((response: HttpErrorResponse) => {
                if (response.status === 409) {
                    return of(response.error as IResponse<DragItemSortOrderResponse>);
                }

                throw response;
            })
        );
    }

    updateGroup(request: UpdateAppGroupRequest): Observable<IResponse<UpdateAppGroupResponse>> {

        const url = this.route + '/v1/app-groups/' + request.groupId;

        return this.httpClient.put<IResponse<UpdateAppGroupResponse>>(url, request.body, { headers: this.headers }).pipe(
            catchError((response: HttpErrorResponse) => {
                if (response.status === 409) {
                    return of(response.error as IResponse<UpdateAppGroupResponse>);
                }

                throw response;
            })
        );
    }

    reorder() {

        const url = this.route + '/v1/app-groups/reorder';

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