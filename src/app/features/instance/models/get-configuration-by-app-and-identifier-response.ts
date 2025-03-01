import { ConfigurationConsumer, ConfigurationProvider } from "../../configuration/models/configuration-update-component-data";

export interface GetConfigurationByAppAndIdentifierResponse {
    id: string;
    allowAnonymousAccess: boolean;
    storeInSeparateFile: boolean;
    ignoreOnFileChange: boolean;
    registrationMode: number;
    consumer: ConfigurationConsumer;
    provider: ConfigurationProvider;
    rowVersion: string;
}