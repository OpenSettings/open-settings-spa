export interface UpdateIdentifierResponse{
    name: string;
    slug: string;
    sortOrder: number;
    updatedById?: string;
    updatedOn: string;
    rowVersion: string;
}