export interface CopySettingToIdentifierEmitData {
    rawData: string;
    parsedData: object;
    currentSettingId: string;
    currentAppIdentifierId: string;
    currentIdentifierSlug: string;
    currentAppIdentifierName: string;
    computedIdentifier: string;
    className: string;
    classNamespace: string;
    classFullName: string;
    isDataValidationEnabled: boolean;
    isExpanded: boolean;
    storeInSeparateFile: boolean;
    ignoreOnFileChange: boolean | null;
    registrationMode: number;
}