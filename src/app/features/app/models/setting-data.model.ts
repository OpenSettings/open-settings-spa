export interface SettingData {
    slug: string;
    clientId: string;
    settingId: string;
    className: string;
    classNamespace: string;
    classFullName: string;
    classId: string;
    computedIdentifier: string;
    version: string;
    isDataFetched: boolean;
    dataRestored: boolean;
    dataValidationEnabled: boolean;
    rawData: string;
    parsedData: object;
    tempData: object;
    settingRowVersion: string;
    classRowVersion: string;
    storeInSeparateFile: boolean;
    ignoreOnFileChange: boolean | null;
    registrationMode: number;
}