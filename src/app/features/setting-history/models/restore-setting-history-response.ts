import { RestoreSettingHistoryResponseSetting } from "./restore-setting-history-response-setting";

export interface RestoreSettingHistoryResponse {
    clientId: string;
    setting: RestoreSettingHistoryResponseSetting;
    historyRowVersion: string;
}