import { ReloadStrategy } from "../../../shared/models/reload-strategy";
import { ServiceType } from "../../../shared/models/service-type";

export interface GetGroupedAppDataByIdentifierIdResponseInstance {
    id: string;
    dynamicId: string;
    name: string;
    version: string;
    urls: string[];
    isActive: boolean;
    ipAddress: string;
    machineName: string;
    environment: string;
    reloadStrategies: ReloadStrategy[];
    serviceType: ServiceType;
    createdOn: Date;
    updatedOn?: Date;
    rowVersion: string;
}