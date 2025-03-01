import { ModelForPaginatedResponseData } from "../../../shared/models/model-for-paginated-response-data";
import { PagingInfo } from "../../../shared/models/paging-info";

export interface GetPaginatedTagsResponse {
    pagingInfo: PagingInfo;
    tags: ModelForPaginatedResponseData[];
    minSortOrder: number;
    maxSortOrder: number;
}