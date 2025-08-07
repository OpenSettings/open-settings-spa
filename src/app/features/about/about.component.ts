import { Component, OnInit } from "@angular/core";
import { ClientInfo, License, PackInfo, ProviderInfo, WindowService } from "../../core/services/window.service";
import { GetLinksResponseLink, OpenSettingsService } from "../../shared/services/open-settings.service";
import { filter, Subscription, switchMap, tap } from "rxjs";
import { DatePipe } from "@angular/common";
import { ConfirmationDialogComponentModel } from "../../shared/components/confirmation-dialog/confirmation-dialog-component.model";
import { MatDialog } from "@angular/material/dialog";
import { ConfirmationDialogComponent } from "../../shared/components/confirmation-dialog/confirmation-dialog.component";
import { LicensesService } from "../licenses/services/licenses.service";
import { LicenseUpgradeComponent } from "../licenses/license-upgrade/license-upgrade.component";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {
    isProvider: boolean = false;
    providerInfo?: ProviderInfo;
    packInfo?: PackInfo;
    client?: ClientInfo;
    releaseNotes: GetLinksResponseLink = { url: '', isActive: false };
    displayedColumns: string[] = ['key', 'value'];
    appDataSource: { key: string, value: string }[] = [];
    providerDataSource: { key: string, value: string }[] = [];
    licenseDataSource: { key: string, value: string }[] = [];
    license?: License;

    private subscriptions: Subscription = new Subscription();

    constructor(
        private windowService: WindowService,
        private openSettingsService: OpenSettingsService,
        private licensesService: LicensesService,
        private datePipe: DatePipe,
        private dialog: MatDialog,
        private snackBar: MatSnackBar) { }

    ngOnInit(): void {
        this.isProvider = this.windowService.isProvider;
        this.providerInfo = this.windowService.providerInfo;
        this.packInfo = this.windowService.packInfo;
        this.client = this.windowService.client;

        this.appDataSource = [
            { key: 'Name', value: this.client.name },
            { key: 'Version', value: 'v' + this.client.version },
            { key: 'OpenSettings Pack Version', value: 'v' + this.packInfo.version },
        ];

        this.providerDataSource = [
            { key: 'Name', value: this.providerInfo.client.name },
            { key: 'Version', value: 'v' + this.providerInfo.client.version },
            { key: 'OpenSettings Pack Version', value: 'v' + this.providerInfo.packInfo.version }
        ]

        const licenseSubscription = this.windowService.license$.subscribe((license) => {
            this.license = license;

            this.initializeLicenseDataSource();
        });

        this.subscriptions.add(licenseSubscription);

        const subscription = this.openSettingsService.getLinks().subscribe(response => {

            const releaseNotes = response['releaseNotes'];

            if (releaseNotes) {
                this.releaseNotes.url = releaseNotes.url;
                this.releaseNotes.isActive = releaseNotes.isActive;
            }
        });

        this.subscriptions.add(subscription);
    }

    initializeLicenseDataSource() {

        this.licenseDataSource = [];

        if (!this.license) {
            return;
        }

        if (this.license.holder) {
            this.licenseDataSource.push({ key: 'Holder', value: this.license.holder });
        }

        if (this.license.referenceId) {
            this.licenseDataSource.push({ key: 'Reference Id', value: this.license.referenceId });
        }

        if (this.license.edition) {
            this.licenseDataSource.push({ key: 'Edition', value: this.license.editionStringRepresentation });
        }

        if (this.license.issuedAt) {
            this.licenseDataSource.push({ key: 'Activated On', value: this.datePipe.transform(this.license.issuedAt, 'dd-MM-yyyy HH:mm') ?? '' });
        }

        if (this.license.expiryDate) {
            this.licenseDataSource.push({ key: 'Expiry Date', value: this.datePipe.transform(this.license.expiryDate, 'dd-MM-yyyy HH:mm') ?? '' });
        }

        this.licenseDataSource.push({ key: 'Status', value: this.license.isExpired ? 'Inactive' : 'Active' });
    }

    viewReleaseNotes(version?: string) {

        if (!version) {
            return '';
        }

        const majorVersion = version.split('.')[0];

        return this.releaseNotes.url
            .replace("%(MajorVersion)", majorVersion)
            .replace("%(Version)", version);
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
                switchMap(() => this.licensesService.deleteLicense(referenceId)),
                switchMap(() => this.licensesService.getCurrentLicense())
            )
            .subscribe({
                next: (response) => {

                    const currentLicense = response.data as License;

                    if (!currentLicense) {
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
                }
            });

        this.subscriptions.add(subscription);
    }
}