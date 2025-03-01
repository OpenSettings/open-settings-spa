export interface GetSettingHistoriesResponse {
    id: string;
    data: string;
    version: string;
    slug: string;
    createdById?: string;
    restoredById?: string;
    rowVersion: string;
    createdOn: Date;
    updatedOn?: Date;
}