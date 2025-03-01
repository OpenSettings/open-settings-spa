import { UpdateSortOrderResponseNeighbour } from "./update-sort-order-response-neighbour";
import { UpdateSortOrderResponseSource } from "./update-sort-order-response-source";

export interface UpdateSortOrderResponse{
    source: UpdateSortOrderResponseSource;
    neighbour: UpdateSortOrderResponseNeighbour;
    rowVersion: string;
}