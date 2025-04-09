import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import { DefaultLayoutService } from "./default-layout.service";
import { License, LicenseEdition, ProviderInfo, WindowService } from "../../../core/services/window.service";
import { DEFAULT_ROUTES } from "./default-layout-routes";
import { Subscription } from "rxjs";
import { GetLinksResponseLink, OpenSettingsService } from "../../services/open-settings.service";
import { MatDialog } from "@angular/material/dialog";
import { LicenseUpgradeComponent } from "../../../features/licenses/license-upgrade/license-upgrade.component";
import { LicenseViewComponent } from "../../../features/licenses/license-view/license-view.component";
import { Router } from "@angular/router";

@Component({
    templateUrl: './default-layout.component.html',
    styleUrls: ['./default-layout.component.css']
})
export class DefaultLayoutComponent implements OnInit, OnDestroy {
    ROUTES = DEFAULT_ROUTES;

    documentTitle?: string;
    providerInfo?: ProviderInfo;
    isProvider?: boolean;
    route?: string;
    appIcon?: string;
    menuOpened: boolean = false;
    bugReport: GetLinksResponseLink = { url: '', isActive: false };
    license?: License;
    subtitle?: string;

    private subscriptions: Subscription = new Subscription();

    constructor(
        private windowService: WindowService,
        private defaultLayoutService: DefaultLayoutService,
        private openSettingsService: OpenSettingsService,
        private matDialog: MatDialog,
        private router: Router
    ) { }

    ngOnInit(): void {

        this.subscriptions.add(this.defaultLayoutService.menuOpened$.subscribe(menuOpened => this.menuOpened = menuOpened));

        this.route = this.windowService.controller.route;
        this.providerInfo = this.windowService.providerInfo;
        this.documentTitle = this.windowService.documentTitle;
        this.isProvider = this.windowService.isProvider;

        this.subtitle = this.windowService.serviceType;

        if(this.windowService.dataAccessType) {
            this.subtitle += ` (${this.windowService.dataAccessType}:${this.windowService.dbProviderName})`;
        }

        this.subtitle += ` v${this.windowService.packVersion}`;

        const licenseSubscription = this.windowService.license$.subscribe((license) => {

            if(license.edition !== LicenseEdition.Community && this.router.url === `/${this.ROUTES.sponsors}`) {
                this.router.navigate(['/']);
            }
                
            this.license = license;
        });

        this.subscriptions.add(licenseSubscription);

        const linksSubscription = this.openSettingsService.getLinks().subscribe(response => {

            const bugReport = response['bugReport'];

            if (bugReport) {
                this.bugReport.url = bugReport.url;
                this.bugReport.isActive = bugReport.isActive;
            }
        });

        this.subscriptions.add(linksSubscription);
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    toggleMenu() {
        this.defaultLayoutService.toggleMenu();
    }

    upgradeLicense() {
        const subscription = this.matDialog.open(LicenseUpgradeComponent, {
            width: '500px',
            height: '265px',
            minWidth: 'inherit',
            maxWidth: 'inherit',
            autoFocus: false
        }).afterClosed().subscribe((response) => {

            if(response){
                this.viewLicense();
            }

        });

        this.subscriptions.add(subscription);
    }

    viewLicense(){
        this.matDialog.open(LicenseViewComponent, {
            width: '580px',
            height: '490px',
            minWidth: 'inherit',
            maxWidth: 'inherit',
            autoFocus: false
        });
    }
}