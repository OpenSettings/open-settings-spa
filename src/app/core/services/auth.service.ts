import { HttpBackend, HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of } from "rxjs";
import { catchError, map, switchMap, tap } from "rxjs/operators";
import { ControllerConfiguration, ProviderInfo, WindowService } from "./window.service";
import { AuthMethod, AuthType, UserPreferencesService } from "../../shared/services/user-preferences.service";
import { IResponse } from "../../shared/models/response";
import { OpenSettingsDefaults } from "../../shared/open-settings-defaults";

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
    private isAuthorizationRequiredSubject = new BehaviorSubject<boolean>(false);
    private claimsSubject = new BehaviorSubject<{ [key: string]: string }>({});

    private _token: string | null = null;
    private _authType: AuthType | null = null;
    private _authMethod: AuthMethod | null = null;
    private httpClient: HttpClient;
    private controllerConfiguration: ControllerConfiguration;
    private providerInfo: ProviderInfo;

    claims$: Observable<{ [key: string]: string }> = this.claimsSubject.asObservable();
    isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
    isAuthorizationRequired$ = this.isAuthorizationRequiredSubject.asObservable();

    constructor(
        httpBackend: HttpBackend,
        private windowService: WindowService,
        private userPreferencesService: UserPreferencesService
    ) {
        this.httpClient = new HttpClient(httpBackend);
        this.controllerConfiguration = this.windowService.controller;
        this.providerInfo = this.windowService.providerInfo;

        this.setAuthorizationRequired(this.controllerConfiguration.requiresAuthentication || this.providerInfo.requiresAuthentication);
    }

    get token(): string | null {
        return this._token ?? this.userPreferencesService.authToken;
    }

    get authType(): AuthType | null {
        return this._authType ?? this.userPreferencesService.authType;
    }

    get authMethod(): AuthMethod | null {
        return this._authMethod ?? this.userPreferencesService.authMethod;
    }

    get claims(): { [key: string]: string } {
        return this.claimsSubject.getValue();
    }

    get isAuthenticated(): boolean {
        return this.isAuthenticatedSubject.value;
    }

    get isAuthorizationRequired(): boolean {
        return this.isAuthorizationRequiredSubject.value;
    }

    public checkAuthorization(): Observable<boolean> {
        if (!this.isAuthorizationRequired) {
            this.clearAuthData();
            return of(false);
        }

        if (this.token) {

            const claims = this.userPreferencesService.claims;

            if (claims) {
                this.claimsSubject.next(claims);
            }

            this.setIsAuthenticated(true);
            return of(true);
        }

        if (this.providerInfo.openIdConnect.isActive) {
            return this.performOpenIdConnectAuthentication();
        }

        this.setIsAuthenticated(false);

        return of(false);
    }

    private performOpenIdConnectAuthentication(): Observable<boolean> {
        let getMeUrl = this.controllerConfiguration.route + OpenSettingsDefaults.Routes.V1.AuthEndpoints.getMe();

        let params = new HttpParams().append('stateId', this.userPreferencesService.stateId).append('includes', 'Claims');

        let headers = new HttpHeaders({
            'x-os-caller-type': 'Spa',
            'x-os-auth-type': 'OpenIdConnect',
            'x-os-client-id': this.windowService.client.id
        });

        return this.httpClient.post<IResponse<GetMeResponse>>(getMeUrl, null, { headers, params }).pipe(
            map((response: IResponse<GetMeResponse>) => {
                const isAuthenticated = !!response.data?.isAuthenticated;

                if (isAuthenticated) {
                    this._authType = 'OpenIdConnect';
                    this.userPreferencesService.setAuthType(this._authType);

                    if (response.data!.accessToken) {
                        this._token = `Bearer ${response.data!.accessToken}`;
                        this._authMethod = 'Jwt';
                        this.userPreferencesService.setAuthToken(this._token);
                        this.userPreferencesService.setAuthMethod(this._authMethod);
                    } else {
                        this._token = null;
                        this._authMethod = 'Cookie';
                        this.userPreferencesService.removeAuthToken();
                        this.userPreferencesService.setAuthMethod(this._authMethod);
                    }

                    this.setClaims(response.data!.claims);
                    this.setIsAuthenticated(true);
                } else {
                    this.setIsAuthenticated(false);
                }

                return isAuthenticated;
            }),
            catchError((err) => {
                this.setIsAuthenticated(false);
                return of(false);
            })
        );
    }

    public authorizeWithMachineCredentials(clientId: string, clientSecret: string): Observable<boolean | undefined> {

        let generateTokenForMachineUrl = this.controllerConfiguration.route + OpenSettingsDefaults.Routes.V1.TokenEndpoints.generateTokenForMachine();

        const headers = new HttpHeaders({
            'x-os-caller-type': 'Spa',
            'x-os-login-type': 'Machine',
            'x-os-client-id': this.windowService.client.id
        });

        return this.httpClient.post<IResponse<GenerateTokenResponse>>(generateTokenForMachineUrl, {
            client: {
                id: clientId,
                secret: clientSecret
            }
        }, { headers }).pipe(
            switchMap(response => {

                const token = `Bearer ${response.data!.accessToken.value}`;

                return this.internalAuthorize('Machine', 'Jwt', token);
            }),
            catchError(error => {
                console.error('Generate token error:', error);
                return of(undefined);
            })
        )
    }

    private internalAuthorize(authType: AuthType, authMethod: AuthMethod, token: string): Observable<boolean | undefined> {

        let getMeUrl = this.controllerConfiguration.route + OpenSettingsDefaults.Routes.V1.AuthEndpoints.getMe();

        let params = new HttpParams().append('stateId', this.userPreferencesService.stateId).append('includes', 'Claims');

        let headers = new HttpHeaders({
            'x-os-caller-type': 'Spa',
            'x-os-auth-type': authType,
            'x-os-auth-method': authMethod,
            'x-os-client-id': this.windowService.client.id
        });

        headers = headers.set('Authorization', token);

        return this.httpClient.post<IResponse<GetMeResponse>>(getMeUrl, null, { headers }).pipe(
            switchMap(response => {
                if (response.data!.isAuthenticated) {
                    this._token = token;
                    this._authType = authType;
                    this._authMethod = authMethod;
                    this.userPreferencesService.setAuthToken(token);
                    this.userPreferencesService.setAuthType(authType);
                    this.userPreferencesService.setAuthMethod(authMethod);

                    this.setClaims(response.data!.claims);
                    this.setIsAuthenticated(true);
                    return of(true);
                }

                this.setIsAuthenticated(false);
                return of(false);
            }),
            catchError(error => {
                console.error(`${authType} authentication error`, error);
                return of(undefined);
            })
        );
    }

    public basicAuthorize(clientId: string, clientSecret: string): Observable<boolean | undefined> {
        const token = `Basic ${btoa(`${clientId}:${clientSecret}`)}`;

        return this.internalAuthorize('Machine', 'Basic', token);
    }

    private setClaims(claims: { [key: string]: string }) {
        this.userPreferencesService.setClaims(claims);
        this.claimsSubject.next(claims);
    }

    private clearAuthData(): void {
        this.userPreferencesService.removeAuthToken();
        this.userPreferencesService.removeAuthType();
        this.userPreferencesService.removeAuthMethod();
        this.userPreferencesService.removeClaims();
        this.userPreferencesService.removeStateId();
        this._token = null;
        this._authType = null;
        this._authMethod = null;
        this.claimsSubject.next({});
        this.setIsAuthenticated(false);
    }

    setAuthorizationRequired(isRequired: boolean) {
        this.isAuthorizationRequiredSubject.next(isRequired);
    }

    setIsAuthenticated(isAuthenticated: boolean) {
        this.isAuthenticatedSubject.next(isAuthenticated);
    }

    public logout(hasExpired?: boolean): void {

        if (this.userPreferencesService.authType === 'OpenIdConnect') {
            this.clearAuthData();
            window.location.href = this.controllerConfiguration.route + OpenSettingsDefaults.Routes.V1.AuthEndpoints.logout();
        }

        this.clearAuthData();
    }
}

export interface GetMeResponse {
    isAuthenticated: boolean;
    accessToken: string;
    claims: { [key: string]: string };
}

export interface GenerateTokenResponse {
    accessToken: GenerateTokenResponseToken;
}

export interface GenerateTokenResponseToken {
    value: string;
    expiryDate: string;
    expiresInSeconds: number;
}