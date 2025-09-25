import { RestoreSettingHistoryResponseSetting } from "./restore-setting-history-response-setting";

export interface RestoreSettingHistoryResponse {
    clientId: string;
    identifierName: string;
    setting: RestoreSettingHistoryResponseSetting;
}