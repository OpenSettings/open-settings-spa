import { HttpHeaders, HttpClient } from "@angular/common/http";
import { Injectable, OnDestroy } from "@angular/core";
import { AuthService } from "../../../core/services/auth.service";
import { WindowService } from "../../../core/services/window.service";
import { RestoreSettingHistoryResponse } from "../models/restore-setting-history-response";
import { Observable, Subject, takeUntil } from "rxjs";
import { RestoreSettingHistoryRequest } from "../models/restore-setting-history-request";
import { GetSettingHistoriesRequest } from "../models/get-setting-histories-request";
import { IResponse } from "../../../shared/models/response";
import { GetSettingHistoriesResponse } from "../models/get-setting-histories-response";
import { GetSettingHistoryRequest } from "../models/get-setting-history-request";
import { GetSettingHistoryResponse } from "../models/get-setting-history-response";
import { GetSettingHistoryDataRequest } from "../models/get-setting-history-data-request";
import { GetSettingHistoryDataResponse } from "../models/get-setting-history-data-response";

@Injectable({
    providedIn: 'root'
})
export class SettingHistoriesService implements OnDestroy {
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

    getSettingHistoryData(request: GetSettingHistoryDataRequest): Observable<IResponse<GetSettingHistoryDataResponse>> {

        const url = this.route + '/v1/setting-histories/' + request.historyId + '/data';

        return this.httpClient.get<IResponse<GetSettingHistoryDataResponse>>(url, { headers: this.headers });
    }

    getSettingHistoryById(request: GetSettingHistoryRequest): Observable<IResponse<GetSettingHistoryResponse>> {

        const url = this.route + '/v1/setting-histories/' + request.historyIdOrSlug;

        return this.httpClient.get<IResponse<GetSettingHistoryResponse>>(url, { headers: this.headers });
    }

    getSettingHistoryBySlug(request: GetSettingHistoryRequest): Observable<IResponse<GetSettingHistoryResponse>> {

        const url = this.route + '/v1/setting-histories/slug/' + request.historyIdOrSlug;

        return this.httpClient.get<IResponse<GetSettingHistoryResponse>>(url, { headers: this.headers });
    }

    getSettingHistories(request: GetSettingHistoriesRequest): Observable<IResponse<GetSettingHistoriesResponse[]>> {

        const url = this.route + '/v1/settings/' + request.settingId + '/histories';

        return this.httpClient.get<IResponse<GetSettingHistoriesResponse[]>>(url, { headers: this.headers });
    }

    restoreSettingHistory(request: RestoreSettingHistoryRequest): Observable<IResponse<RestoreSettingHistoryResponse>> {

        const url = this.route + '/v1/setting-histories/' + request.historyId + '/restore';

        return this.httpClient.post<IResponse<RestoreSettingHistoryResponse>>(url, request.body, { headers: this.headers });
    }
}