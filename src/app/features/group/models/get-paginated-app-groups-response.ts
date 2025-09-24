import { ModelForPaginatedResponseData } from "../../../shared/models/model-for-paginated-response-data";
import { PagingInfo } from "../../../shared/models/paging-info";
import { SortOrderRange } from "../../../shared/models/sort-order-range.model";

export interface GetPaginatedAppGroupsResponse {
    sortOrderRange: SortOrderRange;
    pagingInfo: PagingInfo;
    appGroups: ModelForPaginatedResponseData[];
}