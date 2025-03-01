import { SetSortOrderPosition } from "../../sponsor/models/set-order-position.enum";

export interface CreateIdentifierRequestBody{
    name: string;
    sortOrder: number;
    setSortOrderPosition?: SetSortOrderPosition;
}