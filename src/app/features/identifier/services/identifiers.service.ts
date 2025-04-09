import { HttpHeaders, HttpClient, HttpParams, HttpErrorResponse } from "@angular/common/http";
import { Injectable, OnDestroy } from "@angular/core";
import { Observable, Subject, catchError, of, takeUntil } from "rxjs";
import { AuthService } from "../../../core/services/auth.service";
import { WindowService } from "../../../core/services/window.service";
import { DragItemSortOrderRequest } from "../../../shared/models/drag-item-sort-order-request";
import { DragItemSortOrderResponse } from "../../../shared/models/drag-item-sort-order-response";
import { GetPaginatedRequest } from "../../../shared/models/get-paginated-request";
import { IResponse, IResponseAny } from "../../../shared/models/response";
import { DeleteUnmappedItemsResponse } from "../../../shared/models/delete-unmapped-items-response";
import { ReorderResponse } from "../../../shared/models/reorder-response";
import { UpdateSortOrderResponse } from "../../../shared/models/update-sort-order-response";
import { CreateIdentifierRequest } from "../models/create-identifier-request";
import { CreateIdentifierResponse } from "../models/create-identifier-response";
import { DeleteIdentifierRequest } from "../models/delete-identifier-request";
import { DeleteIdentifierResponse } from "../models/delete-identifier-response";
import { GetPaginatedIdentifiersResponse } from "../models/get-paginated-identifiers-response";
import { GetIdentifierRequest } from "../models/get-identifier-request";
import { GetIdentifierResponse } from "../models/get-identifier-response";
import { GetIdentifiersRequest } from "../models/get-identifiers-request";
import { UpdateIdentifierRequest } from "../models/update-identifier-request";
import { UpdateIdentifierResponse } from "../models/update-identifier-response";
import { UpdateIdentifierOrderRequest } from "../models/update-identifier-sort-order-request";
import { GetIdentifiersResponse } from "../models/get-identifiers-response";


@Injectable({
    providedIn: 'root'
})
export class IdentifiersService implements OnDestroy {
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

    getPaginatedIdentifiers(request: GetPaginatedRequest): Observable<IResponse<GetPaginatedIdentifiersResponse>> {

        let url = this.route + '/v1/identifiers/paginated';

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

        if (request.searchBy) {
            params = params.append("searchBy", request.searchBy);
        }

        if (request.sortBy) {

            params = params.append("sortBy", request.sortBy);

            if (request.sortDirection) {
                params = params.append("sortDirection", request.sortDirection)
            }
        }

        const queryParams = params.toString()

        url += queryParams ? '?' + queryParams : '';

        return this.httpClient.get<IResponse<GetPaginatedIdentifiersResponse>>(url, { headers: this.headers });
    }

    deleteUnmappedIdentifiers(): Observable<IResponse<DeleteUnmappedItemsResponse>> {

        const url = this.route + '/v1/identifiers/unmapped';

        return this.httpClient.delete<IResponse<DeleteUnmappedItemsResponse>>(url, { headers: this.headers });
    }

    getIdentifiers(request: GetIdentifiersRequest): Observable<IResponse<GetIdentifiersResponse>> {

        let url = this.route + '/v1/identifiers';

        let params = new HttpParams();

        if (request.searchTerm) {
            params = params.append("searchTerm", request.searchTerm);
        }

        if (request.appId) {
            params = params.append('appId', request.appId);

            if (request.isAppMapped) {
                params = params.append('isAppMapped', request.isAppMapped);
            }
        }

        const queryParams = params.toString()

        url += queryParams ? '?' + queryParams : '';

        return this.httpClient.get<IResponse<GetIdentifiersResponse>>(url, { headers: this.headers });
    }

    createIdentifier(request: CreateIdentifierRequest): Observable<IResponse<CreateIdentifierResponse>> {

        const url = this.route + '/v1/identifiers';

        return this.httpClient.post<IResponse<CreateIdentifierResponse>>(url, request.body, { headers: this.headers });
    }

    getIdentifierById(request: GetIdentifierRequest): Observable<IResponse<GetIdentifierResponse>> {

        const url = this.route + '/v1/identifiers/' + request.identifierIdOrSlug;

        return this.httpClient.get<IResponse<GetIdentifierResponse>>(url, { headers: this.headers });
    }

    getIdentifierBySlug(request: GetIdentifierRequest): Observable<IResponse<GetIdentifierResponse>> {

        const url = this.route + '/v1/identifiers/slug/' + request.identifierIdOrSlug;

        return this.httpClient.get<IResponse<GetIdentifierResponse>>(url, { headers: this.headers });
    }

    updateIdentifier(request: UpdateIdentifierRequest): Observable<IResponse<UpdateIdentifierResponse>> {

        const url = this.route + '/v1/identifiers/' + request.identifierId;

        return this.httpClient.put<IResponse<UpdateIdentifierResponse>>(url, request.body, { headers: this.headers }).pipe(
            catchError((response: HttpErrorResponse) => {
                if (response.status === 409) {
                    return of(response.error as IResponse<UpdateIdentifierResponse>);
                }

                throw response;
            })
        );
    }

    deleteIdentifier(request: DeleteIdentifierRequest): Observable<IResponseAny> {

        const url = this.route + '/v1/identifiers/' + request.identifierId + '?rowVersion=' + encodeURIComponent(request.rowVersion);

        return this.httpClient.delete<IResponse<DeleteIdentifierResponse>>(url, { headers: this.headers }).pipe(
            catchError((response: HttpErrorResponse) => {
                if (response.status === 409) {
                    return of(response.error as IResponseAny);
                }

                throw response;
            })
        );
    }

    updateIdentifierSortOrder(request: UpdateIdentifierOrderRequest): Observable<IResponse<UpdateSortOrderResponse>> {

        const url = this.route + '/v1/identifiers/' + request.identifierId + '/sort-order?ascent=' + request.ascent + '&rowVersion=' + encodeURIComponent(request.rowVersion);

        return this.httpClient.post<IResponse<UpdateSortOrderResponse>>(url, null, { headers: this.headers }).pipe(
            catchError((response: HttpErrorResponse) => {
                if (response.status === 409) {
                    return of(response.error as IResponse<UpdateSortOrderResponse>);
                }

                throw response;
            })
        );
    }

    dragIdentifier(request: DragItemSortOrderRequest): Observable<IResponse<DragItemSortOrderResponse>> {

        const url = this.route + '/v1/identifiers/' + request.sourceId + '/drag/' + request.targetId + '?ascent=' + request.ascent + '&sourceRowVersion=' + encodeURIComponent(request.sourceRowVersion);

        return this.httpClient.post<IResponse<DragItemSortOrderResponse>>(url, null, { headers: this.headers }).pipe(
            catchError((response: HttpErrorResponse) => {
                if (response.status === 409) {
                    return of(response.error as IResponse<DragItemSortOrderResponse>);
                }

                throw response;
            })
        );
    }

    reorder(): Observable<IResponse<ReorderResponse>> {

        const url = this.route + '/v1/identifiers/reorder';

        return this.httpClient.post<IResponse<ReorderResponse>>(url, null, { headers: this.headers }).pipe(
            catchError((response: HttpErrorResponse) => {
                if (response.status === 409) {
                    return of(response.error as IResponse<ReorderResponse>);
                }

                throw response;
            })
        );
    }
}