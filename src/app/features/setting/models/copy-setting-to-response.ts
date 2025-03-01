import { CopySettingToResponseIdentifier } from "./copy-setting-to-response-identifier";
import { CopySettingToResponseSetting } from "./copy-setting-to-response-setting";

export interface CopySettingToResponse {
    clientId: string;
    appSlug: string;
    identifier: CopySettingToResponseIdentifier;
    setting: CopySettingToResponseSetting
}