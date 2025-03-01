import { ConflictResolverReturnType } from "../../../shared/components/conflict-resolver-dialog/conflict-resolver-dialog.component";
import { GetGroupedAppsResponseAppGroup } from "./get-grouped-apps-response-app-group";
import { GetGroupedAppsResponseAppTag } from "./get-grouped-apps-response-app-tag";

export interface AppEditComponentReturnModel {
    displayName: string;
    clientName: string;
    slug: string;
    group: GetGroupedAppsResponseAppGroup | null;
    description: string;
    imageUrl: string;
    wikiUrl: string;
    tags: GetGroupedAppsResponseAppTag[];
    rowVersion: string;
    type?: ConflictResolverReturnType;
}