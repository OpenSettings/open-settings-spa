export interface ModelForPaginatedResponseData {
    id: string;
    name: string;
    slug: string;
    sortOrder: number;
    mappingsCount: number;
    createdOn: Date;
    updatedOn?: Date;
    createdBy: string;
    updatedBy: string;
    rowVersion: string;
}