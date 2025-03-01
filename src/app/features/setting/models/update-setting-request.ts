import { UpdateSettingRequestBody } from "./update-setting-request-body";

export interface UpdateSettingRequest {
    settingId: string;
    body: UpdateSettingRequestBody;
}