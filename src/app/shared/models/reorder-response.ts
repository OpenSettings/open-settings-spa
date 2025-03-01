export interface ReorderResponse {
    rowVersion: string;
    idToSortOrder: { [key: string]: number };
}