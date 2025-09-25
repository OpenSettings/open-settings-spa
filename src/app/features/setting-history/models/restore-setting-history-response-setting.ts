import { RestoreSettingHistoryResponseSettingInfo } from "./restore-setting-history-response-setting-info";

export interface RestoreSettingHistoryResponseSetting {
    computedIdentifier: string;
    restored: RestoreSettingHistoryResponseSettingInfo;
    archived: RestoreSettingHistoryResponseSettingInfo;
}