import { MoveDirection } from "./move-direction.model";

export interface UpdateSortOrderRequestBody {
    direction: MoveDirection;
    rowVersion: string;
}