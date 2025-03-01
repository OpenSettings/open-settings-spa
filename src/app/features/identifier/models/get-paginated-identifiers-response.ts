import { ModelForPaginatedResponseData } from "../../../shared/models/model-for-paginated-response-data";
import { PagingInfo } from "../../../shared/models/paging-info";

export interface GetPaginatedIdentifiersResponse {
    pagingInfo: PagingInfo;
    identifiers: ModelForPaginatedResponseData[];
    minSortOrder: number;
    maxSortOrder: number;
}