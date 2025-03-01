export interface GetSettingHistoryResponse {
    data: string;
    version: string;
    slug: string;
    settingId: number;
    createdById?: string;
    restoredById?: string;
    rowVersion: string;
    createdOn: Date;
    updatedOn?: Date;
}