import { SetSortOrderPosition } from "../../sponsor/models/set-order-position.enum";
import { CreateAppIdentifierMappingRequestBodyIdentifier } from "./create-app-identifier-mapping-request-body-identifier";

export interface CreateAppIdentifierMappingRequestBody {
    setSortOrderPosition: SetSortOrderPosition;
    identifier: CreateAppIdentifierMappingRequestBodyIdentifier;
}