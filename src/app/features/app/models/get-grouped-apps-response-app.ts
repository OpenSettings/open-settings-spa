import { GetGroupedAppsResponseAppClient } from "./get-grouped-apps-response-app-client";
import { GetGroupedAppsResponseAppGroup } from "./get-grouped-apps-response-app-group";
import { GetGroupedAppsResponseAppTag } from "./get-grouped-apps-response-app-tag";

export interface GetGroupedAppsResponseApp {
    id: string;
    displayName: string;
    slug: string;
    description: string;
    imageUrl: string;
    wikiUrl: string;
    client: GetGroupedAppsResponseAppClient;
    group: GetGroupedAppsResponseAppGroup | null;
    tags: GetGroupedAppsResponseAppTag[];
    rowVersion: string;
}