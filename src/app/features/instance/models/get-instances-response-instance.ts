import { DataAccessType } from "../../../shared/models/data-access-type";
import { ReloadStrategy } from "../../../shared/models/reload-strategy";
import { ServiceType } from "../../../shared/models/service-type";

export interface GetInstancesResponseInstance {
    id: string;
    dynamicId: string;
    identifierId: string;
    name: string;
    urls: string[];
    isActive: boolean;
    machineName: string;
    reloadStrategies: ReloadStrategy[];
    serviceType: ServiceType;
    dataAccessType?: DataAccessType;
    version: string;
    createdOn: Date;
    updatedOn?: Date;
}