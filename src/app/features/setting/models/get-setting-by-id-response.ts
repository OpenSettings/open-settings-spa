import { GetSettingByIdResponseClass } from "./get-setting-by-id-response-class";

export interface GetSettingByIdResponse {
    data: string;
    dataRestored: boolean;
    identifierId: string;
    registrationMode: number;
    dataValidationDisabled: boolean;
    storeInSeparateFile: boolean;
    ignoreOnFileChange: boolean | null;
    computedIdentifier: string;
    version: string;
    class: GetSettingByIdResponseClass;
    rowVersion: string;
}