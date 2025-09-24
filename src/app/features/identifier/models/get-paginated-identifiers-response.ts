import { ModelForPaginatedResponseData } from "../../../shared/models/model-for-paginated-response-data";
import { PagingInfo } from "../../../shared/models/paging-info";
import { SortOrderRange } from "../../../shared/models/sort-order-range.model";

export interface GetPaginatedIdentifiersResponse {
    sortOrderRange: SortOrderRange;
    pagingInfo: PagingInfo;
    identifiers: ModelForPaginatedResponseData[];
}