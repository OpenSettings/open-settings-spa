import { GetGroupedAppDataResponseInstance } from "./get-grouped-app-data-response-instance";
import { GetGroupedAppDataResponseSetting } from "./get-grouped-app-data-response-setting";
import { GetGroupedAppDataResponseIdentifier } from "./get-grouped-app-data-response-identifier";
import { GetGroupedAppDataResponseIdentifierInfo } from "./get-grouped-app-data-response-identifier-info";
import { GetGroupedAppDataResponseConfiguration } from "./get-grouped-app-data-response-configuration";

export interface GetGroupedAppDataResponse {
    identifierInfo: GetGroupedAppDataResponseIdentifierInfo;
    identifierIdToIdentifier: { [key: string]: GetGroupedAppDataResponseIdentifier };
    identifierIdToConfiguration: { [key: string]: GetGroupedAppDataResponseConfiguration };
    identifierIdToSettings: { [key: string]: GetGroupedAppDataResponseSetting[] };
    identifierIdToInstances: { [key: string]: GetGroupedAppDataResponseInstance[] };
}