import { SortDirection } from "./sort-direction.enum";

export interface QueryParams {
    pageSize: number;
    pageIndex: number;
    searchTerm: string;
    sortBy: string;
    sortDirection: SortDirection | null;
}