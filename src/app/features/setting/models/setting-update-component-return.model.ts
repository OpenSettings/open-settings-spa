import { ConflictResolverReturnType } from "../../../shared/components/conflict-resolver-dialog/conflict-resolver-dialog.component";

export interface SettingUpdateComponentReturnModel {
    computedIdentifier: string;
    className: string;
    classNamespace: string;
    classFullName: string;
    isDataValidationEnabled: boolean;
    rowVersion: string;
    storeInSeparateFile: boolean;
    ignoreOnFileChange: boolean | null;
    registrationMode: number;
    type?: ConflictResolverReturnType;
}