import { HttpHeaders, HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, OnDestroy } from "@angular/core";
import { Observable, Subject, takeUntil } from "rxjs";
import { AuthService } from "../../core/services/auth.service";
import { WindowService } from "../../core/services/window.service";
import { IResponse, IResponseAny } from "../models/response";
import { OpenSettingsDefaults } from "../open-settings-defaults";

@Injectable({
    providedIn: 'root'
})
export class NotificationService implements OnDestroy {
    private headers: HttpHeaders = new HttpHeaders();
    private route: string;
    private destroy$ = new Subject<void>();

    constructor(
        private httpClient: HttpClient,
        private authService: AuthService,
        windowService: WindowService) {
        this.route = windowService.controller.route;
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

    createNotification(request: CreateNotificationRequest): Observable<IResponse<CreateNotificationResponse>> {

        const url = this.route + OpenSettingsDefaults.Routes.V1.NotificationsEndpoints.createNotification();

        return this.httpClient.post<IResponse<CreateNotificationResponse>>(url, request.body, { headers: this.headers });
    }

    markNotificationsAsOpened(request: MarkNotificationsAsOpenedRequest): Observable<IResponseAny> {

        const url = this.route + OpenSettingsDefaults.Routes.V1.NotificationsEndpoints.markNotificationsAsOpened(request.userId);

        return this.httpClient.post<IResponseAny>(url, null, { headers: this.headers });
    }

    markNotificationAsViewed(request: MarkNotificationAsRequest): Observable<IResponseAny> {

        const url = this.route + OpenSettingsDefaults.Routes.V1.NotificationsEndpoints.markNotificationAsViewed(request.notificationId, request.userId);

        return this.httpClient.post<IResponseAny>(url, null, { headers: this.headers });
    }

    markNotificationAsDismissed(request: MarkNotificationAsRequest): Observable<IResponseAny> {

        const url = this.route + OpenSettingsDefaults.Routes.V1.NotificationsEndpoints.markNotificationAsDismissed(request.notificationId, request.userId);

        return this.httpClient.post<IResponseAny>(url, null, { headers: this.headers });
    }

    getNotifications(request: GetNotificationsRequest): Observable<IResponse<GetNotificationsResponse>> {

        let url = this.route + OpenSettingsDefaults.Routes.V1.NotificationsEndpoints.getNotifications();

        let params = new HttpParams();

        if (request.isExpired !== undefined) {
            params = params.append("isExpired", request.isExpired);
        }

        if (request.type !== undefined) {
            params = params.append("type", request.type);
        }

        if (request.source !== undefined) {
            params = params.append("source", request.source);
        }

        return this.httpClient.get<IResponse<GetNotificationsResponse>>(url, { headers: this.headers, params });
    }

    getUserNotifications(request: GetUserNotificationsRequest): Observable<IResponse<GetUserNotificationsResponse>> {

        let url = this.route + OpenSettingsDefaults.Routes.V1.NotificationsEndpoints.getUserNotifications(request.userId);

        let params = new HttpParams();

        if (request.isOpened !== undefined) {
            params = params.append("isOpened", request.isOpened);
        }

        if (request.isViewed !== undefined) {
            params = params.append("isViewed", request.isViewed);
        }

        if (request.isDismissed !== undefined) {
            params = params.append("isDismissed", request.isDismissed);
        }

        if (request.isExpired !== undefined) {
            params = params.append("isExpired", request.isExpired);
        }

        if (request.type !== undefined) {
            params = params.append("type", request.type);
        }

        if (request.source !== undefined) {
            params = params.append("source", request.source);
        }

        return this.httpClient.get<IResponse<GetUserNotificationsResponse>>(url, { headers: this.headers, params });
    }

    dispatchNotificationsToUsers(request: DispatchNotificationsToUsersRequest): Observable<IResponseAny> {

        const url = this.route + OpenSettingsDefaults.Routes.V1.NotificationsEndpoints.dispatchNotificationsToUsers(request.notificationId);

        return this.httpClient.post<IResponseAny>(url, null, { headers: this.headers });
    }
}

export interface MarkNotificationAsRequest {
    userId: string;
    notificationId: string;
}

export interface MarkNotificationsAsOpenedRequest {
    userId: string;
}

export interface CreateNotificationResponse {
    id: string;
}

export interface CreateNotificationRequest {
    body: {
        notificationId: string;
        titel: string;
        message: string;
        type: NotificationType
    }
}

export enum NotificationType {
    Neutral = 1,
    Info = 2,
    Accent = 3,
    Success = 4,
    Warn = 5,
    Error = 6,
    NewVersionAvailable = 7,
    VersionMismatch = 8,
    LicenseExpiring = 9
}

export interface DispatchNotificationsToUsersRequest {
    notificationId: string;
}

export interface GetNotificationsRequest {
    isExpired?: boolean;
    type?: NotificationType;
    source?: NotificationSource;
}

export interface GetUserNotificationsRequest {
    userId: string;
    isOpened?: boolean;
    isViewed?: boolean;
    isDismissed?: boolean;
    isExpired?: boolean;
    type?: NotificationType;
    source?: NotificationSource;
}

export interface GetNotificationsResponse {
    notifications: GetNotificationsResponseNotification[];
}

export interface GetNotificationsResponseNotification {
    id: string;
    title: string;
    message: string;
    type: NotificationType;
    source: NotificationSource;
    metadata: { [key: string]: any };
    isExpired: boolean;
    createdOn: string;
    creatorName: string;
}

export interface GetUserNotificationsResponse {
    notificationCounts: GetUserNotificationsResponseNotificationCounts;
    notifications: GetUserNotificationsResponseNotification[];
}

export interface GetUserNotificationsResponseNotificationCounts {
    opened: number;
    notOpened: number;
    viewed: number;
    notViewed: number;
    dismissed: number;
    notDismissed: number;
}

export interface GetUserNotificationsResponseNotification {
    id: string;
    title: string;
    message: string;
    type: NotificationType;
    source: NotificationSource;
    metadata: { [key: string]: any };
    isOpened: boolean;
    isViewed: boolean;
    isDismissed: boolean;
    isExpired: boolean;
    createdOn: string;
    creatorName: string;
}

export enum NotificationSource {
    User = 1,
    System = 2,
    OpenSettings = 3
}