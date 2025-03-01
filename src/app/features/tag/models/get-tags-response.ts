import { GetTagsResponseTag } from "./get-tags-response-tag";

export interface GetTagsResponse {
    minSortOrder: number;
    maxSortOrder: number;
    tags: GetTagsResponseTag[];
}