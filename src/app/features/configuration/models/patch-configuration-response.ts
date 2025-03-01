export interface PatchConfigurationResponse {
    rowVersion: string;
    updatedFieldNameToValue: { [key: string]: any };
}