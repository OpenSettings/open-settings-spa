import { GetAppResponseClient } from "./get-app-response-client";
import { GetAppResponseGroup } from "./get-app-response-group";
import { GetAppResponseTag } from "./get-app-response-tag";

export interface GetAppResponse {
    id: string;
    displayName: string;
    slug: string;
    description: string;
    imageUrl: string;
    wikiUrl: string;
    client: GetAppResponseClient;
    group: GetAppResponseGroup;
    tags: GetAppResponseTag[];
    rowVersion: string;
}