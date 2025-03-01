import { SettingData } from "../../app/models/setting-data.model";

export interface SettingListComponentData {
    slug: string;
    clientName: string;
    clientId: string;
    appId: string;
    settingDataList: SettingData[];
    selectedAppIdentifierId: string;
    selectedAppIdentifierName: string;
}