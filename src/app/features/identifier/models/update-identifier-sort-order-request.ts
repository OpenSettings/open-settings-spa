import { UpdateSortOrderRequestBody } from "../../../shared/models/update-sort-order-request-body";

export interface UpdateIdentifierSortOrderRequest {
    identifierId: string;
    body: UpdateSortOrderRequestBody;
}