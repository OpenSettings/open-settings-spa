import { InstanceData } from "../../app/models/instance-data.model";

export interface InstanceListComponentData {
    clientId: string;
    identifierId: string;
    instances: InstanceData[];
}