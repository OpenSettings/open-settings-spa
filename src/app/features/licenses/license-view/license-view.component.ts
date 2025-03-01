import { Component, OnDestroy, OnInit } from "@angular/core";
import { License, WindowService } from "../../../core/services/window.service";
import { filter, Subscription, switchMap } from "rxjs";
import { ConfirmationDialogComponentModel } from "../../../shared/components/confirmation-dialog/confirmation-dialog-component.model";
import { ConfirmationDialogComponent } from "../../../shared/components/confirmation-dialog/confirmation-dialog.component";
import { LicensesService } from "../services/licenses.service";
import { MatDialog } from "@angular/material/dialog";
import { LicenseUpgradeComponent } from "../license-upgrade/license-upgrade.component";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
    templateUrl: './license-view.component.html'
})
export class LicenseViewComponent implements OnInit, OnDestroy {
    license?: License;
    subscriptions = new Subscription();
    isLoading: boolean = false;

    constructor(
        private dialog: MatDialog,
        private licensesService: LicensesService,
        private windowService: WindowService,
        private snackBar: MatSnackBar) { }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    ngOnInit(): void {

        const licenseSubscription = this.windowService.license$.subscribe({
            next: (license) => {
                this.license = license;
            }
        });

        this.subscriptions.add(licenseSubscription);
    }

    upgradeLicense() {
        this.dialog.open(LicenseUpgradeComponent, {
            width: '500px',
            height: '265px',
            minWidth: 'inherit',
            maxWidth: 'inherit',
            autoFocus: false
        });
    }

    deleteLicense() {

        const referenceId = this.license?.referenceId;

        if (!referenceId) {
            return;
        }

        const title = 'Confirm delete';
        const message = `Are you sure you want to delete the '${referenceId}' license? This action cannot be undone.`;

        const confirmationDialogComponentModel: ConfirmationDialogComponentModel = {
            title,
            message,
            requireConfirmation: true
        };

        const subscription = this.dialog
            .open(ConfirmationDialogComponent, {
                width: '500px',
                data: confirmationDialogComponentModel
            })
            .afterClosed()
            .pipe(
                filter(result => !!result),
                switchMap(() => {

                    this.isLoading = true;

                    return this.licensesService.deleteLicense(referenceId);
                }),
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

                    this.isLoading = false;

                    this.snackBar.open(licenseUpdateMessage.message, 'Close', {
                        horizontalPosition: 'right',
                        verticalPosition: 'top',
                        duration: licenseUpdateMessage.duration
                    });
                },
                error: (err) => {
                    this.isLoading = false;
                }
            });

        this.subscriptions.add(subscription);
    }
}