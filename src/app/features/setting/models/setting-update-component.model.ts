export interface SettingUpdateComponentModel {
    clientName: string;
    identifierName: string;
    id: string;
    clientId: string;
    computedIdentifier: string;
    classNamespace: string;
    className: string;
    classFullName: string;
    isDataValidationEnabled: boolean;
    settingRowVersion: string;
    classRowVersion: string;
    storeInSeparateFile: boolean;
    ignoreOnFileChange: boolean | null;
    registrationMode: number;
}