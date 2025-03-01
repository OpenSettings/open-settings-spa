import { GetSettingsByIdentifierIdResponseDataSettingClass } from "./get-settings-by-identifier-id-response-data-setting-class";

export interface GetSettingsByIdentifierIdResponseDataSetting {
    id: string;
    computedIdentifier: string;
    version: string;
    dataValidationDisabled: boolean;
    dataRestored: boolean;
    class: GetSettingsByIdentifierIdResponseDataSettingClass
}