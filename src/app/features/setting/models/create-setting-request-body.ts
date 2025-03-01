import { CreateSettingRequestBodyClass } from "./create-setting-request-body-class";

export interface CreateSettingRequestBody {
    appId: string;
    data: string;
    computedIdentifier: string;
    identifierId: string;
    class: CreateSettingRequestBodyClass;
    storeInSeparateFile: boolean;
    ignoreOnFileChange: boolean | null;
    registrationMode: number;
}