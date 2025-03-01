import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, QueryList, ViewChild, ViewChildren } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatAccordion, MatExpansionPanel } from "@angular/material/expansion";
import { ThemeService } from "../../../../core/services/theme.service";
import { ConfirmationDialogComponent } from "../../../../shared/components/confirmation-dialog/confirmation-dialog.component";
import { UtilityService } from "../../../../shared/services/utility.service";
import { SettingsService } from "../../services/setting.service";
import { SettingHistoriesService } from "../../../setting-history/services/setting-histories.service";
import { SettingCreateComponent } from "../setting-create/setting-create.component";
import { SettingHistoryListComponentModel, SettingHistoryListComponent as SettingHistoryListComponent } from "../../../setting-history/components/setting-history-list/setting-history-list.component";
import { AppViewService, SettingViewType } from "../../../app/services/app-view.service";
import { Subscription } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { MatSlideToggleChange } from "@angular/material/slide-toggle";
import { SettingData } from "../../../app/models/setting-data.model";
import { UpdateSettingDataRequestBody } from "../../../app/models/update-setting-data-request-body";
import { SettingCreateComponentReturnModel } from "../../models/setting-create-component-return.model";
import { SettingCreateComponentModel } from "../../models/setting-create-component.model";
import { CopySettingToIdentifierEmitData } from "../../models/copy-setting-to-identifier-emit-data";
import { SettingListComponentData } from "../../models/setting-list-component-data";
import { SettingUpdateComponentReturnModel } from "../../models/setting-update-component-return.model";
import { SettingUpdateComponentModel } from "../../models/setting-update-component.model";
import { SettingUpdateComponent } from "../setting-update/setting-update.component";
import { SettingHistoryListComponentResponseModel } from "../../../setting-history/models/setting-history-list-component-response.model";
import { ConflictResolverDialogComponent, ConflictResolverReturnType } from "../../../../shared/components/conflict-resolver-dialog/conflict-resolver-dialog.component";
import { JsonEditorComponent } from "../../../../shared/components/json-editor/json-editor.component";
import { WindowService } from "../../../../core/services/window.service";

@Component({
    selector: 'setting-list',
    templateUrl: './setting-list.component.html'
})
export class SettingListComponent implements OnInit, AfterViewInit, OnDestroy {
    @Input() data!: SettingListComponentData;
    @Output() copySettingToIdentifierEmitter: EventEmitter<CopySettingToIdentifierEmitData> = new EventEmitter<CopySettingToIdentifierEmitData>();
    @Output() settingDeleteEmitter: EventEmitter<string> = new EventEmitter<string>();
    @Output() fetchLatestEmitter: EventEmitter<string> = new EventEmitter<string>();
    @ViewChildren('textarea') textareas!: QueryList<ElementRef<HTMLTextAreaElement>>;
    @ViewChildren('expansionPanel') expansionPanels?: QueryList<MatExpansionPanel>;
    @ViewChildren(JsonEditorComponent) jsonEditors?: QueryList<JsonEditorComponent>;
    @ViewChild(MatAccordion) accordion!: MatAccordion;
    buttons: Record<string, boolean> = {};
    multiSelectionEnabled: boolean = false;
    theme!: string;
    subscriptions: Subscription = new Subscription();
    selectedSettingId: string | undefined = undefined;
    isConnectionSecure?: boolean;
    settingIdToLoading: { [key: string]: boolean } = {};

    constructor(
        private dialog: MatDialog,
        private snackBar: MatSnackBar,
        private utilityService: UtilityService,
        private settingsService: SettingsService,
        private appViewService: AppViewService,
        private settingHistoriesService: SettingHistoriesService,
        private themeService: ThemeService,
        private windowService: WindowService,
        private cdr: ChangeDetectorRef,
        private route: ActivatedRoute,
        private router: Router) { }

