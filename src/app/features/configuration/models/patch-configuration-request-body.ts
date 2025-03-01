export interface PatchConfigurationRequestBody {
    rowVersion: string;
    updatedFieldNameToValue: { [key: string]: any };
}