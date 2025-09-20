import { Component, OnDestroy, OnInit } from "@angular/core";
import { LicenseService } from "../services/license.service";
import { Subscription, switchMap } from "rxjs";
import { GetLinksResponseLink, OpenSettingsService } from "../../../shared/services/open-settings.service";
import { HttpErrorResponse } from "@angular/common/http";
import { IResponseAny } from "../../../shared/models/response";
import { UtilityService } from "../../../shared/services/utility.service";
import { License, LicenseEdition, WindowService } from "../../../core/services/window.service";
import { MatDialogRef } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
    templateUrl: './license-upgrade.component.html'
})
export class LicenseUpgradeComponent implements OnInit, OnDestroy {
    licenseKey?: string;
    hideLicenseKey: boolean = true;
    subscriptions: Subscription = new Subscription();
    licenseLink: GetLinksResponseLink = { url: '', isActive: false };
    actionName: string;
    isLoading: boolean = false;

    constructor(
        private licensesService: LicenseService,
        private openSettingsService: OpenSettingsService,
        private utilityService: UtilityService,
        private windowService: WindowService,
        private dialogRef: MatDialogRef<LicenseUpgradeComponent>,
        private snackBar: MatSnackBar) { 
            this.actionName = windowService.license.edition === LicenseEdition.Enterprise ? 'Re-new' : 'Upgrade';
        }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    ngOnInit(): void {

        const linkSubscription = this.openSettingsService.getLinks().subscribe(response => {

            const licenseLink = response['license'];

            if (licenseLink) {
                this.licenseLink.url = licenseLink.url;
                this.licenseLink.isActive = licenseLink.isActive;
            }
        });

        this.subscriptions.add(linkSubscription);
    }

    upgradeLicense(licenseKey?: string) {

        if (!licenseKey) {
            return;
        }

        this.isLoading = true;

        const subscription = this.licensesService.saveLicense({ licenseKey }).pipe(
            switchMap(() => this.licensesService.getCurrentLicense())
        )
            .subscribe({
                next: (response) => {

                    const currentLicense = response.data as License;

                    if (!currentLicense) {
                        this.isLoading = false;
                        return;
                    }

                    const initialLicense = this.windowService.license;

                    const licenseUpdateMessage = this.licensesService.getLicenseUpdateMessage(initialLicense, currentLicense);

                    this.windowService.updateLicense(currentLicense);

                    this.snackBar.open(licenseUpdateMessage.message, 'Close', {
                        horizontalPosition: 'right',
                        verticalPosition: 'top',
                        duration: licenseUpdateMessage.duration
                    });

                    this.isLoading = false;

                    this.dialogRef.close(true);
                },
                error: (err: HttpErrorResponse) => {

                    const response = err.error as IResponseAny;

                    if (response && response.errors) {
                        this.utilityService.error(response.errors, 3500);
                    } else {
                        this.utilityService.simpleError(err.message, 2250);
                    }

                    this.isLoading = false;
                }
            });

        this.subscriptions.add(subscription);
    }

    upload(event: any){
        this.utilityService.upload(event.target.files[0] as File).then(content => {
            const licenseKey = content.trim();

            this.upgradeLicense(licenseKey);

        }).catch(error => {
            this.snackBar.open(`Error occurred while uploading file. Error: ${error}`, 'Close', {
                horizontalPosition: 'right',
                verticalPosition: 'top',
                duration: 8000
            });
        });
    }

    toggleLicenseKeyVisibility() {
        this.hideLicenseKey = !this.hideLicenseKey;
    }
}