export interface ModelForPaginatedResponseData {
    id: string;
    name: string;
    slug: string;
    sortOrder: number;
    mappingsCount: number;
    createdOn: string;
    updatedOn?: string;
    createdBy: string;
    updatedBy: string;
    rowVersion: string;
}