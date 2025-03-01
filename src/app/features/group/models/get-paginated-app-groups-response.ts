import { ModelForPaginatedResponseData } from "../../../shared/models/model-for-paginated-response-data";
import { PagingInfo } from "../../../shared/models/paging-info";

export interface GetPaginatedAppGroupsResponse {
    pagingInfo: PagingInfo;
    appGroups: ModelForPaginatedResponseData[];
    minSortOrder: number;
    maxSortOrder: number;
}