import { Component, OnInit, ViewChild } from "@angular/core";
import { MatAccordion } from "@angular/material/expansion";
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";
import { WindowService } from "../../../../core/services/window.service";
import { BecomeSponsorLink } from "../../models/become-sponsor-link.model";
import { ClassIdMappings } from "../../models/class-id-mappings.model";
import { GetSponsorsResponse } from "../../models/get-sponsors-response.model";
import { Sponsor } from "../../models/sponsor.model";
import { ConfirmationDialogComponent } from "../../../../shared/components/confirmation-dialog/confirmation-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { Subscription } from "rxjs";
import { MatMenu, MatMenuTrigger } from "@angular/material/menu";
import { OpenSettingsService } from "../../../../shared/services/open-settings.service";

@Component({
    templateUrl: './sponsor-list.component.html',
    styleUrls: ['./sponsor-list.component.css']
})
export class SponsorListComponent implements OnInit {
    @ViewChild(MatAccordion) accordion!: MatAccordion;
    @ViewChild(MatMenuTrigger) matMenuTrigger?: MatMenuTrigger;

    subscriptions: Subscription = new Subscription();
    packVersion?: string;

    selectedStatusFilter: number | null = 1;
    selectedVersionFilter: number = 1;
    selectedClassFilter: number | null = null;

    failedToFetchLatestVersion: boolean = false;
    isRawDataFromService: boolean = false;
    hasAnySponsors: boolean = true;
    hasPastSponsors: boolean = true;
    isLoading: boolean = false;

    selectedRawResponseData: GetSponsorsResponse = {
        becomeSponsorLinks: [],
        classIdMappings: {},
        frequencyIdMappings: {},
        sponsors: []
    };
    rawResponseDataFromFallback: GetSponsorsResponse | null = null;
    rawResponseDataFromService: GetSponsorsResponse | null = null;
    filteredSponsors: { [key: number]: Sponsor[] } = {};

    constructor(
        private openSettingsService: OpenSettingsService,
        private iconRegistry: MatIconRegistry,
        private sanitizer: DomSanitizer,
        private windowService: WindowService,
        private dialog: MatDialog
    ) { }

    ngOnInit(): void {

        this.packVersion = this.windowService.packVersion;

        this.startFetching();

        const subscription = this.openSettingsService.getSponsors().subscribe({
            next: (response) => {
                this.failedToFetchLatestVersion = response.fromFallback;
                this.selectedRawResponseData = response.data;

                if (this.failedToFetchLatestVersion) {
                    this.rawResponseDataFromFallback = { ...response.data };
                    this.isRawDataFromService = false;
                    this.selectedVersionFilter = 0;
                } else {
                    this.rawResponseDataFromService = { ...response.data };
                    this.isRawDataFromService = true;
                }

                this.handleClassIdMappings(response.data.classIdMappings);
                this.handleBecomeSponsorLinks(response.data.becomeSponsorLinks);
                this.reloadData();
            },
            error: () => {
                this.stopFetching();
            }
        });

        this.subscriptions.add(subscription);
    }

    filterSponsorsVersion(): void {

        if (this.selectedVersionFilter === 1 && this.rawResponseDataFromService && !this.isRawDataFromService) {
            this.switchToVersionData(this.rawResponseDataFromService);
        } else if (this.selectedVersionFilter === 0 && this.rawResponseDataFromFallback && this.isRawDataFromService) {
            this.switchToVersionData(this.rawResponseDataFromFallback);
        } else if (this.selectedVersionFilter === 0 && !this.rawResponseDataFromFallback) {
            this.fetchFallbackSponsors();
        } else {
            this.reloadData();
        }
    }

    switchToVersionData(versionData: GetSponsorsResponse) {
        this.selectedRawResponseData = { ...versionData };
        this.isRawDataFromService = !this.isRawDataFromService;
        this.handleClassIdMappings(versionData.classIdMappings);
        this.handleBecomeSponsorLinks(versionData.becomeSponsorLinks);
        this.reloadData();
    }

    fetchFallbackSponsors(): void {
        const subscription = this.openSettingsService.getSponsorsFromFallback().subscribe((response) => {
            this.rawResponseDataFromFallback = { ...response.data };
            this.switchToVersionData(response.data);
        });

        this.subscriptions.add(subscription);
    }

    startFetching() {
        this.isLoading = true;
    }

    stopFetching() {
        this.isLoading = false;
    }

    reloadData(): void {

        let sponsors = this.selectedRawResponseData.sponsors;

        this.hasPastSponsors = sponsors.some(s => !s.isActive);

        if (this.selectedStatusFilter !== null) {
            sponsors = sponsors.filter(s => this.selectedStatusFilter === 1 ? s.isActive : !s.isActive);
        }

        if (this.selectedClassFilter !== null) {
            sponsors = sponsors.filter(s => s.classId == this.selectedClassFilter);
        }

        this.filteredSponsors = this.groupAndSortSponsors(sponsors);
        this.hasAnySponsors = Object.keys(this.filteredSponsors).length > 0;

        this.stopFetching();
    }

    groupAndSortSponsors(sponsors: Sponsor[]): { [key: number]: Sponsor[] } {
        const groupedSponsors = sponsors
            .sort((a, b) => a.classId - b.classId)
            .reduce((acc, sponsor) => {
                const classKey = sponsor.classId;
                if (!acc[classKey]) acc[classKey] = [];
                acc[classKey].push(sponsor);
                return acc;
            }, {} as { [key: number]: Sponsor[] });

        for (const key in groupedSponsors) {
            if (Object.prototype.hasOwnProperty.call(groupedSponsors, key)) {
                groupedSponsors[key].sort((a, b) => {
                    if (a.isActive !== b.isActive) {
                        return a.isActive ? -1 : 1;
                    }
                    return a.sortOrder - b.sortOrder;
                });
            }
        }

        return groupedSponsors;
    }

    handleClassIdMappings(classIdMappings: ClassIdMappings): void {
        Object.values(classIdMappings).forEach(model => {
            if (model.svgIconDef && model.iconName) {
                this.iconRegistry.addSvgIconLiteral(model.iconName, this.sanitizer.bypassSecurityTrustHtml(model.svgIconDef));
            }
        });
    }

    handleBecomeSponsorLinks(becomeSponsorLinks: BecomeSponsorLink[]): void {
        becomeSponsorLinks.forEach(link => {
            if (link.svgIconDef && link.iconName) {
                this.iconRegistry.addSvgIconLiteral(link.iconName, this.sanitizer.bypassSecurityTrustHtml(link.svgIconDef));
            }
        });
    }

    confirmationRequiredToOpenLink(url: string, event: Event) {

        event.preventDefault();

        const title = 'Warn!';
        const message = `You are about to navigating to an external website. Do you want to proceed? <br /><br />Url: <small><q>${url}</q></small>`;

        const subscription = this.dialog.open(ConfirmationDialogComponent, {
            width: '500px',
            data: { title, message }
        }).afterClosed().subscribe(result => {
            if (result) {
                this.openLink(url);
            }
        });

        this.subscriptions.add(subscription);
    }

    openLink(url: string): void {
        window.open(url, '_blank');
    }

    clearFilter(): void {
        this.selectedStatusFilter = null;
        this.selectedClassFilter = null;

        if (!this.failedToFetchLatestVersion) {
            this.selectedVersionFilter = 1;
            this.filterSponsorsVersion();
        } else {
            this.reloadData();
        }
    }

    expandAll(): void {
        this.accordion.openAll();
    }

    collapseAll(): void {
        this.accordion.closeAll();
    }
}