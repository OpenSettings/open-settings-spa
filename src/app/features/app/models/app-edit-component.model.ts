import { GetGroupedAppsResponseAppGroup } from "./get-grouped-apps-response-app-group";
import { GetGroupedAppsResponseAppTag } from "./get-grouped-apps-response-app-tag";

export interface AppEditComponentModel {
    displayName: string;
    clientName: string;
    appId: string;
    slug: string;
    clientId: string;
    group: GetGroupedAppsResponseAppGroup | null;
    description: string;
    imageUrl: string;
    wikiUrl: string;
    tags: GetGroupedAppsResponseAppTag[];
    rowVersion: string;
}