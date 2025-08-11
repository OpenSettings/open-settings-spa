import { HttpBackend, HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of } from "rxjs";
import { catchError, map, switchMap, tap } from "rxjs/operators";
import { ControllerConfiguration, ProviderInfo, WindowService } from "./window.service";
import { AuthMethod, AuthType, UserPreferencesService } from "../../shared/services/user-preferences.service";
import { IResponse } from "../../shared/models/response";

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
    private isAuthorizationRequiredSubject = new BehaviorSubject<boolean>(false);
    private claimsSubject = new BehaviorSubject<{ [key: string]: string }>({});

    private _token: string | null = null;
    private _authType: AuthType | null = null;
    private httpClient: HttpClient;
    private controllerConfiguration: ControllerConfiguration;
    private providerInfo: ProviderInfo;
    private isProvider: boolean;
    private statusEndpointUrl: string;
    private identityEndpointUrl: string;
    private logoutEndpointUrl: string;
    private generateMachineToMachineTokenEndpointUrl: string;

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
        this.isProvider = this.windowService.isProvider;
        this.statusEndpointUrl = `${this.controllerConfiguration.route}/v1/auth/status`;
        this.identityEndpointUrl = `${this.controllerConfiguration.route}/v1/auth/identity`;
        this.logoutEndpointUrl = `${this.controllerConfiguration.route}/v1/auth/logout`;
        this.generateMachineToMachineTokenEndpointUrl = `${this.controllerConfiguration.route}/v1/token/m2m`;

        this.setAuthorizationRequired(this.controllerConfiguration.authorize || this.providerInfo.authorize);
    }

    get token(): string | null {
        return this._token;
    }

    get authType(): AuthType | null {
        return this._authType;
    }

    claims$: Observable<{ [key: string]: string }> = this.claimsSubject.asObservable();

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

        this._token = this.userPreferencesService.authToken;
        this._authType = this.userPreferencesService.authType;

        const claims = this.userPreferencesService.claims;

        if (claims) {
            this.claimsSubject.next(claims);
        }

        if (this._token) {
            this.setIsAuthenticated(true);
            return of(true);
        }

        if (this.providerInfo.oAuth2.isActive) {
            return this.performOAuth2Authentication();
        }

        this.setIsAuthenticated(false);
        return of(false);
    }

    private performOAuth2Authentication(): Observable<boolean> {
        let url = this.statusEndpointUrl;
        if (!this.isProvider) {
            url += `?uuid=${this.userPreferencesService.uuid}`;
        }

        let headers = new HttpHeaders({
            'x-os-caller-type': 'Spa',
            'x-os-auth-type': 'OAuth2'
        });

        return this.httpClient.post<IResponse<GetAuthStatusResponse>>(url, null, { headers }).pipe(
            switchMap((response: IResponse<GetAuthStatusResponse>) => {
                if (response.data!.isAuthenticated) {

                    this._authType = 'OAuth2';
                    this.userPreferencesService.setAuthType(this._authType);

                    if (response.data!.accessToken) {
                        this._token = `Bearer ${response.data!.accessToken}`;
                        this.userPreferencesService.setAuthToken(this._token);
                        this.userPreferencesService.setAuthMethod('Jwt');
                        headers = headers.set('Authorization', this._token);
                        headers = headers.set('x-os-auth-method', 'Jwt');
                    } else {
                        this._token = null;
                        this.userPreferencesService.removeAuthToken();
                        this.userPreferencesService.setAuthMethod('Cookie');
                        headers = headers.set('x-os-auth-method', 'Cookie');
                    }

                    return this.httpClient.get<IResponse<GetIdentityResponse>>(this.identityEndpointUrl, { headers }).pipe(
                        tap(response => {
                            this.setClaims(response.data!.claims);
                        }),
                        map(() => {
                            this.setIsAuthenticated(true);
                            return true;
                        }),
                        catchError(error => {
                            console.error('Error fetching claims:', error);
                            this.setIsAuthenticated(false);
                            return of(false);
                        })
                    );
                }

                this.setIsAuthenticated(false);
                return of(false);
            }),
            catchError((err) => {
                this.setIsAuthenticated(false);
                return of(false);
            })
        );
    }

    public machineToMachineAuthorize(clientId: string, clientSecret: string): Observable<boolean | undefined> {

        const headers = new HttpHeaders({
            'x-os-caller-type': 'Spa',
            'x-os-login-type': 'Machine'
        });

        return this.httpClient.post<IResponse<GenerateMachineToMachineTokenResponse>>(this.generateMachineToMachineTokenEndpointUrl, {
            client: {
                id: clientId,
                secret: clientSecret
            }
        }, { headers }).pipe(
            switchMap(response => {

                const token = `Bearer ${response.data!.accessToken}`;

                return this.internalAuthorize('Machine', 'Jwt', token);
            }),
            catchError(error => {
                console.error('Generate token error:', error);
                return of(undefined);
            })
        )
    }

    private internalAuthorize(authType: AuthType, authMethod: AuthMethod, token: string): Observable<boolean | undefined> {

        let headers = new HttpHeaders({
            'x-os-caller-type': 'Spa',
            'x-os-auth-type': authType,
            'x-os-auth-method': authMethod
        });

        headers = headers.set('Authorization', token);

        return this.httpClient.post<IResponse<GetAuthStatusResponse>>(this.statusEndpointUrl, null, { headers }).pipe(
            switchMap(response => {
                if (response.data!.isAuthenticated) {
                    this._token = token;
                    this._authType = authType;
                    this.userPreferencesService.setAuthToken(token);
                    this.userPreferencesService.setAuthType(authType);

                    return this.httpClient.get<IResponse<GetIdentityResponse>>(this.identityEndpointUrl, { headers }).pipe(
                        tap(response => {
                            this.setClaims(response.data!.claims);
                        }),
                        map(() => {
                            this.setIsAuthenticated(true);
                            return true;
                        }),
                        catchError(error => {
                            console.error('Error fetching claims:', error);
                            this.setIsAuthenticated(false);
                            return of(false);
                        })
                    );
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
        this.userPreferencesService.removeUuid();
        this._token = null;
        this._authType = null;
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

        if (this.userPreferencesService.authType === 'OAuth2') {
            this.clearAuthData();
            window.location.href = this.logoutEndpointUrl;
        }

        this.clearAuthData();
    }
}

export interface GetAuthStatusResponse {
    isAuthenticated: boolean;
    accessToken: string;
}

export interface GetIdentityResponse {
    claims: { [key: string]: string };
}

export interface GenerateMachineToMachineTokenResponse {
    accessToken: string;
    expires: string;
    expiresInSeconds: number;
}