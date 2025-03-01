export interface PagingInfo {
    pageIndex: number;
    pageSize: number;
    itemCount: number;
    pageCount: number;
    hasPrevious: boolean;
    hasNext: boolean;
}