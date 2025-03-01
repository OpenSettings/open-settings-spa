import { GetGroupedAppsResponseAppGroup } from "./get-grouped-apps-response-app-group";
import { UpdateAppResponseTag } from "./update-app-response-tag";

export interface UpdateAppResponse {
    displayName: string;
    clientName: string;
    slug: string;
    group?: GetGroupedAppsResponseAppGroup;
    description: string;
    imageUrl: string;
    wikiUrl: string;
    tags: UpdateAppResponseTag[];
    rowVersion: string;
}