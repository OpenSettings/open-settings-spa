export interface DragItemSortOrderRequest{
    sourceId: string;
    targetId: string;
    ascent: boolean;
    sourceRowVersion: string;
}