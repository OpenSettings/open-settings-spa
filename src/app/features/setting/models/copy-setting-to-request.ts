import { CopySettingToRequestBody } from "./copy-setting-to-request-body";

export interface CopySettingToRequest {
    settingId: string;
    body: CopySettingToRequestBody;
}