import { PatchConfigurationRequestBody } from "./patch-configuration-request-body";

export interface PatchConfigurationRequest {
    appId: string;
    identifierId: string;
    body: PatchConfigurationRequestBody;
}