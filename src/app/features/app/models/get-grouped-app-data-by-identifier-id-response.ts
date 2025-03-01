import { GetGroupedAppDataByIdentifierIdResponseConfiguration } from "./get-grouped-app-data-by-identifier-id-response-configuration";
import { GetGroupedAppDataByIdentifierIdResponseIdentifier } from "./get-grouped-app-data-by-identifier-id-response-identifier";
import { GetGroupedAppDataByIdentifierIdResponseInstance } from "./get-grouped-app-data-by-identifier-id-response-instance";
import { GetGroupedAppDataByIdentifierIdResponseSetting } from "./get-grouped-app-data-by-identifier-id-response-setting";

export interface GetGroupedAppDataByIdentifierIdResponse {
    identifier: GetGroupedAppDataByIdentifierIdResponseIdentifier;
    configuration: GetGroupedAppDataByIdentifierIdResponseConfiguration;
    settings: GetGroupedAppDataByIdentifierIdResponseSetting[];
    instances: GetGroupedAppDataByIdentifierIdResponseInstance[];
}