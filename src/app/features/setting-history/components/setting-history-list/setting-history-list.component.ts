import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from "@angular/material/dialog";
import { MatSnackBar, MatSnackBarRef, TextOnlySnackBar } from "@angular/material/snack-bar";
import { MatSelect } from "@angular/material/select";
import { SettingHistoriesService } from "../../services/setting-histories.service";
import { Component, AfterViewInit, ViewChild, Inject, OnDestroy } from "@angular/core";
import { ThemeService } from "../../../../core/services/theme.service";
import { UtilityService } from "../../../../shared/services/utility.service";
import { RestoreSettingHistoryRequestBody } from "../../models/restore-setting-history-request-body";
import { GetSettingHistoriesResponse } from "../../models/get-setting-histories-response";
import { of, Subscription, switchMap } from "rxjs";
import { HistoryData } from "../../models/history-data";
import { SettingHistoryListComponentResponseModel } from "../../models/setting-history-list-component-response.model";
import { HttpErrorResponse } from "@angular/common/http";
import { IResponse } from "../../../../shared/models/response";
import { RestoreSettingHistoryResponse } from "../../models/restore-setting-history-response";
import { ConflictResolverDialogComponent, ConflictResolverReturnType } from "../../../../shared/components/conflict-resolver-dialog/conflict-resolver-dialog.component";
import { WindowService } from "../../../../core/services/window.service";

export interface SettingHistoryListComponentModel {
    clientName: string;
    clientId: string;
    settingId: string;
    className: string;
    classFullName: string;
    computedIdentifier: string;
    identifierName: string;
    currentVersion: string;
    tempData: object;
    currentRawData: string;
    currentParsedData: object;
    rowVersion: string;
    model: GetSettingHistoriesResponse[];
}

@Component({
    templateUrl: './setting-history-list.component.html',
    styleUrls: ['./setting-history-list.component.css']
})
export class SettingHistoryListComponent implements AfterViewInit, OnDestroy {
    @ViewChild('versionSelection') versionSelection!: MatSelect;
    model: GetSettingHistoriesResponse[] = [];
    versionToHistoryDictionary: Record<string, HistoryData> = {};
    isFullScreen: boolean = false;
    theme: string;
    isConnectionSecure?: boolean;
    selectedVersionToLoading: { [key: string]: boolean } = {};
    subscriptions: Subscription = new Subscription();

    constructor(
        private dialog: MatDialog,
        public dialogRef: MatDialogRef<SettingHistoryListComponent>,
        @Inject(MAT_DIALOG_DATA) public data: SettingHistoryListComponentModel,
        private settingHistoriesService: SettingHistoriesService,
        private utilityService: UtilityService,
        private windowService: WindowService,
        private snackBar: MatSnackBar,
        private themeService: ThemeService) {

        this.theme = this.themeService.isDarkTheme() ? 'vs-dark' : 'vs-light';
        this.isConnectionSecure = this.windowService.isConnectionSecure;
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            this.versionSelection.open();
        }, 150);
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    selectedVersion: string = '';
    selectedData = { rawData: '', parsedData: {} };
    isSelected: boolean = false;
    isRestoreButtonEnabled: boolean = true;
    isCompareClicked: boolean = false;

    onVersionSelected() {

        this.isRestoreButtonEnabled = true;
        this.isSelected = true;

        const historyData = this.versionToHistoryDictionary[this.selectedVersion];

        if (historyData !== undefined) {
            this.selectedData = { rawData: historyData.rawData, parsedData: historyData.parsedData };
            this.selectedVersionToLoading[this.selectedVersion] = false;
            return;
        }

        this.selectedVersionToLoading[this.selectedVersion] = true;

        const history = this.data.model.find(m => m.version === this.selectedVersion);

        if (!history) {
            return;
        }

        const subscription = this.settingHistoriesService.getSettingHistoryData({
            historyId: history.id
        }).subscribe({
            next: (response) => {
                const responseData = response.data;

                if (!responseData) {
                    return;
                }

                const rawData = responseData.data;
                const parsedData = JSON.parse(responseData.data);

                this.versionToHistoryDictionary[this.selectedVersion] = { historyId: history.id, rawData, parsedData, rowVersion: history.rowVersion }

                this.selectedData = { rawData, parsedData };

                this.selectedVersionToLoading[this.selectedVersion] = false;
            },
            error: (errr) => {
                this.selectedVersionToLoading[this.selectedVersion] = false;
            }
        });

        this.subscriptions.add(subscription);
    }

    copyToClipboard() {
        const value = JSON.stringify(this.selectedData.parsedData, null, 4)

        this.utilityService.copyToClipboard(value);
    }

    download() {

        // const model = {
        //     [this.data.classFullName]: this.selectedData.parsedData
        // };

        const value = JSON.stringify(this.selectedData.parsedData, null, 4)

        this.utilityService.download(value, this.data.className);
    }

    restore() {
        const historyData = this.versionToHistoryDictionary[this.selectedVersion];

        this.isRestoreButtonEnabled = false;

        const restoreSettingHistoryRequestBody: RestoreSettingHistoryRequestBody = {
            settingRowVersion: this.data.rowVersion,
            historyRowVersion: historyData.rowVersion
        };

        let model: SettingHistoryListComponentResponseModel;

        const subscription = this.settingHistoriesService.restoreSettingHistory({
            historyId: historyData.historyId,
            body: restoreSettingHistoryRequestBody
        }).subscribe({
            next: (response) => {

                if (response.data) {
                    this.snackBar.open(`Setting restored!`, 'Close', {
                        horizontalPosition: 'right',
                        verticalPosition: 'top',
                        duration: 1500
                    });

                    this.dialogRef.close({
                        fetchLatest: true
                    });
                }
            },
            error: (err: HttpErrorResponse) => {

                const error = err.error as IResponse<RestoreSettingHistoryResponse>;

                if (error.errors) {

                    if (error.status === 409) {
                        const availableReturnTypes: ConflictResolverReturnType[] = ['Discard', 'Fetch Latest'];

                        const conflictResolverDialogComponent = this.dialog.open(ConflictResolverDialogComponent, {
                            width: '400px',
                            data: availableReturnTypes,
                            autoFocus: false
                        }).afterClosed().subscribe((type: ConflictResolverReturnType) => {
                            if (type === "Fetch Latest") {

                                model = {
                                    rawData: '',
                                    parsedData: {},
                                    version: '',
                                    settingRowVersion: '',
                                    fetchLatest: true
                                };

                                this.dialogRef.close(model);
                            }
                        });

                        this.subscriptions.add(conflictResolverDialogComponent);
                    }
                    else if (error.errors.find(e => e.traces == 'HistoryAlreadyRestored')) {
                        model = {
                            rawData: '',
                            parsedData: {},
                            version: '',
                            settingRowVersion: '',
                            fetchLatest: true
                        };

                        this.dialogRef.close(model);
                    }
                }

                this.isRestoreButtonEnabled = true;
            }
        });

        this.subscriptions.add(subscription);
    }

    toggleFullScreen() {
        this.isFullScreen = !this.isFullScreen;

        const dialogElement = document.querySelector('.mat-mdc-dialog-surface');

        if (this.isFullScreen) {
            dialogElement?.setAttribute('style', `
                  border-radius: 0 !important;
                `);

            this.dialogRef.updateSize('100%', '100%');
        } else {
            this.dialogRef.updateSize('1350px', '680px');
            dialogElement?.removeAttribute('style');
        }
    }
}