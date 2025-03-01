import { PagingInfo } from "./paging-info";

export interface GetPaginatedResponse<T> {
    data: T;
    pagingInfo: PagingInfo;
}