import { CreateAppRequestBodyClient } from "./create-app-request-body-client";
import { CreateAppRequestBodyGroup } from "./create-app-request-body-group";
import { CreateAppRequestBodyTag } from "./create-app-request-body-tag";

export interface CreateAppRequestBody {
    displayName: string;
    slug: string;
    client: CreateAppRequestBodyClient;
    group: CreateAppRequestBodyGroup | null;
    description: string;
    imageUrl: string;
    wikiUrl: string;
    tags: CreateAppRequestBodyTag[];
}