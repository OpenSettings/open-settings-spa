export interface UpdateIdentifierResponse{
    name: string;
    slug: string;
    sortOrder: number;
    updatedById?: string;
    updatedOn: Date;
    rowVersion: string;
}