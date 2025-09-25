import { MoveDirection } from "./move-direction.model";

export interface DragItemSortOrderRequestBody {
    direction: MoveDirection;
    sourceRowVersion: string;
}