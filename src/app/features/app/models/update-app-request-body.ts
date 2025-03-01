import { UpdateAppRequestBodyClient } from "./update-app-request-body-client";
import { UpdateAppRequestBodyGroup } from "./update-app-request-body-group";
import { UpdateAppRequestBodyTag } from "./update-app-request-body-tag";

export interface UpdateAppRequestBody {
    displayName: string;
    client: UpdateAppRequestBodyClient;
    slug: string;
    group: UpdateAppRequestBodyGroup | null;
    description: string;
    imageUrl: string;
    wikiUrl: string;
    tags: UpdateAppRequestBodyTag[];
    rowVersion: string;
}