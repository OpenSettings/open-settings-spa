import { HttpHeaders, HttpClient, HttpParams, HttpErrorResponse } from "@angular/common/http";
import { Injectable, OnDestroy } from "@angular/core";
import { catchError, Observable, of, Subject, takeUntil } from "rxjs";
import { AuthService } from "../../../core/services/auth.service";
import { WindowService } from "../../../core/services/window.service";
import { DragItemSortOrderRequest } from "../../../shared/models/drag-item-sort-order-request";
import { DragItemSortOrderResponse } from "../../../shared/models/drag-item-sort-order-response";
import { GetPaginatedRequest } from "../../../shared/models/get-paginated-request";
import { GetTagsRequest } from "../models/get-tags-request";
import { CreateTagResponse } from "../models/create-tag-response";
import { CreateTagRequest } from "../models/create-tag-request";
import { GetTagRequest } from "../models/get-tag-request";
import { GetTagResponse } from "../models/get-tag-response";
import { UpdateTagRequest } from "../models/update-tag-request";
import { UpdateTagResponse } from "../models/update-tag-response";
import { DeleteTagRequest } from "../models/delete-tag-request";
import { UpdateTagSortOrderRequest } from "../models/update-tag-sort-order-request";
import { SortDirection } from "../../../shared/models/sort-direction.enum";
import { IResponse, IResponseAny } from "../../../shared/models/response";
import { GetTagsResponse } from "../models/get-tags-response";
import { DeleteUnmappedItemsResponse } from "../../../shared/models/delete-unmapped-items-response";
import { ReorderResponse } from "../../../shared/models/reorder-response";
import { GetPaginatedTagsResponse } from "../models/get-paginated-tags-response";
import { UpdateSortOrderResponse } from "../../../shared/models/update-sort-order-response";

@Injectable({
    providedIn: 'root'
})
export class TagsService implements OnDestroy {
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

    getTags(request: GetTagsRequest): Observable<IResponse<GetTagsResponse>> {

        let url = this.route + '/v1/tags';

        let params = new HttpParams();

        if (request.searchTerm) {
            params = params.append("searchTerm", request.searchTerm);
        }

        if (request.hasMappings) {
            params = params.append("hasMappings", request.hasMappings);
        }

        const queryParams = params.toString()

        url += queryParams ? '?' + queryParams : '';

        return this.httpClient.get<IResponse<GetTagsResponse>>(url, { headers: this.headers });
    }

    createTag(request: CreateTagRequest): Observable<IResponse<CreateTagResponse>> {

        const url = this.route + '/v1/tags';

        return this.httpClient.post<IResponse<CreateTagResponse>>(url, request.body, { headers: this.headers });
    }

    getPaginatedTags(request: GetPaginatedRequest): Observable<IResponse<GetPaginatedTagsResponse>> {

        let url = this.route + '/v1/tags/paginated';

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

        if (request.searchBy){
            params = params.append("searchBy", request.searchBy);
        }

        if (request.sortBy) {

            params = params.append("sortBy", request.sortBy);

            if (request.sortDirection === SortDirection.Desc) {
                params = params.append("sortDirection", request.sortDirection)
            }
        }

        const queryParams = params.toString()

        url += queryParams ? '?' + queryParams : '';

        return this.httpClient.get<IResponse<GetPaginatedTagsResponse>>(url, { headers: this.headers });
    }

    deleteUnmappedTags(): Observable<IResponse<DeleteUnmappedItemsResponse>> {

        const url = this.route + '/v1/tags/unmapped';

        return this.httpClient.delete<IResponse<DeleteUnmappedItemsResponse>>(url, { headers: this.headers });
    }

    getTagById(request: GetTagRequest): Observable<IResponse<GetTagResponse>> {

        const url = this.route + '/v1/tags/' + request.tagIdOrSlug;

        return this.httpClient.get<IResponse<GetTagResponse>>(url, { headers: this.headers });
    }

    getTagBySlug(request: GetTagRequest): Observable<IResponse<GetTagResponse>> {

        const url = this.route + '/v1/tags/slug/' + request.tagIdOrSlug;

        return this.httpClient.get<IResponse<GetTagResponse>>(url, { headers: this.headers });
    }
  
    updateTag(request: UpdateTagRequest): Observable<IResponse<UpdateTagResponse>> {

        const url = this.route + '/v1/tags/' + request.tagId;

        return this.httpClient.put<IResponse<UpdateTagResponse>>(url, request.body, { headers: this.headers }).pipe(
            catchError((response: HttpErrorResponse) => {
                if (response.status === 409) {
                    return of(response.error as IResponse<UpdateTagResponse>);
                }

                throw response;
            })
        );
    }

    deleteTag(request: DeleteTagRequest): Observable<IResponseAny> {

        const url = this.route + '/v1/tags/' + request.tagId + '?rowVersion=' + encodeURIComponent(request.rowVersion);

        return this.httpClient.delete<IResponseAny>(url, { headers: this.headers }).pipe(
            catchError((response: HttpErrorResponse) => {
                if(response.status === 409){
                    return of(response.error as IResponse<IResponseAny>);
                }

                throw response;
            })
        );
    }

    updateTagSortOrder(request: UpdateTagSortOrderRequest): Observable<IResponse<UpdateSortOrderResponse>> {

        const url = this.route + '/v1/tags/' + request.id + '/sort-order?ascent=' + request.ascent + '&rowVersion=' + encodeURIComponent(request.rowVersion);

        return this.httpClient.post<IResponse<UpdateSortOrderResponse>>(url, null, { headers: this.headers }).pipe(
            catchError((response: HttpErrorResponse) => {
                if(response.status === 409){
                    return of(response.error as IResponse<UpdateSortOrderResponse>);
                }

                throw response;
            })
        );
    }

    dragTag(request: DragItemSortOrderRequest): Observable<IResponse<DragItemSortOrderResponse>> {

        const url = this.route + '/v1/tags/' + request.sourceId + '/drag/' + request.targetId + '?ascent=' + request.ascent + '&sourceRowVersion=' + encodeURIComponent(request.sourceRowVersion);

        return this.httpClient.post<IResponse<DragItemSortOrderResponse>>(url, null, { headers: this.headers }).pipe(
            catchError((response: HttpErrorResponse) => {
                if(response.status === 409){
                    return of(response.error as IResponse<DragItemSortOrderResponse>);
                }

                throw response;
            })
        );
    }

    reorder() {

        const url = this.route + '/v1/tags/reorder';

        return this.httpClient.post<IResponse<ReorderResponse>>(url, null, { headers: this.headers }).pipe(
            catchError((response: HttpErrorResponse) => {
                if(response.status === 409){
                    return of(response.error as IResponse<ReorderResponse>);
                }

                throw response;
            })
        );
    }
}