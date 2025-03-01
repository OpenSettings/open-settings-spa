import { DataAccessType } from "../../../shared/models/data-access-type";
import { ReloadStrategy } from "../../../shared/models/reload-strategy";
import { ServiceType } from "../../../shared/models/service-type";

export interface GetInstancesDataResponseData{
    id: string;
    urls: string[];
    isActive: boolean;
    ipAddress: string;
    machineName: string;
    environment: string;
    reloadStrategies: ReloadStrategy[];
    serviceType: ServiceType;
    dataAccessType?: DataAccessType;
    version: string;
    createdOn: Date,
    updatedOn?: Date
}