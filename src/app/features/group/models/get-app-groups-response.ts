import { GetAppGroupsResponseGroup } from "./get-app-groups-response-group";

export interface GetAppGroupsResponse {
    minSortOrder: number;
    maxSortOrder: number;
    appGroups: GetAppGroupsResponseGroup[];
}