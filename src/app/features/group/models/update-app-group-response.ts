export interface UpdateAppGroupResponse {
    name: string;
    slug: string;
    sortOrder: number;
    updatedById?: string;
    updatedOn: Date;
    rowVersion: string;
}