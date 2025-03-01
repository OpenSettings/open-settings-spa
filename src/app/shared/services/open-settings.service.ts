import { HttpHeaders, HttpClient } from "@angular/common/http";
import { Injectable, OnDestroy } from "@angular/core";
import { Subject, takeUntil, Observable, map, catchError, of, BehaviorSubject, switchMap } from "rxjs";
import { AuthService } from "../../core/services/auth.service";
import { WindowService } from "../../core/services/window.service";
import { GetSponsorsResponse } from "../../features/sponsor/models/get-sponsors-response.model";
import { GetSponsorsResult } from "../../features/sponsor/models/get-sponsors-result.model";
import { NotificationType } from "./notifications.service";

@Injectable({
    providedIn: 'root'
})
export class OpenSettingsService implements OnDestroy {
    private headers: HttpHeaders = new HttpHeaders();
    private route: string;
    private destroy$ = new Subject<void>();

    private linksLoadingSubject$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    private isLinksLoading: boolean = false;
    private linksData: GetLinksResponse | null = null;

    constructor(
        private httpClient: HttpClient,
        private authService: AuthService,
        windowService: WindowService) {
        this.route = windowService.controllerOptions.route;
        this.authService.isAuthenticated$
            .pipe(takeUntil(this.destroy$))
            .subscribe(isAuthenticated => {
                this.headers = isAuthenticated
                    ? new HttpHeaders({ 'Authorization': `${this.authService.token}` })
                    : new HttpHeaders();
            });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    getSponsors(): Observable<GetSponsorsResult> {

        const url = this.route + '/v1/open-settings/configs-data/sponsors';

        return this.httpClient.get<GetSponsorsResponse>(url, { headers: this.headers }).pipe(map(response => {
            return { data: response, fromFallback: false };
        }),
            catchError(() => this.getSponsorsFromFallback())
        );
    }

    getSponsorsFromFallback(): Observable<GetSponsorsResult> {
        return this.httpClient.get<GetSponsorsResponse>(`assets/sponsors.json?v=${new Date().getTime()}`).pipe(map(fallbackResponse => {
            return { data: fallbackResponse, fromFallback: true };
        }));
    }

    getLinks(): Observable<GetLinksResponse> {

        if (this.linksData) {
            return of(this.linksData);
        }

        if (this.isLinksLoading) {
            return this.linksLoadingSubject$.pipe(switchMap(() => of(this.linksData ?? {})));
        }

        this.isLinksLoading = true;
        this.linksLoadingSubject$.next(true);

        const url = this.route + '/v1/open-settings/configs-data/links';

        return this.httpClient.get<GetLinksResponse>(url, { headers: this.headers }).pipe(map(response => {

            this.linksData = response;

            this.isLinksLoading = false;
            this.linksLoadingSubject$.next(false);

            return response;
        }),
            catchError(() => of({}))
        );
    }

    getNotifications(): Observable<GetNotificationsResponse[]> {

        const url = this.route + '/v1/open-settings/configs-data/notifications';

        return this.httpClient.get<GetNotificationsResponse[]>(url, { headers: this.headers }).pipe(map(response => {
            return response;
        }),
            catchError(() => of([]))
        );
    }
}

export interface GetLinksResponse {
    [key: string]: GetLinksResponseLink;
}

export interface GetNotificationsResponse {
    id: string;
    title: string;
    message: string;
    type: NotificationType;
    metadata: { [key: string]: any };
    createdOn: Date;
    createdBy: string;
}

export interface GetLinksResponseLink {
    url: string;
    isActive: boolean;
}