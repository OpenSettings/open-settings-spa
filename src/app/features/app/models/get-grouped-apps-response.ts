import { GetGroupedAppsResponseApp } from "./get-grouped-apps-response-app";

export interface GetGroupedAppsResponse {
    groupNameToApps: { [key: string]: GetGroupedAppsResponseApp[] };
    groupCount: number;
    appCount: number;
}