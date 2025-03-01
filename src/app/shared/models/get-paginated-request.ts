import { SortDirection } from './sort-direction.enum'

export interface GetPaginatedRequest {
    searchTerm?: string;
    searchBy?: string;
    pageIndex?: number;
    pageSize?: number;
    sortBy?: string
    sortDirection?: SortDirection | null;
}