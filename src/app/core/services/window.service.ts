import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class WindowService {

    private _controller: ControllerConfiguration;
    private _providerInfo: ProviderInfo;
    private _documentTitle: string;
    private _serviceType: string;
    private _dataAccessType: string;
    private _dbProviderName: string;
    private _isProvider: boolean;
    private _packVersion: string;
    private _packVersionScore;
    private _version: string;
    private _clientName: string;
    private _clientId: string;
    private _licenseSubject: BehaviorSubject<License>;
    private _isConnectionSecure: boolean;

    constructor() {
        const anyWindow = (window as any);
        this._controller = anyWindow['controller'];
        this._providerInfo = anyWindow['providerInfo'];
        this._documentTitle = anyWindow['documentTitle'];
        this._serviceType = anyWindow['serviceType'];
        this._dataAccessType = anyWindow['dataAccessType'];
        this._dbProviderName = anyWindow['dbProviderName'];
        this._isProvider = this._serviceType !== 'Consumer';
        this._packVersion = anyWindow['packVersion'];
        this._packVersionScore = BigInt(anyWindow['packVersionScore']);
        this._version = anyWindow['version'];
        this._clientName = anyWindow['clientName'];
        this._clientId = anyWindow['clientId'];

        const license = anyWindow['license'] as License;

        license.editionStringRepresentation = LicenseEdition[license.edition];

        this._licenseSubject = new BehaviorSubject<License>(license);

        this._isConnectionSecure = window.location.protocol === 'https:';
    }

    get controller(): ControllerConfiguration {
        return this._controller;
    }

    get providerInfo(): ProviderInfo {
        return this._providerInfo;
    }

    get documentTitle(): string {
        return this._documentTitle;
    }

    get serviceType(): string {
        return this._serviceType;
    }

    get dataAccessType(): string {
        return this._dataAccessType;
    }

    get dbProviderName(): string{
        return this._dbProviderName;
    }

    get isProvider(): boolean {
        return this._isProvider;
    }

    get packVersion(): string {
        return this._packVersion;
    }

    get packVersionScore(): bigint {
        return this._packVersionScore;
    }

    get version(): string {
        return this._version;
    }

    get clientName(): string {
        return this._clientName;
    }

    get clientId(): string {
        return this._clientId;
    }

    get license(): License {
        return this._licenseSubject.value;
    }

    get license$(): Observable<License> {
        return this._licenseSubject.asObservable();
    }

    get isConnectionSecure(): boolean {
        return this._isConnectionSecure;
    }

    updateLicense(license: License) {

        if(this.license.referenceId === license.referenceId){
            return;
        }

        license.editionStringRepresentation = LicenseEdition[license.edition];

        this._licenseSubject.next(license);
    }
}

export interface ControllerConfiguration {
    route: string;
    allowFromExploring: boolean;
    authorize: boolean;
    oAuth2: OAuth2Configuration;
}

export interface OAuth2Configuration {
    authority: string;
    clientId: string;
    clientSecret: string;
    signedOutRedirectUri: string;
    allowOfflineAccess: boolean;
    isActive: boolean;
}

export interface ProviderInfo {
    clientId: string;
    clientName: string;
    authorize: boolean;
    version: string;
    packVersion: string;
    oAuth2: OAuth2Info;
    redis: RedisInfo
}

export interface OAuth2Info {
    authority: string;
    allowOfflineAccess: boolean;
    isActive: boolean;
}

export interface RedisInfo {
    channel: string;
    connectionStrings: string;
    isActive: boolean;
}

export interface License {
    holder: string;
    referenceId: string;
    expiryDate?: string;
    edition: LicenseEdition;
    editionStringRepresentation: string
    isExpired: boolean;
    issuedAt?: string;
}

export enum LicenseEdition {
    Community = 100,
    Personal = 200,
    Professional = 300,
    Trial = 400,
    Enterprise = 500
}