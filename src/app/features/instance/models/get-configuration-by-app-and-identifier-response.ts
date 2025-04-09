import { ConfigurationConsumer, ConfigurationController, ConfigurationProvider, ConfigurationSpa } from "../../configuration/models/configuration-update-component-data";

export interface GetConfigurationByAppAndIdentifierResponse {
    id: string;
    storeInSeparateFile: boolean;
    ignoreOnFileChange: boolean;
    registrationMode: number;
    consumer: ConfigurationConsumer;
    provider: ConfigurationProvider;
    controller: ConfigurationController;
    spa: ConfigurationSpa;
    rowVersion: string;
}