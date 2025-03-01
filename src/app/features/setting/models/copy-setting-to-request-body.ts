import { CopySettingToRequestBodyIdentifier } from "./copy-setting-to-request-body-identifier";

export interface CopySettingToRequestBody {
    targetAppId: string;
    identifier: CopySettingToRequestBodyIdentifier;
}