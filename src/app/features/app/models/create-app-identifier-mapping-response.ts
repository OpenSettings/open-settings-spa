import { CreateAppIdentifierMappingResponseIdentifier } from "./create-app-identifier-mapping-response-identifier";

export interface CreateAppIdentifierMappingResponse {
    sortOrder: number;
    appId: string;
    identifier: CreateAppIdentifierMappingResponseIdentifier;
}