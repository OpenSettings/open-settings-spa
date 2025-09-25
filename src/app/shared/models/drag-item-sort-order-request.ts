import { DragItemSortOrderRequestBody } from "./drag-item-sort-order-request-body";

export interface DragItemSortOrderRequest{
    sourceId: string;
    targetId: string;
    body: DragItemSortOrderRequestBody
}