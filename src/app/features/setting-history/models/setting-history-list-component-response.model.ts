import { ConflictResolverReturnType } from "../../../shared/components/conflict-resolver-dialog/conflict-resolver-dialog.component";

export interface SettingHistoryListComponentResponseModel {
    rawData: string;
    parsedData: object;
    version: string;
    settingRowVersion: string;
    type?: ConflictResolverReturnType;
    fetchLatest?: boolean;
}