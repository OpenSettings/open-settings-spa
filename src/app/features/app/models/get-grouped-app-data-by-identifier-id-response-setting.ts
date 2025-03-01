import { GetGroupedAppDataByIdentifierIdResponseSettingClass } from "./get-grouped-app-data-by-identifier-id-response-setting-class";

export interface GetGroupedAppDataByIdentifierIdResponseSetting {
    id: string;
    computedIdentifier: string;
    version: string;
    dataValidationDisabled: boolean;
    dataRestored: boolean;
    class: GetGroupedAppDataByIdentifierIdResponseSettingClass;
    rowVersion: string;
    storeInSeparateFile: boolean;
    ignoreOnFileChange: boolean;
    registrationMode: number;
}