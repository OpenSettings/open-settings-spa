import { SetSortOrderPosition } from "../../sponsor/models/set-order-position.enum";

export interface CreateAppGroupRequestBody {
    name: string;
    sortOrder: number;
    setSortOrderPosition?: SetSortOrderPosition;
}