import { SettingData } from "../../app/models/setting-data.model";

export interface SettingListComponentData {
    appSlug: string;
    clientName: string;
    clientId: string;
    appId: string;
    settingDataList: SettingData[];
    selectedAppIdentifierId: string;
    selectedIdentifierSlug: string;
    selectedAppIdentifierName: string;
}