    ngOnInit(): void {
        this.subscriptions.add(this.appViewService.appViewMultiSelectionEnabled$.subscribe(isEnabled => {
            this.multiSelectionEnabled = isEnabled;
        }));
        this.theme = this.themeService.isDarkTheme() ? 'vs-dark' : 'vs-light';
        this.isConnectionSecure = this.windowService.isConnectionSecure;
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            const onSettingIdChange = this.appViewService.settingView$.subscribe(settingView => {

                if (!settingView) {
                    return;
                }

                const selectedSettingId = settingView.selectedSettingId;

                switch (settingView.settingViewType) {
                    case 'viewSetting':

                        if (!selectedSettingId) {
                            return;
                        }

                        const settingIndex = this.data.settingDataList.findIndex(s => s.settingId == selectedSettingId);
                        this.expandPanel(settingIndex);
                        this.selectedSettingId = selectedSettingId;

                        break;

                    case 'viewCreateSetting':

                        this.addSetting();

                        break;

                    case 'viewUpdateSetting':

                        if (!selectedSettingId) {
                            return;
                        }

                        const settingForUpdate = this.data.settingDataList.find(s => s.settingId == selectedSettingId)

                        if (settingForUpdate) {
                            this.editSetting(settingForUpdate);
                        }

                        break;

                    case 'viewCopySettingTo':

                        if (!selectedSettingId) {
                            return;
                        }

                        const settingIndexForCopyTo = this.data.settingDataList.findIndex(s => s.settingId == selectedSettingId);

                        if (settingIndexForCopyTo !== -1) {
                            this.expandPanel(settingIndexForCopyTo);

                            const settingForCopyTo = this.data.settingDataList[settingIndexForCopyTo];

                            this.copySettingToIdentifierEmit(settingForCopyTo);
                        }

                        break;

                    case 'viewSettingHistories':

                        if (!selectedSettingId) {
                            return;
                        }

                        const settingIndexForHistories = this.data.settingDataList.findIndex(s => s.settingId == selectedSettingId);

                        if (settingIndexForHistories !== -1) {
                            this.expandPanel(settingIndexForHistories);

                            const settingForHistories = this.data.settingDataList[settingIndexForHistories];

                            const isDisabled = !settingForHistories.dataRestored && settingForHistories.version === '0';

                            if (isDisabled) {
                                // Error about there is not any history
                                return;
                            }

                            this.history(settingForHistories);
                        }

                        break;

                    case 'viewSettingHistory':

                        if (!selectedSettingId) {
                            return;
                        }

                        const settingIndexForHistory = this.data.settingDataList.findIndex(s => s.settingId == selectedSettingId);

                        if (settingIndexForHistory !== -1) {
                            this.expandPanel(settingIndexForHistory);

                            const settingForHistory = this.data.settingDataList[settingIndexForHistory];

                            const isDisabled = !settingForHistory.dataRestored && settingForHistory.version === '0';

                            if (isDisabled) {
                                // Error about there is not any history
                                return;
                            }

                            this.history(settingForHistory);
                        }
                }
            });

            this.subscriptions.add(onSettingIdChange);
        }, 0)
    }

    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }

    onToggleMultiSelection(event: MatSlideToggleChange) {
        this.appViewService.emitAppViewMultiSelectionEnabled(event.checked);
    }

    expandPanel(index: number) {

        if (index < 0) {
            return;
        }

        const panelArray = this.expansionPanels?.toArray();
        if (panelArray && panelArray[index]) {
            panelArray[index].open();
        }
    }

    onPanelClosed(data: SettingData) {
        if (this.selectedSettingId === data.settingId) {
            this.selectedSettingId = undefined;
            this.appViewService.emitSettingView(undefined);
            this.router.navigate(['./apps', this.data.slug, this.data.selectedAppIdentifierId, 'settings'], { relativeTo: this.route, queryParamsHandling: 'merge' });
        }
    }

    onPanelExpanded(data: SettingData) {
        this.settingIdToLoading[data.settingId] = !data.isDataFetched;

        this.selectedSettingId = data.settingId;

        const settingViewType = this.appViewService.settingView?.settingViewType;

        const forbiddenTypes = ["viewCopySettingTo", "viewSettingHistories", "viewSettingHistory"] as SettingViewType[];

        if (settingViewType === undefined || !forbiddenTypes.includes(settingViewType)) {
            this.appViewService.emitSettingView({
                selectedSettingId: data.settingId,
                settingViewType: 'viewSetting'
            });

            this.router.navigate(['./apps', this.data.slug, this.data.selectedAppIdentifierId, 'settings', this.selectedSettingId], { relativeTo: this.route, queryParamsHandling: 'merge' });
        }

        if (data.isDataFetched) {
            return;
        }

        this.buttons[data.settingId] = true;

        const subscription = this.settingsService.getSettingData({
            settingId: data.settingId
        }).subscribe({
            next: (response) => {

                const model = this.data.settingDataList.find(m => m.classId === data.classId);

                if (!model) {
                    return;
                }

                const responseData = response.data;

                if (!responseData) {
                    return;
                }

                model.rawData = responseData.data;

                try {
                    model.parsedData = JSON.parse(responseData.data);
                }
                catch {
                    model.parsedData = {};
                }
                model.tempData = { ...model.parsedData };
                model.isDataFetched = true;

                this.settingIdToLoading[data.settingId] = false;
            },
            error: (err) => {
                this.settingIdToLoading[data.settingId] = false;
            },
        });

        this.subscriptions.add(subscription);
    }

    copyToClipboard(tempData: object) {

        const value = JSON.stringify(tempData, null, 4)

        this.utilityService.copyToClipboard(value);
    }

    download(tempData: object, className: string, classFullName: string) {

        // const model = {
        //     [classFullName]: tempData
        // };

        const value = JSON.stringify(tempData, null, 4);

        this.utilityService.download(value, className);
    }

    upload(event: any, data: SettingData) {
        this.utilityService.upload(event.target.files[0] as File).then(content => {

            const parsedData = JSON.parse(content);

            if (typeof parsedData === 'object' && parsedData !== null) {
                data.tempData = parsedData;
            } else {
                throw ("Invalid JSON data");
            }

            this.snackBar.open(`Changes applied. Click Save icon to confirm.`, 'Close', {
                horizontalPosition: 'right',
                verticalPosition: 'top',
                duration: 5000
            });

            this.buttons[data.settingId] = false;
        }).catch(error => {
            this.snackBar.open(`Error occurred while uploading file. Error: ${error}`, 'Close', {
                horizontalPosition: 'right',
                verticalPosition: 'top',
                duration: 8000
            });
        });
    }

    saveFormData(data: SettingData): void {

        try {
            this.buttons[data.settingId] = true;

            const rawTextareaContent = JSON.stringify(data.tempData);

            if (rawTextareaContent === data.rawData) {
                this.snackBar.open(`There are no changes!`, 'Close', {
                    horizontalPosition: 'right',
                    verticalPosition: 'top',
                    duration: 5000
                });

                this.buttons[data.settingId] = true;

                return;
            }

            const updateSettingModel: UpdateSettingDataRequestBody = {
                data: rawTextareaContent,
                rowVersion: data.settingRowVersion
            };

            const subscription = this.settingsService.updateSettingData({
                settingId: data.settingId,
                body: updateSettingModel
            }).subscribe({
                next: (response) => {

                    const responseData = response.data;

                    if (!responseData) {

                        if (response.extras) {

                            this.buttons[data.settingId] = false;

                            const conflictedData = response.extras['Conflicts'][data.settingId];

                            const availableReturnTypes: ConflictResolverReturnType[] = ['Discard', 'Fetch Latest'];

                            const conflictResolverDialogComponent = this.dialog.open(ConflictResolverDialogComponent, {
                                width: '400px',
                                data: availableReturnTypes,
                                autoFocus: false
                            }).afterClosed().subscribe((type: ConflictResolverReturnType) => {
                                if (type === "Fetch Latest") {
                                    this.fetchLatestEmitter.emit(data.settingId);
                                }
                            });

                            this.subscriptions.add(conflictResolverDialogComponent);
                        }

                        this.buttons[data.settingId] = false;

                        return;
                    }

                    data.parsedData = { ...data.tempData };
                    data.rawData = rawTextareaContent;
                    data.version = responseData.setting.currentVersion;
                    data.settingRowVersion = responseData.setting.rowVersion;

                    this.snackBar.open(`Data has been updated successfully!`, 'Close', {
                        horizontalPosition: 'right',
                        verticalPosition: 'top',
                        duration: 5000
                    });
                },
                error: (err) => {
                    this.buttons[data.settingId] = false;
                }
            });

            this.subscriptions.add(subscription);
        }
        catch (err) {
            this.snackBar.open(`Error occurred when deserializing settings data!`, 'Close', {
                horizontalPosition: 'right',
                verticalPosition: 'top',
                duration: 5000
            });

            this.buttons[data.settingId] = false;
        }
    }

    history(setting: SettingData) {

        const subscription = this.settingHistoriesService.getSettingHistories({
            settingId: setting.settingId
        }).subscribe({
            next: (response) => {

                const responseData = response.data;

                if (!responseData) {
                    return;
                }

                const data: SettingHistoryListComponentModel = {
                    clientName: this.data.clientName,
                    identifierName: this.data.selectedAppIdentifierName,
                    clientId: setting.clientId,
                    settingId: setting.settingId,
                    className: setting.className,
                    classFullName: setting.classFullName,
                    computedIdentifier: setting.computedIdentifier,
                    currentVersion: setting.version,
                    tempData: setting.tempData,
                    currentRawData: setting.rawData,
                    currentParsedData: setting.parsedData,
                    rowVersion: setting.settingRowVersion,
                    model: responseData
                }

                const internalSubscription = this.dialog.open(SettingHistoryListComponent, {
                    data,
                    width: '1350px',
                    height: '680px',
                    minWidth: 'inherit',
                    maxWidth: 'inherit',
                    autoFocus: false
                }).afterClosed().subscribe((result: SettingHistoryListComponentResponseModel) => {

                    if (result) {

                        if (result.fetchLatest) {
                            this.fetchLatestEmitter.emit(setting.settingId);
                        }

                        this.buttons[data.settingId] = false;
                    }

                    const settingIndex = this.data.settingDataList.findIndex(s => s.settingId == setting.settingId);

                    const panelArray = this.expansionPanels?.toArray();
                    if (panelArray && panelArray[settingIndex]) {
                        const isExpanded = panelArray[settingIndex].expanded;

                        if (isExpanded) {
                            this.router.navigate(['./apps', this.data.slug, this.data.selectedAppIdentifierId, 'settings', setting.settingId], { relativeTo: this.route, queryParamsHandling: 'merge' });
                        } else {
                            this.appViewService.emitSettingView({
                                settingViewType: 'viewSetting',
                                selectedSettingId: undefined
                            });
                            this.router.navigate(['./apps', this.data.slug, this.data.selectedAppIdentifierId, 'settings'], { relativeTo: this.route, queryParamsHandling: 'merge' });
                        }
                    }

                });

                this.subscriptions.add(internalSubscription);
            }
        });

        this.subscriptions.add(subscription);
    }

    expandAll() {

        const settingIds = this.data.settingDataList.filter(s => !s.isDataFetched).map(s => s.settingId);

        if (settingIds.length < 2) {
            this.accordion.openAll();
        }

        settingIds.forEach(settingId => {
            this.buttons[settingId] = true;
        });

        const subscription = this.settingsService.getSettingsData({
            appId: this.data.appId,
            identifierId: this.data.selectedAppIdentifierId,
            ids: settingIds
        }).subscribe(response => {

            const data = response.data;

            if (!data) {
                return;
            }

            data.settings.forEach(d => {
                const settingData = this.data.settingDataList.find(s => s.settingId == d.id);

                if (settingData) {
                    settingData.rawData = d.data;
                    try {
                        settingData.parsedData = JSON.parse(d.data);
                    }
                    catch {
                        settingData.parsedData = {};
                    }
                    settingData.tempData = { ...settingData.parsedData };
                    settingData.isDataFetched = true;
                }
            });

            this.accordion.openAll();
        });

        this.subscriptions.add(subscription);
    }

    collapseAll() {
        this.accordion.closeAll();
    }

    editSetting(model: SettingData) {

        const data: SettingUpdateComponentModel = {
            id: model.settingId,
            clientId: this.data.clientId,
            clientName: this.data.clientName,
            identifierName: this.data.selectedAppIdentifierName,
            classNamespace: model.classNamespace,
            className: model.className,
            classFullName: model.classFullName,
            computedIdentifier: model.computedIdentifier,
            isDataValidationEnabled: model.dataValidationEnabled,
            settingRowVersion: model.settingRowVersion,
            classRowVersion: model.classRowVersion,
            storeInSeparateFile: model.storeInSeparateFile,
            ignoreOnFileChange: model.ignoreOnFileChange,
            registrationMode: model.registrationMode
        };

        const subscription = this.dialog.open(SettingUpdateComponent, {
            data,
            width: '820px',
            height: '580px',
            minWidth: 'inherit',
            maxWidth: 'inherit',
            autoFocus: false
        }).afterClosed().subscribe((result: SettingUpdateComponentReturnModel) => {
            if (result) {

                if (result.type === 'Fetch Latest') {
                    this.fetchLatestEmitterForSettingUpdate(model.settingId);
                }
                else {
                    model.classNamespace = result.classNamespace;
                    model.className = result.className;
                    model.classFullName = result.classFullName;
                    model.computedIdentifier = result.computedIdentifier;
                    model.dataValidationEnabled = result.isDataValidationEnabled;
                    model.settingRowVersion = result.rowVersion;
                    model.classRowVersion = result.rowVersion;
                    model.storeInSeparateFile = result.storeInSeparateFile;
                    model.ignoreOnFileChange = result.ignoreOnFileChange;
                    model.registrationMode = result.registrationMode;

                    if (result.type === "Override") {
                        this.fetchLatestEmitter.emit(model.settingId);
                    }
                }
            }

            const settingIndex = this.data.settingDataList.findIndex(s => s.settingId == model.settingId);

            const panelArray = this.expansionPanels?.toArray();
            if (panelArray && panelArray[settingIndex]) {
                const isExpanded = panelArray[settingIndex].expanded;

                if (isExpanded) {
                    this.router.navigate(['./apps', this.data.slug, this.data.selectedAppIdentifierId, 'settings', model.settingId], { relativeTo: this.route, queryParamsHandling: 'merge' });
                } else {
                    this.appViewService.emitSettingView({
                        settingViewType: 'viewSetting',
                        selectedSettingId: undefined
                    });
                    this.router.navigate(['./apps', this.data.slug, this.data.selectedAppIdentifierId, 'settings'], { relativeTo: this.route, queryParamsHandling: 'merge' });
                }
            }
        });

        this.subscriptions.add(subscription);
    }

    addSetting() {

        const data: SettingCreateComponentModel = {
            appId: this.data.appId,
            clientName: this.data.clientName,
            clientId: this.data.clientId,
            identifierName: this.data.selectedAppIdentifierName,
            identifierId: this.data.selectedAppIdentifierId
        }

        const subscription = this.dialog.open(SettingCreateComponent, {
            data,
            width: '1350px',
            height: '680px',
            minWidth: 'inherit',
            maxWidth: 'inherit',
            autoFocus: false
        }).afterClosed().subscribe((result: SettingCreateComponentReturnModel) => {
            if (result) {

                const settingData: SettingData = {
                    slug: this.data.slug,
                    clientId: this.data.clientId,
                    settingId: result.id,
                    className: result.className,
                    classNamespace: result.classNamespace,
                    classFullName: result.classFullName,
                    classId: result.classId,
                    computedIdentifier: result.computedIdentifier,
                    version: result.version,
                    isDataFetched: true,
                    dataRestored: false,
                    dataValidationEnabled: true,
                    rawData: result.rawData,
                    parsedData: result.parsedData,
                    tempData: { ...result.parsedData },
                    settingRowVersion: '',
                    classRowVersion: '',
                    storeInSeparateFile: result.storeInSeparateFile,
                    ignoreOnFileChange: result.ignoreOnFileChange,
                    registrationMode: result.registrationMode
                }

                this.data.settingDataList.push(settingData);

                this.cdr.detectChanges();

                this.selectedSettingId = result.id;
            }

            this.appViewService.emitSettingView({
                selectedSettingId: this.selectedSettingId,
                settingViewType: 'viewSetting'
            });

            if (this.selectedSettingId) {
                this.router.navigate(['./apps', this.data.slug, this.data.selectedAppIdentifierId, 'settings', this.selectedSettingId], { relativeTo: this.route, queryParamsHandling: 'merge' });
            } else {
                this.router.navigate(['./apps', this.data.slug, this.data.selectedAppIdentifierId, 'settings'], { relativeTo: this.route, queryParamsHandling: 'merge' });
            }
        });

        this.subscriptions.add(subscription);
    }

    deleteSetting(model: SettingData) {
        const title = 'Confirm delete';
        const message = `Are you sure you want to delete the "${model.className}" named setting? This will also delete all associated setting histories. This action cannot be undone.`;
        const requireConfirmation = true;

        const subscription = this.dialog.open(ConfirmationDialogComponent, {
            width: '500px',
            data: { title, message, requireConfirmation }
        }).afterClosed().subscribe(result => {
            if (result) {
                const internalSubscription = this.settingsService.deleteSetting({
                    settingId: model.settingId,
                    rowVersion: model.settingRowVersion
                }).subscribe(() => {
                    this.data.settingDataList = this.data.settingDataList.filter(a => a.settingId !== model.settingId);

                    this.snackBar.open(`Deleted successfully!`, 'Close', {
                        horizontalPosition: 'right',
                        verticalPosition: 'top',
                        duration: 5000
                    });

                    this.settingDeleteEmitter.emit(model.settingId);

                    this.router.navigate(['./apps', this.data.slug, this.data.selectedAppIdentifierId, 'settings'], { relativeTo: this.route, queryParamsHandling: 'merge' });
                });

                this.subscriptions.add(internalSubscription);
            }
        });

        this.subscriptions.add(subscription);
    }

    copySettingToIdentifierEmit(model: SettingData) {

        const settingIndex = this.data.settingDataList.findIndex(s => s.settingId == model.settingId);

        const panelArray = this.expansionPanels?.toArray();
        let expanded: boolean = false;
        if (panelArray && panelArray[settingIndex]) {
            expanded = panelArray[settingIndex].expanded;
        }

        const copySettingToIdentifierEmitData: CopySettingToIdentifierEmitData = {
            rawData: model.rawData,
            parsedData: model.parsedData!,
            currentSettingId: model.settingId,
            currentAppIdentifierId: this.data.selectedAppIdentifierId,
            currentAppIdentifierName: this.data.selectedAppIdentifierName,
            computedIdentifier: model.computedIdentifier,
            className: model.className,
            classNamespace: model.classNamespace,
            classFullName: model.classFullName,
            isDataValidationEnabled: model.dataValidationEnabled,
            isExpanded: expanded,
            storeInSeparateFile: model.storeInSeparateFile,
            ignoreOnFileChange: model.ignoreOnFileChange,
            registrationMode: model.registrationMode
        };

        this.copySettingToIdentifierEmitter.emit(copySettingToIdentifierEmitData);
    }

    invalidData(invalid: boolean, model: SettingData) {
        this.buttons[model.settingId] = invalid;
    }

    fetchLatestEmitterForSettingUpdate(settingId: string) {
        this.fetchLatestEmitter.emit(settingId);

        setTimeout(() => {
            const setting = this.data.settingDataList.find(s => s.settingId == settingId);

            if (setting) {
                this.router.navigate(['./apps', this.data.slug, this.data.selectedAppIdentifierId, 'settings', settingId, 'update'], { relativeTo: this.route, queryParamsHandling: 'merge' });
            }
        }, 1000)
    }

    triggerFormat(editorId: string) {
        this.jsonEditors?.find((editor) => editor.id === editorId)?.formatCode();
    }
}