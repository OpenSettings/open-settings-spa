export interface SettingCreateComponentReturnModel {
    id: string;
    version: string;
    classId: string;
    computedIdentifier: string;
    className: string;
    classNamespace: string;
    classFullName: string;
    rawData: string;
    parsedData: object;
    storeInSeparateFile: boolean;
    ignoreOnFileChange: boolean | null;
    registrationMode: number;
}