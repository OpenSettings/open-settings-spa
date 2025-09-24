export interface GetGroupedAppDataResponseIdentifier {
    id: string;
    name: string;
    slug: string;
    sortOrder: number;
    appMapping: GetGroupedAppDataResponseIdentifierAppMapping;
}

export interface GetGroupedAppDataResponseIdentifierAppMapping {
    sortOrder: number;
    rowVersion: string;
}