import { UpdateSettingDataRequestBody } from "../../app/models/update-setting-data-request-body";

export interface UpdateSettingDataRequest {
    settingId: string;
    body: UpdateSettingDataRequestBody;
}