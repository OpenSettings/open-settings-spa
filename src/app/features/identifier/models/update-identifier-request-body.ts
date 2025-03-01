import { SetSortOrderPosition } from "../../sponsor/models/set-order-position.enum";

export interface UpdateIdentifierRequestBody {
    name: string;
    sortOrder: number; 
    setSortOrderPosition?: SetSortOrderPosition;
    rowVersion: string;
}