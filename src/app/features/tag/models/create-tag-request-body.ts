import { SetSortOrderPosition } from "../../sponsor/models/set-order-position.enum";

export interface CreateTagRequestBody {
    name: string;
    sortOrder: number;
    setSortOrderPosition?: SetSortOrderPosition;
}