export interface GetGroupedAppDataByIdentifierIdResponseIdentifier {
    id: string;
    name: string;
    slug: string;
    sortOrder: number;
    appMapping: GetGroupedAppDataByIdentifierIdResponseIdentifierAppMapping;
}

export interface GetGroupedAppDataByIdentifierIdResponseIdentifierAppMapping{
    sortOrder: number;
    rowVersion: string;
}