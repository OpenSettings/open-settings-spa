import { OpenIdConnectConfiguration } from "../../../core/services/window.service";

export interface ConfigurationUpdateComponentData {
    configurationId: string;
    appId: string;
    selectedIdentifierId: string;
    storeInSeparateFile: boolean;
    ignoreOnFileChange: boolean;
    registrationMode: number;
    consumer: ConfigurationConsumer;
    provider: ConfigurationProvider;
    controller: ConfigurationController;
    spa: ConfigurationSpa;
    rowVersion: string;
}

export interface ConfigurationConsumer {
    providerUrl: string;
    requestEncodings: CompressionType[];
    isRedisActive: boolean;
    pollingSettingsWorker: PollingSettingsWorker;
}


export enum CompressionType {
    None = 0,
    Snappy = 1,
    Deflate = 2,
    Gzip = 2,
    Zstd = 3,
    Brotli = 4
}

export interface PollingSettingsWorker{
    isActive: boolean;
    startsIn: string;
    period: string;
}

export interface ConfigurationProvider{
    redis: RedisSettings;
    compressionType: CompressionType;
    compressionLevel: CompressionLevel; 
}

export interface ConfigurationController{
    route: string;
    allowFromExploring: boolean;
    requiresAuthentication: boolean;
    openIdConnect: OpenIdConnectConfiguration;
}

export interface ConfigurationSpa{
    routePrefix: string;
    documentTitle: string;
    isActive: boolean;
}

export interface RedisSettings{
    isActive: boolean;
    configuration: string;
    channel: string;
}

export enum CompressionLevel{
    Optimal = 0,
    Fastest = 1,
    NoCompression = 2
}