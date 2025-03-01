import { DataAccessType } from "../../../shared/models/data-access-type";
import { ReloadStrategy } from "../../../shared/models/reload-strategy";
import { ServiceType } from "../../../shared/models/service-type";

export interface GetGroupedAppDataResponseInstance{
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
    dataAccessType?: DataAccessType
    createdOn: Date;
    updatedOn?: Date; 
}