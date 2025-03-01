import { GetGroupedAppDataResponseSettingClass } from "./get-grouped-app-data-response-setting-class";

export interface GetGroupedAppDataResponseSetting {
    id: string;
    computedIdentifier: string;
    version: string;
    dataValidationDisabled: boolean;
    dataRestored: boolean;
    class: GetGroupedAppDataResponseSettingClass;
    rowVersion: string;
    storeInSeparateFile: boolean;
    ignoreOnFileChange: boolean | null;
    registrationMode: number;
}