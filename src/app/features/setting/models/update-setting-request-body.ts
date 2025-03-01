import { UpdateSettingRequestBodyClass } from "./update-setting-request-body-class";

export interface UpdateSettingRequestBody {
    computedIdentifier: string;
    dataValidationDisabled: boolean;
    rowVersion: string;
    class: UpdateSettingRequestBodyClass;
    storeInSeparateFile: boolean;
    ignoreOnFileChange: boolean | null;
    registrationMode: number;
}