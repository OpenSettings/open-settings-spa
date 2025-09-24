import { SortOrderRange } from "../../../shared/models/sort-order-range.model";
import { GetIdentifiersResponseIdentifier } from "./get-identifiers-response-identifier";

export interface GetIdentifiersResponse{
    sortOrderRange: SortOrderRange;
    identifiers: GetIdentifiersResponseIdentifier[];
}