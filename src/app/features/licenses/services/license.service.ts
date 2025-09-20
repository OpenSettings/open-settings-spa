import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable, OnDestroy } from "@angular/core";
import { Observable, Subject, takeUntil } from "rxjs";
import { License, LicenseEdition, WindowService } from "../../../core/services/window.service";
import { AuthService } from "../../../core/services/auth.service";
import { GetPaginatedRequest } from "../../../shared/models/get-paginated-request";
import { IResponse, IResponseAny } from "../../../shared/models/response";
import { SortDirection } from "../../../shared/models/sort-direction.enum";
import { GetPaginatedLicensesResponse } from "../models/get-paginated-licenses-response";
import { SaveLicenseRequest } from "../models/save-license-request";
import { OpenSettingsDefaults } from "../../../shared/open-settings-defaults";

@Injectable({
    providedIn: 'root'
})
export class LicenseService implements OnDestroy {
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

    getPaginatedLicenses(request: GetPaginatedRequest): Observable<IResponse<GetPaginatedLicensesResponse>> {
        let url = this.route + OpenSettingsDefaults.Routes.V1.LicensesEndpoints.getPaginatedLicenses();

        let params = new HttpParams();

        if (request.pageIndex) {
            params = params.append("page", request.pageIndex);
        }

        if (request.pageSize) {
            params = params.append("size", request.pageSize);
        }

        if (request.searchTerm) {
            params = params.append("searchTerm", request.searchTerm);
        }

        if (request.searchBy) {
            params = params.append("searchBy", request.searchBy);
        }

        if (request.sortBy) {

            params = params.append("sortBy", request.sortBy);

            if (request.sortDirection === SortDirection.Desc) {
                params = params.append("sortDirection", request.sortDirection)
            }
        }

        return this.httpClient.get<IResponse<GetPaginatedLicensesResponse>>(url, { headers: this.headers, params });
    }

    getCurrentLicense(): Observable<IResponse<License>> {

        let url = this.route + OpenSettingsDefaults.Routes.V1.LicensesEndpoints.getCurrentLicense();

        return this.httpClient.get<IResponse<License>>(url, { headers: this.headers });
    }

    saveLicense(request: SaveLicenseRequest): Observable<IResponse<License>> {

        const url = this.route + OpenSettingsDefaults.Routes.V1.LicensesEndpoints.saveLicense();

        let headers = this.headers.set('Content-Type', 'application/json');

        return this.httpClient.post<IResponse<License>>(url, `"${request.licenseKey}"`, { headers });
    }

    deleteLicense(referenceId: string): Observable<IResponseAny> {

        const url = this.route + OpenSettingsDefaults.Routes.V1.LicensesEndpoints.deleteLicense(referenceId);

        return this.httpClient.delete<IResponseAny>(url, { headers: this.headers });
    }

    getLicenseUpdateMessage(initialLicense: License, currentLicense: License): { message: string, duration: number } {
        let message;
        let duration;

        if (initialLicense.referenceId === currentLicense.referenceId) {
            message = `A new license has been registered, but your current license remains unchanged because it has a higher tier or a later expiration date.`;
            duration = 8000;

        } else if (initialLicense.edition === currentLicense.edition) {
            message = 'The license has been updated!';
            duration = 3500;
        }
        else {
            message = `The license has been ${currentLicense.edition > initialLicense.edition ? 'upgraded' : 'downgraded'} to ${LicenseEdition[currentLicense.edition]} Edition!`;
            duration = 5250;
        }

        return {
            message,
            duration
        }
    }
}