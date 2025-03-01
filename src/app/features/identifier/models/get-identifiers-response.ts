import { GetIdentifiersResponseIdentifier } from "./get-identifiers-response-identifier";

export interface GetIdentifiersResponse{
    minSortOrder: number;
    maxSortOrder: number;
    identifiers: GetIdentifiersResponseIdentifier[];
}