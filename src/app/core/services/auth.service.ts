import { HttpBackend, HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of } from "rxjs";
import { catchError, map, switchMap, tap } from "rxjs/operators";
import { ControllerConfiguration, ProviderInfo, WindowService } from "./window.service";
import { UserPreferencesService } from "../../shared/services/user-preferences.service";

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
    private isAuthorizationRequiredSubject = new BehaviorSubject<boolean>(false);
    private claimsSubject = new BehaviorSubject<{ [key: string]: string }>({});

    private _token: string | null = null;
    private httpClient: HttpClient;
    private controllerConfiguration: ControllerConfiguration;
    private providerInfo: ProviderInfo;
    private isProvider: boolean;
    private authenticatedEndpointUrl: string;
    private whoAmIEndpointUrl: string;
    private logoutEndpointUrl: string;

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
        this.authenticatedEndpointUrl = `${this.controllerConfiguration.route}/v1/auth/authenticated`;
        this.whoAmIEndpointUrl = `${this.controllerConfiguration.route}/v1/auth/who-am-i`;
        this.logoutEndpointUrl = `${this.controllerConfiguration.route}/v1/auth/logout`;

        this.setAuthorizationRequired(this.controllerConfiguration.authorize || this.providerInfo.authorize);
    }

    get token(): string | null {
        return this._token;
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
        let url = this.authenticatedEndpointUrl;
        if (!this.isProvider) {
            url += `?uuid=${this.userPreferencesService.uuid}`;
        }

        return this.httpClient.post<AuthenticatedResponse>(url, null).pipe(
            switchMap((response: AuthenticatedResponse) => {
                if (response.isAuthenticated) {

                    let headers;

                    if (response.accessToken) {
                        this._token = `Bearer ${response.accessToken}`;
                        this.userPreferencesService.setAuthToken(this._token);
                        headers = new HttpHeaders({ 'Authorization': this._token });
                    } else {
                        this._token = null;
                        this.userPreferencesService.removeAuthToken();
                        headers = new HttpHeaders({});
                    }

                    return this.httpClient.get<{ [key: string]: string }>(this.whoAmIEndpointUrl, { headers }).pipe(
                        tap(claims => {
                            this.setClaims(claims);
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

    public basicAuthorize(clientId: string, clientSecret: string): Observable<boolean | undefined> {
        const token = 'Basic ' + btoa(`${clientId}:${clientSecret}`);
        const headers = new HttpHeaders({ 'Authorization': token });

        return this.httpClient.post<AuthenticatedResponse>(this.authenticatedEndpointUrl, null, { headers }).pipe(
            switchMap(response => {
                if (response.isAuthenticated) {
                    this._token = token;
                    this.userPreferencesService.setAuthToken(token);
                    this.userPreferencesService.setAuth('basic');

                    return this.httpClient.get<{ [key: string]: string }>(this.whoAmIEndpointUrl, { headers }).pipe(
                        tap(claims => {
                            this.setClaims(claims);
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
                console.error('Basic authentication error:', error);
                return of(undefined);
            })
        );
    }

    private setClaims(claims: { [key: string]: string }) {
        this.userPreferencesService.setClaims(claims);
        this.claimsSubject.next(claims);
    }

    private clearAuthData(): void {
        this.userPreferencesService.removeAuthToken();
        this.userPreferencesService.removeClaims();
        this.userPreferencesService.removeUuid();
        this._token = null;
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
        this.clearAuthData();
        if ((!hasExpired && this.token?.startsWith('Bearer')) || this.userPreferencesService.auth === 'oauth2') {
            this.userPreferencesService.removeAuth();
            window.location.href = this.logoutEndpointUrl;
        }
    }
}

export interface AuthenticatedResponse {
    isAuthenticated: boolean;
    accessToken: string;
}
