import { SortOrderRange } from "../../../shared/models/sort-order-range.model";
import { GetAppGroupsResponseGroup } from "./get-app-groups-response-group";

export interface GetAppGroupsResponse {
    sortOrderRange: SortOrderRange;
    appGroups: GetAppGroupsResponseGroup[];
}