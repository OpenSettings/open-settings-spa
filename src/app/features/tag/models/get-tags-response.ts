import { SortOrderRange } from "../../../shared/models/sort-order-range.model";
import { GetTagsResponseTag } from "./get-tags-response-tag";

export interface GetAppTagsResponse {
    sortOrderRange: SortOrderRange;
    tags: GetTagsResponseTag[];
}