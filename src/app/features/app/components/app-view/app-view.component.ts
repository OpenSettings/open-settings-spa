import { Component, Inject, OnDestroy, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ConfirmationDialogComponent } from "../../../../shared/components/confirmation-dialog/confirmation-dialog.component";
import { AppIdentifierMappingsService, UpdateAppIdentifierMappingSortOrderResponse } from "../../../../shared/services/app-identifier-mappings.service";
import { AppsService } from "../../services/apps.service";
import { DummyComponentService } from "../../../../shared/components/dummy/dummy-component.service";
import { config, Observable, of, Subscription, switchMap, tap } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { APP_VIEW_ROUTES, APP_VIEW_ROUTES_TYPE } from "../../app-routes";
import { DummyComponentServiceModel } from "../../../../shared/components/dummy/dummy-component-service.model";
import { AppViewService } from "../../services/app-view.service";
import { AppViewComponentModel } from "../../models/app-view-component.model";
import { InstanceListComponentData } from "../../../instance/models/instance-list-component-data";
import { SettingListComponentData } from "../../../setting/models/setting-list-component-data";
import { CopySettingToIdentifierEmitData } from "../../../setting/models/copy-setting-to-identifier-emit-data";
import { IResponse } from "../../../../shared/models/response";
import { GetGroupedAppDataResponse } from "../../models/get-grouped-app-data-response";
import { GetGroupedAppDataResponseIdentifier } from "../../models/get-grouped-app-data-response-identifier";
import { GetGroupedAppDataResponseSetting } from "../../models/get-grouped-app-data-response-setting";
import { SettingData } from "../../models/setting-data.model";
import { AppIdentifierAddComponentModel, AppIdentifierAddComponentReturnModel, IdentifierMappingCreateComponent } from "../../../setting/components/identifier-mapping-create/identifier-mapping-create.component";
import { GetIdentifiersResponseIdentifier } from "../../../identifier/models/get-identifiers-response-identifier";
import { CopyAppSettingToComponentReturnModel, CopySettingToIdentifierComponentModel, SettingCopyToComponent } from "../../../setting/components/setting-copy-to/setting-copy-to.component";
import { GetGroupedAppDataResponseInstance } from "../../models/get-grouped-app-data-response-instance";
import { InstanceData } from "../../models/instance-data.model";
import { UtilityService } from "../../../../shared/services/utility.service";
import { SettingsService } from "../../../setting/services/setting.service";
import { HttpErrorResponse } from "@angular/common/http";
import { ConfigurationUpdateComponentData } from "../../../configuration/models/configuration-update-component-data";
import { GetGroupedAppDataResponseConfiguration } from "../../models/get-grouped-app-data-response-configuration";
import { ConfigurationsService } from "../../../configuration/services/configurations.service";

@Component({
    templateUrl: './app-view.component.html',
    styleUrls: ['./app-view.component.css']
})
export class AppViewComponent implements OnInit, OnDestroy {

    appData: GetGroupedAppDataResponse = {
        identifierInfo: { minSortOrder: 0, maxSortOrder: 0, mappingMinSortOrder: 0, mappingMaxSortOrder: 0 },
        identifierIdToIdentifier: {},
        identifierIdToConfiguration: {},
        identifierIdToSettings: {},
        identifierIdToInstances: {}
    };

    identifierIdToSettingsDataMap: { [key: string]: SettingData[] } = {};
    identifierIdToInstancesDataMap: { [key: string]: InstanceData[] } = {};

    selectedIdentifierId: string = '';
    previousSelectedIdentifierId: string = '';

    tabIndex?: ViewTab;
    isFullScreen: boolean = false;
    settingListComponentData?: SettingListComponentData;
    selectedInstanceId?: string;
    appInstanceListComponentData?: InstanceListComponentData;
    configurationUpdateComponentData?: ConfigurationUpdateComponentData;
    isLoaded: boolean = false;

    private subscriptions = new Subscription();

    constructor(public dialogRef: MatDialogRef<AppViewComponent>,
        @Inject(MAT_DIALOG_DATA) public data: AppViewComponentModel,
        private appsService: AppsService,
        private configurationsService: ConfigurationsService,
        private settingsService: SettingsService,
        private appIdentifierMappingsService: AppIdentifierMappingsService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar,
        private dummyComponentService: DummyComponentService,
        private appViewService: AppViewService,
        private utilityService: UtilityService,
        private route: ActivatedRoute,
        private router: Router) {
    }

    ngOnInit(): void {
        this.handleRouting(this.loadData$());
    }

    ngOnDestroy(): void {
        this.appViewService.emitSettingView(undefined);
        this.subscriptions.unsubscribe();
    }

    get identifiers() {
        return this.sortIdentifiers(Object.values(this.appData.identifierIdToIdentifier));
    }

    loadDefaultBehavior() {
        const identifiers = this.identifiers;

        if (identifiers.length == 0) {
            this.createIdentifier('Add an identifier to start');
            return;
        }

        const identifierId = identifiers[0].id;

        switch (this.tabIndex) {
            case ViewTab.Configuration:


                setTimeout(() => {
                    this.router.navigate(['./apps', this.data.appSlug, identifierId, 'configuration'], { relativeTo: this.route, queryParamsHandling: 'merge' });
                }, 150);

                break;

            case ViewTab.Instances:

                setTimeout(() => {
                    this.router.navigate(['./apps', this.data.appSlug, identifierId, 'instances'], { relativeTo: this.route, queryParamsHandling: 'merge' });
                }, 150);

                break;

            case ViewTab.Settings:

                setTimeout(() => {
                    this.router.navigate(['./apps', this.data.appSlug, identifierId, 'settings'], { relativeTo: this.route, queryParamsHandling: 'merge' });
                }, 150);

                break;
        }

        this.changeIdentifier(identifierId);
    }

    viewNewIdentifierMapping() {
        const viewNewIdentifierMappingObservable = this.loadData$().pipe(tap(() => {
            this.createIdentifier();
        }));
        this.subscriptions.add(viewNewIdentifierMappingObservable.subscribe());
    }

    viewSetting(event: DummyComponentServiceModel) {
        this.tabIndex = ViewTab.Settings;

        const viewSettingUpdateParamSubscription = event.activatedRoute.paramMap.subscribe(params => {

            const identifierId = params.get('identifierId');

            if (!identifierId) {
                this.loadDefaultBehavior();
                this.router.navigate(['./apps', this.data.appSlug], { relativeTo: this.route, queryParamsHandling: 'merge' });
                return;
            }

            const settingId = params.get('settingId');

            if (!settingId) {
                this.router.navigate(['./apps', this.data.appSlug, identifierId, 'settings'], { relativeTo: this.route, queryParamsHandling: 'merge' });
                return;
            }

            const observable = this.loadData$().pipe(tap(() => {
                if (!(identifierId in this.appData.identifierIdToSettings)) {
                    this.loadDefaultBehavior();
                    return;
                }

                const setting = this.appData.identifierIdToSettings[identifierId].find(s => s.id === settingId);

                if (setting) {
                    this.appViewService.emitSettingView({
                        selectedSettingId: setting.id,
                        settingViewType: 'viewSetting'
                    });
                } else {
                    this.router.navigate(['./apps', this.data.appSlug, identifierId, 'settings'], { relativeTo: this.route, queryParamsHandling: 'merge' });
                }

                this.changeIdentifier(identifierId);
            }));

            this.subscriptions.add(observable.subscribe());
        });

        this.subscriptions.add(viewSettingUpdateParamSubscription);
    }

    viewCreateSetting(event: DummyComponentServiceModel) {
        this.tabIndex = ViewTab.Settings;
        const subscription = event.activatedRoute.paramMap.subscribe(params => {
            const identifierId = params.get('identifierId');
            if (!identifierId) {
                this.loadDefaultBehavior();
                this.router.navigate(['./apps', this.data.appSlug], { relativeTo: this.route, queryParamsHandling: 'merge' });
                return;
            }
            const observable = this.loadData$().pipe(tap(() => {
                if (!(identifierId in this.appData.identifierIdToSettings)) {
                    this.loadDefaultBehavior();
                    return;
                }
                this.appViewService.emitSettingView({
                    selectedSettingId: this.appViewService.settingView?.selectedSettingId,
                    settingViewType: 'viewCreateSetting'
                });
                this.changeIdentifier(identifierId);
            }));
            this.subscriptions.add(observable.subscribe());
        });
        this.subscriptions.add(subscription);
    }

    viewUpdateSetting(event: DummyComponentServiceModel) {
        this.tabIndex = ViewTab.Settings;
        const subscription = event.activatedRoute.paramMap.subscribe(params => {
            const identifierId = params.get('identifierId');
            if (!identifierId) {
                this.loadDefaultBehavior();
                this.router.navigate(['./apps', this.data.appSlug], { relativeTo: this.route, queryParamsHandling: 'merge' });
                return;
            }
            const settingId = params.get('settingId');
            if (!settingId) {
                this.router.navigate(['./apps', this.data.appSlug, identifierId, 'settings'], { relativeTo: this.route, queryParamsHandling: 'merge' });
                return;
            }
            const observable = this.loadData$().pipe(tap(() => {
                const settings = this.appData.identifierIdToSettings[identifierId];
                if (!settings) {
                    this.loadDefaultBehavior();
                    return;
                }

                const setting = settings.find(s => s.id === settingId);

                if (!setting) {
                    const internalSubscription = this.updateSetting(settingId)?.subscribe((response) => {

                        if (response) {
                            this.appViewService.emitSettingView({
                                settingViewType: 'viewUpdateSetting',
                                selectedSettingId: settingId
                            });
                            this.changeIdentifier(identifierId);
                        }
                        else {
                            this.loadDefaultBehavior();
                        }
                    });

                    if (internalSubscription) {
                        this.subscriptions.add(internalSubscription);
                    }
                } else {
                    this.appViewService.emitSettingView({
                        settingViewType: 'viewUpdateSetting',
                        selectedSettingId: setting.id
                    });
                    this.changeIdentifier(identifierId);
                }
            }));
            this.subscriptions.add(observable.subscribe());
        });
        this.subscriptions.add(subscription);
    }

    viewCopySettingTo(event: DummyComponentServiceModel) {
        this.tabIndex = ViewTab.Settings;
        const subscription = event.activatedRoute.paramMap.subscribe(params => {
            const identifierId = params.get('identifierId');
            if (!identifierId) {
                this.loadDefaultBehavior();
                this.router.navigate(['./apps', this.data.appSlug], { relativeTo: this.route, queryParamsHandling: 'merge' });
                return;
            }
            const settingId = params.get('settingId');
            if (!settingId) {
                this.router.navigate(['./apps', this.data.appSlug, identifierId, 'settings'], { relativeTo: this.route, queryParamsHandling: 'merge' });
                return;
            }
            const observable = this.loadData$().pipe(tap(() => {
                const settings = this.appData.identifierIdToSettings[identifierId];
                if (!settings) {
                    this.loadDefaultBehavior();
                    return;
                }
                let setting = settings.find(s => s.id === settingId);
                if (!setting) {
                    const settingInDataList = this.settingListComponentData?.settingDataList.find(s => s.settingId === settingId);
                    if (settingInDataList) {
                        setting = {
                            id: settingId,
                            computedIdentifier: settingInDataList.computedIdentifier,
                            class: {
                                id: settingInDataList.classId,
                                namespace: settingInDataList.classNamespace,
                                name: settingInDataList.className,
                                fullName: settingInDataList.classFullName,
                                rowVersion: ''
                            },
                            dataValidationDisabled: !settingInDataList.dataValidationEnabled,
                            dataRestored: settingInDataList.dataRestored,
                            version: settingInDataList.version,
                            rowVersion: '',
                            storeInSeparateFile: settingInDataList.storeInSeparateFile,
                            ignoreOnFileChange: settingInDataList.ignoreOnFileChange,
                            registrationMode: settingInDataList.registrationMode
                        };
                        settings.push(setting);
                    } else {
                        this.loadDefaultBehavior();
                        return;
                    }
                }
                this.appViewService.emitSettingView({
                    settingViewType: 'viewCopySettingTo',
                    selectedSettingId: setting.id
                });
                this.changeIdentifier(identifierId);
            }));
            this.subscriptions.add(observable.subscribe());
        });
        this.subscriptions.add(subscription);
    }

    viewSettingHistories(event: DummyComponentServiceModel) {
        this.tabIndex = ViewTab.Settings;
        const subscription = event.activatedRoute.paramMap.subscribe(params => {
            const identifierId = params.get('identifierId');
            if (!identifierId) {
                this.loadDefaultBehavior();
                this.router.navigate(['./apps', this.data.appSlug], { relativeTo: this.route, queryParamsHandling: 'merge' });
                return;
            }
            const settingId = params.get('settingId');
            if (!settingId) {
                this.router.navigate(['./apps', this.data.appSlug, identifierId, 'settings'], { relativeTo: this.route, queryParamsHandling: 'merge' });
                return;
            }
            const observable = this.loadData$().pipe(tap(() => {
                const settings = this.appData.identifierIdToSettings[identifierId];
                if (!settings) {
                    this.loadDefaultBehavior();
                    return;
                }
                const setting = settings.find(s => s.id === settingId);
                if (!setting) {
                    this.loadDefaultBehavior();
                    return;
                }
                this.appViewService.emitSettingView({
                    settingViewType: 'viewSettingHistories',
                    selectedSettingId: setting.id
                });
                this.changeIdentifier(identifierId);
            }));
            this.subscriptions.add(observable.subscribe());
        });
        this.subscriptions.add(subscription);
    }

    viewSettingHistory(event: DummyComponentServiceModel) {
        this.tabIndex = ViewTab.Settings;
        const subscription = event.activatedRoute.paramMap.subscribe(params => {
            const identifierId = params.get('identifierId');
            if (!identifierId) {
                this.loadDefaultBehavior();
                this.router.navigate(['./apps', this.data.appSlug], { relativeTo: this.route, queryParamsHandling: 'merge' });
                return;
            }
            const settingId = params.get('settingId');
            if (!settingId) {
                this.router.navigate(['./apps', this.data.appSlug, identifierId, 'settings'], { relativeTo: this.route, queryParamsHandling: 'merge' });
                return;
            }
            var historyId = params.get('historyId');
            if (!historyId) {
                this.router.navigate(['./apps', this.data.appSlug, identifierId, 'settings', settingId, 'histories'], { relativeTo: this.route, queryParamsHandling: 'merge' });
                return;
            }
            const observable = this.loadData$().pipe(tap(() => {
                const settings = this.appData.identifierIdToSettings[identifierId];
                if (!settings) {
                    this.loadDefaultBehavior();
                    return;
                }
                const setting = settings.find(s => s.id === settingId);
                if (!setting) {
                    this.loadDefaultBehavior();
                    return;
                }
                this.appViewService.emitSettingView({
                    settingViewType: 'viewSettingHistory',
                    selectedSettingId: setting.id,
                    selectedHistoryId: historyId!
                });
                this.changeIdentifier(identifierId);
            }));
            this.subscriptions.add(observable.subscribe());
        });
        this.subscriptions.add(subscription);
    }

    viewInstance(event: DummyComponentServiceModel) {
        this.tabIndex = ViewTab.Instances;
        const subscription = event.activatedRoute.paramMap.subscribe(params => {
            const identifierId = params.get('identifierId');
            if (!identifierId) { // Fallback to route and subscribe then loaddefualt.
                this.loadDefaultBehavior();
                // this.router.navigate(['./apps', this.data.clientId, 'instances'], { relativeTo: this.route, queryParamsHandling: 'merge' });
                return;
            }
            const instanceId = params.get('instanceId');
            if (!instanceId) {
                this.loadDefaultBehavior();
                // this.router.navigate(['./apps', this.data.clientId, identifierId, 'instances'], { relativeTo: this.route, queryParamsHandling: 'merge' });
                return;
            }
            const viewSettingsObservable = this.loadData$().pipe(tap(() => {
                const settings = this.appData.identifierIdToSettings[identifierId];
                if (!settings) {
                    this.loadDefaultBehavior();
                    return;
                }
                this.selectedInstanceId = instanceId;
                this.tabIndex = ViewTab.Instances;
                // Notify instanceId to open
                this.changeIdentifier(identifierId);
            }));
            this.subscriptions.add(viewSettingsObservable.subscribe());
        });
        this.subscriptions.add(subscription);
    }

    viewTabs(event: DummyComponentServiceModel, viewTab: ViewTab) {
        const subscription = event.activatedRoute.paramMap.subscribe(params => {
            this.tabIndex = viewTab;
            const identifierId = params.get('identifierId');
            if (!identifierId) {
                this.loadDefaultSubscription();
                // this.router.navigate(['./apps', this.data.appSlug], { relativeTo: this.route, queryParamsHandling: 'merge' });
                return;
            }
            const viewSettingsObservable = this.loadData$().pipe(tap(() => {
                const settings = this.appData.identifierIdToSettings[identifierId];
                if (!settings) {
                    this.loadDefaultBehavior();
                    this.router.navigate(['./apps', this.data.appSlug], { relativeTo: this.route, queryParamsHandling: 'merge' });
                    return;
                }
                this.tabIndex = viewTab;
                this.changeIdentifier(identifierId);
            }));
            this.subscriptions.add(viewSettingsObservable.subscribe());
        });
        this.subscriptions.add(subscription);
    }

    loadDefaultSubscription() {
        const subscription = this.loadData$().pipe(tap(() => {
            this.loadDefaultBehavior();
        })).subscribe();
        this.subscriptions.add(subscription);
    }

    handleRouting(loadData$: Observable<IResponse<GetGroupedAppDataResponse> | null>): void {
        const subscription = this.dummyComponentService.event$.subscribe(event => {
            setTimeout(() => {
                if (event === undefined) {
                    if (!this.isLoaded) {
                        this.loadDefaultSubscription();
                    }
                    return;
                }
                switch (event.path) {
                    case APP_VIEW_ROUTES.viewNewIdentifierMapping:
                        this.viewNewIdentifierMapping();
                        break;
                    case APP_VIEW_ROUTES.viewSettings:
                    case APP_VIEW_ROUTES.viewSettings2:
                        this.viewTabs(event, ViewTab.Settings);
                        break;
                    case APP_VIEW_ROUTES.viewSetting:
                        this.viewSetting(event);
                        break;
                    case APP_VIEW_ROUTES.viewCreateSetting:
                        this.viewCreateSetting(event);
                        break;
                    case APP_VIEW_ROUTES.viewUpdateSetting:
                        this.viewUpdateSetting(event);
                        break;
                    case APP_VIEW_ROUTES.viewCopySettingTo:
                        this.viewCopySettingTo(event);
                        break;
                    case APP_VIEW_ROUTES.viewSettingHistories:
                        this.viewSettingHistories(event);
                        break;
                    case APP_VIEW_ROUTES.viewSettingHistory:
                        this.viewSettingHistory(event);
                        break;
                    case APP_VIEW_ROUTES.viewInstances:
                    case APP_VIEW_ROUTES.viewInstances2:
                        this.viewTabs(event, ViewTab.Instances);
                        break;
                    case APP_VIEW_ROUTES.viewInstance:
                        this.viewInstance(event);
                        break;
                    case APP_VIEW_ROUTES.viewConfiguration:
                        this.viewTabs(event, ViewTab.Configuration);
                        break;
                    default:
                        this.loadDefaultSubscription();
                        break;
                }
            }, 0);
        });
        this.subscriptions.add(subscription);
    }

    onIdentifierChanged(event: any) {

        this.previousSelectedIdentifierId = this.selectedIdentifierId;

        if (!event.source.value) {
            event.preventDefault();
            return;
        }

        if (event.isUserInput && this.selectedIdentifierId !== event.source.value) {

            this.appViewService.emitSettingView(undefined);

            if (!(event.source.value in this.appData.identifierIdToSettings)) {
                return;
            }

            this.changeIdentifier(event.source.value);

            const settingView = this.appViewService.settingView;

            if (settingView) {

                switch (settingView.settingViewType) {
                    case 'viewCreateSetting':
                        this.router.navigate(['./apps', this.data.appSlug, event.source.value, 'settings', 'new'], { relativeTo: this.route, queryParamsHandling: 'merge' });
                        return;
                }

                const selectedSettingId = settingView.selectedSettingId;

                if (selectedSettingId) {
                    switch (this.appViewService.settingView!.settingViewType) {
                        case 'viewUpdateSetting':
                            this.router.navigate(['./apps', this.data.appSlug, event.source.value, 'settings', selectedSettingId, 'update'], { relativeTo: this.route, queryParamsHandling: 'merge' });
                            return;
                        case 'viewCopySettingTo':
                            this.router.navigate(['./apps', this.data.appSlug, event.source.value, 'settings', selectedSettingId, 'copyTo'], { relativeTo: this.route, queryParamsHandling: 'merge' });
                            return;
                        case 'viewSettingHistories':
                            this.router.navigate(['./apps', this.data.appSlug, event.source.value, 'settings', selectedSettingId, 'histories'], { relativeTo: this.route, queryParamsHandling: 'merge' });
                            return;
                        case 'viewSettingHistory':
                            const historyId = settingView.selectedHistoryId;
                            this.router.navigate(['./apps', this.data.appSlug, event.source.value, 'settings', selectedSettingId, 'histories', historyId], { relativeTo: this.route, queryParamsHandling: 'merge' });
                            return;
                        default:
                            this.router.navigate(['./apps', this.data.appSlug, event.source.value, 'settings', selectedSettingId], { relativeTo: this.route, queryParamsHandling: 'merge' });
                            return;
                    }
                }
            } else {

                switch (this.tabIndex) {
                    case ViewTab.Configuration:

                        setTimeout(() => {
                            this.router.navigate(['./apps', this.data.appSlug, event.source.value, 'configuration'], { relativeTo: this.route, queryParamsHandling: 'merge' });
                        }, 0);

                        break;

                    case ViewTab.Instances:

                        setTimeout(() => {
                            this.router.navigate(['./apps', this.data.appSlug, event.source.value, 'instances'], { relativeTo: this.route, queryParamsHandling: 'merge' });
                        }, 0);

                        break;

                    case ViewTab.Settings:

                        setTimeout(() => {
                            this.router.navigate(['./apps', this.data.appSlug, event.source.value, 'settings'], { relativeTo: this.route, queryParamsHandling: 'merge' });
                        }, 0);

                        break;
                }
            }
        }
    }

    changeIdentifier(settingIdenfierId: string) {
        this.selectedIdentifierId = settingIdenfierId;

        const settings = this.appData.identifierIdToSettings[settingIdenfierId];
        const instances = this.appData.identifierIdToInstances[settingIdenfierId];
        const configuration = this.appData.identifierIdToConfiguration[settingIdenfierId];

        this.updateSettingData(settingIdenfierId, settings);
        this.updateInstances(settingIdenfierId, instances);
        this.updateConfiguration(settingIdenfierId, configuration);
    }

    updateSettingData(identifierId: string, settings: GetGroupedAppDataResponseSetting[]) {
        const identifier = this.appData.identifierIdToIdentifier[identifierId];
        let settingsData = this.identifierIdToSettingsDataMap[identifierId];

        if (settingsData === undefined) {

            settingsData = this.identifierIdToSettingsDataMap[identifierId] = [];

            settings?.forEach(setting => {

                settingsData.push({
                    slug: this.data.appSlug,
                    clientId: this.data.clientId,
                    settingId: setting.id,
                    className: setting.class.name,
                    classNamespace: setting.class.namespace,
                    classFullName: setting.class.fullName,
                    classId: setting.class.id,
                    computedIdentifier: setting.computedIdentifier,
                    version: setting.version,
                    isDataFetched: false,
                    dataRestored: setting.dataRestored,
                    dataValidationEnabled: !setting.dataValidationDisabled,
                    rawData: '',
                    parsedData: {},
                    tempData: {},
                    settingRowVersion: setting.rowVersion,
                    classRowVersion: setting.class.rowVersion,
                    storeInSeparateFile: setting.storeInSeparateFile,
                    ignoreOnFileChange: setting.ignoreOnFileChange,
                    registrationMode: setting.registrationMode
                });
            });
        }

        this.settingListComponentData = {
            slug: this.data.appSlug,
            clientId: this.data.clientId,
            clientName: this.data.clientName,
            appId: this.data.appId,
            selectedAppIdentifierId: this.selectedIdentifierId,
            selectedAppIdentifierName: identifier.name,
            settingDataList: this.identifierIdToSettingsDataMap[this.selectedIdentifierId]
        };
    }

    updateInstances(identifierId: string, instances: GetGroupedAppDataResponseInstance[]) {

        let instancesData = this.identifierIdToInstancesDataMap[identifierId];

        if (instancesData === undefined) {

            instancesData = this.identifierIdToInstancesDataMap[identifierId] = [];

            instances?.forEach(instance => {

                instancesData.push({
                    id: instance.id,
                    dynamicId: instance.dynamicId,
                    name: instance.name,
                    urls: instance.urls,
                    isActive: instance.isActive,
                    ipAddress: instance.ipAddress,
                    machineName: instance.machineName,
                    environment: instance.environment,
                    reloadStrategies: instance.reloadStrategies,
                    serviceType: instance.serviceType,
                    version: instance.version,
                    createdOn: instance.createdOn,
                    updatedOn: instance.updatedOn
                });
            });
        }

        this.appInstanceListComponentData = {
            clientId: this.data.clientId,
            identifierId: identifierId,
            instances: instancesData
        };
    }

    updateConfiguration(identifierId: string, configuration: GetGroupedAppDataResponseConfiguration) {

        if (!configuration) {
            return;
        }

        this.configurationUpdateComponentData = {
            configurationId: configuration.id,
            appId: this.data.appId,
            selectedIdentifierId: identifierId,
            storeInSeparateFile: configuration.storeInSeparateFile,
            ignoreOnFileChange: configuration.ignoreOnFileChange,
            registrationMode: configuration.registrationMode,
            consumer: configuration.consumer,
            provider: configuration.provider,
            rowVersion: configuration.rowVersion
        };
    }

    onTabChange(index: ViewTab) {
        if (this.selectedIdentifierId === undefined) {
            return;
        }

        this.tabIndex = index;

        switch (index) {
            case ViewTab.Settings:

                const settings = this.appData.identifierIdToSettings[this.selectedIdentifierId];

                if (settings) {
                    this.updateSettingData(this.selectedIdentifierId, settings);

                    // todo: setting id - selected

                    setTimeout(() => {
                        this.router.navigate(['./apps', this.data.appSlug, this.selectedIdentifierId, 'settings'], { relativeTo: this.route, queryParamsHandling: 'merge' })
                    }, 55);
                }

                break;

            case ViewTab.Instances:

                const instances = this.appData.identifierIdToInstances[this.selectedIdentifierId];

                this.updateInstances(this.selectedIdentifierId, instances);

                setTimeout(() => {
                    if (this.selectedInstanceId) {
                        this.router.navigate(['./apps', this.data.appSlug, this.selectedIdentifierId, 'instances', this.selectedInstanceId], { relativeTo: this.route, queryParamsHandling: 'merge' });
                    } else {
                        this.router.navigate(['./apps', this.data.appSlug, this.selectedIdentifierId, 'instances'], { relativeTo: this.route, queryParamsHandling: 'merge' });
                    }
                }, 55);

                break;

            case ViewTab.Configuration:

                const configuration = this.appData.identifierIdToConfiguration[this.selectedIdentifierId];

                this.updateConfiguration(this.selectedIdentifierId, configuration);

                setTimeout(() => {
                    this.router.navigate(['./apps', this.data.appSlug, this.selectedIdentifierId, 'configuration'], { relativeTo: this.route, queryParamsHandling: 'merge' });
                }, 55);

                break;
        }
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

    createIdentifier(title?: string) {
        const identifiers = this.identifiers.map(g => ({
            id: g.id,
            name: g.name
        })) as GetIdentifiersResponseIdentifier[];

        const data: AppIdentifierAddComponentModel = {
            clientName: this.data.clientName,
            appSlug: this.data.appSlug,
            appId: this.data.appId,
            identifiers,
            title
        };

        const reloadIdentifier = (identifierId: string): Observable<unknown> => {
            return this.appsService.getGroupedAppDataByAppIdAndIdentifierId({
                appIdOrSlug: data.appId,
                identifierIdOrSlug: identifierId
            }).pipe(switchMap(response => {

                const responseData = response.data;

                if (!responseData) {
                    return of(null);
                }

                this.appData.identifierIdToIdentifier[identifierId] = responseData.identifier;
                this.appData.identifierIdToConfiguration[identifierId] = responseData.configuration;
                this.appData.identifierIdToSettings[identifierId] = responseData.settings;
                this.appData.identifierIdToInstances[identifierId] = responseData.instances

                if (this.appData.identifierInfo) {
                    this.appData.identifierInfo.minSortOrder = Math.min(this.appData.identifierInfo.minSortOrder, responseData.identifier.sortOrder);
                    this.appData.identifierInfo.maxSortOrder = Math.max(this.appData.identifierInfo.maxSortOrder, responseData.identifier.sortOrder);

                    this.appData.identifierInfo.mappingMinSortOrder = Math.min(this.appData.identifierInfo.mappingMinSortOrder, responseData.identifier.mappingSortOrder);
                    this.appData.identifierInfo.mappingMaxSortOrder = Math.max(this.appData.identifierInfo.mappingMaxSortOrder, responseData.identifier.mappingSortOrder);
                } else {
                    this.appData.identifierInfo = {
                        minSortOrder: responseData.identifier.sortOrder,
                        maxSortOrder: responseData.identifier.sortOrder,
                        mappingMinSortOrder: responseData.identifier.mappingSortOrder,
                        mappingMaxSortOrder: responseData.identifier.mappingSortOrder
                    };
                }

                this.changeIdentifier(identifierId);

                return of(null);
            }));
        }

        const subscription = this.dialog.open(IdentifierMappingCreateComponent, {
            data,
            width: '500px',
            height: '170',
            minWidth: 'inherit',
            maxWidth: 'inherit',
            autoFocus: false
        }).afterClosed().subscribe((result: AppIdentifierAddComponentReturnModel) => {
            if (result && !this.appData.identifierIdToSettings[result.identifierId]) {

                const secondSubscription = reloadIdentifier(result.identifierId).subscribe(() => {

                    let tabName;

                    switch (this.tabIndex) {
                        case ViewTab.Configuration:
                            tabName = 'configuration';
                            break;
                        case ViewTab.Instances:
                            tabName = 'instances';
                            break;
                        case ViewTab.Settings:
                            tabName = 'settings';
                            break;
                    }

                    this.router.navigate(['./apps', this.data.appSlug, result.identifierId, tabName], { relativeTo: this.route, queryParamsHandling: 'merge' });
                });

                this.subscriptions.add(secondSubscription);

            } else if (title) {
                this.router.navigate(['apps']);
                this.dialogRef.close();
            } else {

                if (this.previousSelectedIdentifierId in this.identifiers) {
                    if (this.tabIndex === ViewTab.Settings) {
                        const selectedSettingId = this.appViewService.settingView?.selectedSettingId;
                        if (selectedSettingId) {
                            this.router.navigate(['./apps', this.data.appSlug, this.previousSelectedIdentifierId, 'settings', selectedSettingId], { relativeTo: this.route, queryParamsHandling: 'merge' });
                        } else {
                            this.router.navigate(['./apps', this.data.appSlug, this.previousSelectedIdentifierId, 'settings'], { relativeTo: this.route, queryParamsHandling: 'merge' });
                        }
                    } else if (this.tabIndex === ViewTab.Instances) {
                        this.router.navigate(['./apps', this.data.appSlug, this.previousSelectedIdentifierId, 'instances'], { relativeTo: this.route, queryParamsHandling: 'merge' });
                    } else {
                        this.router.navigate(['./apps', this.data.appSlug, this.previousSelectedIdentifierId, 'configuration'], { relativeTo: this.route, queryParamsHandling: 'merge' });
                    }

                    this.changeIdentifier(this.previousSelectedIdentifierId);
                } else {
                    this.router.navigate(['./apps', this.data.appSlug, 'settings'], { relativeTo: this.route, queryParamsHandling: 'merge' });
                }
            }
        });

        this.subscriptions.add(subscription);
    }

    onSettingDeleteEmitted(settingId: string) {

        const settings = this.appData.identifierIdToSettings[this.selectedIdentifierId];

        if (!settings) {
            return;
        }

        const settingIndex = settings.findIndex(i => i.id === settingId);

        if (settingIndex === -1) {
            return;
        }

        settings.splice(settingIndex, 1);

        const settingsDataSource = this.identifierIdToSettingsDataMap[this.selectedIdentifierId]

        if (!settingsDataSource) {
            return;
        }

        const settingDataSourceIndex = settingsDataSource.findIndex(i => i.settingId === settingId);

        if (settingDataSourceIndex === -1) {
            return;
        }

        settingsDataSource.splice(settingDataSourceIndex, 1);
    }

    onConfigUpdateEmitted(data: any) {

        if (!this.configurationUpdateComponentData) {
            return;
        }

        const configuration = this.appData.identifierIdToConfiguration[this.selectedIdentifierId];

        configuration.rowVersion = this.configurationUpdateComponentData.rowVersion = data.rowVersion;

        if (data.formControlName) {
            switch (data.formControlName) {

                case 'storeInSeparateFile':
                    configuration.storeInSeparateFile = this.configurationUpdateComponentData.storeInSeparateFile = data.storeInSeparateFile;
                    break;

                case 'ignoreOnFileChange':
                    configuration.ignoreOnFileChange = this.configurationUpdateComponentData.ignoreOnFileChange = data.ignoreOnFileChange;
                    break;

                case 'registrationMode':
                    configuration.registrationMode = this.configurationUpdateComponentData.registrationMode = data.registrationMode;
                    break;

                case 'consumer':
                    configuration.consumer = this.configurationUpdateComponentData.consumer = data.consumer;
                    break;

                case 'provider':
                    configuration.provider = this.configurationUpdateComponentData.provider = data.provider;
                    break;
            }
        } else {
            configuration.storeInSeparateFile = this.configurationUpdateComponentData.storeInSeparateFile = data.storeInSeparateFile;
            configuration.ignoreOnFileChange = this.configurationUpdateComponentData.ignoreOnFileChange = data.ignoreOnFileChange;
            configuration.registrationMode = this.configurationUpdateComponentData.registrationMode = data.registrationMode;
            configuration.consumer = this.configurationUpdateComponentData.consumer = data.consumer;
            configuration.provider = this.configurationUpdateComponentData.provider = data.provider;
        }
    }

    fetchLatestEmitted(settingId: string) {

        const subscription = this.updateSetting(settingId)?.subscribe((isSuccess) => {
            if (isSuccess) {
                this.snackBar.open(`Latest data fetched successfully!`, 'Close', {
                    horizontalPosition: 'right',
                    verticalPosition: 'top',
                    duration: 5000
                });
            }
        })

        if (subscription) {
            this.subscriptions.add(subscription);
        }
    }

    updateSetting(settingId: string) {
        const settings = this.appData.identifierIdToSettings[this.selectedIdentifierId];

        if (!settings) {
            return;
        }

        let setting = settings.find(i => i.id === settingId)

        return this.settingsService.getSettingById({ settingId }).pipe(switchMap((response) => {

            if (!response.data || response.data.identifierId !== this.selectedIdentifierId) {
                return of(null);
            }

            if (!setting) {
                setting = {
                    id: settingId,
                    computedIdentifier: response.data.computedIdentifier,
                    dataRestored: response.data.dataRestored,
                    registrationMode: response.data.registrationMode,
                    dataValidationDisabled: response.data.dataValidationDisabled,
                    storeInSeparateFile: response.data.storeInSeparateFile,
                    ignoreOnFileChange: response.data.ignoreOnFileChange,
                    version: response.data.version,
                    rowVersion: response.data.rowVersion,
                    class: {
                        id: response.data.class.id,
                        namespace: response.data.class.namespace,
                        name: response.data.class.name,
                        fullName: response.data.class.fullName,
                        rowVersion: response.data.class.rowVersion
                    }
                };

                settings.push(setting);
            } else {
                setting.computedIdentifier = response.data.computedIdentifier;
                setting.dataRestored = response.data.dataRestored;
                setting.registrationMode = response.data.registrationMode;
                setting.dataValidationDisabled = response.data.dataValidationDisabled;
                setting.storeInSeparateFile = response.data.storeInSeparateFile;
                setting.ignoreOnFileChange = response.data.ignoreOnFileChange;
                setting.version = response.data.version;
                setting.rowVersion = response.data.rowVersion;
                setting.class.id = response.data.class.id;
                setting.class.namespace = response.data.class.namespace;
                setting.class.name = response.data.class.name;
                setting.class.fullName = response.data.class.fullName;
                setting.class.rowVersion = response.data.class.rowVersion;
            }

            const settingsData = this.identifierIdToSettingsDataMap[this.selectedIdentifierId];

            let settingData = settingsData.find(s => s.settingId === settingId);

            let parsedData, tempData;

            try {
                parsedData = JSON.parse(response.data.data)
            }
            catch {
                parsedData = {};
            }

            tempData = { ...parsedData };

            if (!settingData) {

                settingData = {
                    slug: this.data.appSlug,
                    clientId: this.data.clientId,
                    settingId: settingId,
                    computedIdentifier: response.data.computedIdentifier,
                    dataRestored: response.data.dataRestored,
                    registrationMode: response.data.registrationMode,
                    dataValidationEnabled: !response.data.dataValidationDisabled,
                    storeInSeparateFile: response.data.storeInSeparateFile,
                    ignoreOnFileChange: response.data.ignoreOnFileChange,
                    version: response.data.version,
                    settingRowVersion: response.data.rowVersion,
                    classId: response.data.class.id,
                    classNamespace: response.data.class.namespace,
                    className: response.data.class.name,
                    classFullName: response.data.class.fullName,
                    classRowVersion: response.data.class.rowVersion,
                    isDataFetched: true,
                    rawData: response.data.data,
                    parsedData,
                    tempData,
                }

                settingsData.push(settingData);
            } else {
                settingData.computedIdentifier = setting.computedIdentifier;
                settingData.dataRestored = setting.dataRestored;
                settingData.registrationMode = setting.registrationMode;
                settingData.dataValidationEnabled = !setting.dataValidationDisabled;
                settingData.storeInSeparateFile = setting.storeInSeparateFile;
                settingData.ignoreOnFileChange = setting.ignoreOnFileChange;
                settingData.version = setting.version;
                settingData.settingRowVersion = setting.rowVersion;
                settingData.classNamespace = setting.class.namespace;
                settingData.className = setting.class.name;
                settingData.classFullName = setting.class.fullName;
                settingData.classRowVersion = setting.class.rowVersion;
                settingData.isDataFetched = true;
                settingData.rawData = response.data.data;
                settingData.parsedData = parsedData;
                settingData.tempData = tempData;
            }

            return of(true);
        }));
    }

    onInstanceDeleted(instanceId: string) {
        const model = this.appData.identifierIdToInstances[this.selectedIdentifierId];

        if (!model) {
            return;
        }

        const index = model.findIndex(m => m.id === instanceId);

        if (index === -1) {
            return;
        }

        model.splice(index, 1);
    }

    copySettingToIdentifierEmitted(emitData: CopySettingToIdentifierEmitData) {
        // this.appViewService.emitSettingView({
        //     selectedSettingId: this.appViewService.settingView?.selectedSettingId,
        //     settingViewType: 'viewCopySettingTo'
        // });

        const notAvailableAppIdentifiers = Object.entries(this.appData.identifierIdToSettings)
            .filter(g => g[1].some(i => i.computedIdentifier == emitData.computedIdentifier))
            .map(g => {

                const identifier = this.appData.identifierIdToIdentifier[g[0]];

                return ({
                    id: identifier.id,
                    name: identifier.name
                });
            }) as GetIdentifiersResponseIdentifier[];

        const data: CopySettingToIdentifierComponentModel = {
            clientId: this.data.clientId,
            clientName: this.data.clientName,
            computedIdentifier: emitData.computedIdentifier,
            className: emitData.className,
            appId: this.data.appId,
            currentSettingId: emitData.currentSettingId,
            currentAppIdentifierName: emitData.currentAppIdentifierName,
            currentAppIdentifierId: emitData.currentAppIdentifierId,
            notAvailableAppIdentifiers: notAvailableAppIdentifiers
        }

        const subscription = this.dialog.open(SettingCopyToComponent, {
            data,
            width: '500px',
            height: '240px',
            minWidth: 'inherit',
            maxWidth: 'inherit',
            autoFocus: false
        }).afterClosed().subscribe((result: CopyAppSettingToComponentReturnModel) => {

            const selectedSettingId = result?.settingId ?? (emitData.isExpanded ? this.appViewService.settingView?.selectedSettingId : undefined);

            if (result === undefined) {
                if (selectedSettingId) {
                    this.router.navigate(['./apps', this.data.appSlug, this.selectedIdentifierId, 'settings', selectedSettingId], { relativeTo: this.route, queryParamsHandling: 'merge' });
                } else {
                    this.router.navigate(['./apps', this.data.appSlug, this.selectedIdentifierId, 'settings'], { relativeTo: this.route, queryParamsHandling: 'merge' });
                }

                return;
            }

            if (data.clientId !== result.clientId) {
                this.dialogRef.close();

                setTimeout(() => {
                    if (selectedSettingId) {
                        this.router.navigate(['./apps', result.appSlug, result?.identifierId ?? this.selectedIdentifierId, 'settings', selectedSettingId], { relativeTo: this.route, queryParamsHandling: 'merge' });
                    } else {
                        this.router.navigate(['./apps', result.appSlug, result?.identifierId ?? this.selectedIdentifierId, 'settings'], { relativeTo: this.route, queryParamsHandling: 'merge' });
                    }
                }, 500);

                return;
            } else {
                const configurationSubscription = this.configurationsService.getConfigurationByAppAndIdentifier({
                    appId: this.data.appId,
                    identifierId: result.identifierId
                }).subscribe({
                    next: (response) => {
                        const responseData = response.data;

                        if (!responseData) {
                            return;
                        }

                        this.appData.identifierIdToConfiguration[result.identifierId] = {
                            id: responseData.id,
                            storeInSeparateFile: responseData.storeInSeparateFile,
                            ignoreOnFileChange: responseData.ignoreOnFileChange,
                            registrationMode: responseData.registrationMode,
                            consumer: responseData.consumer,
                            provider: responseData.provider,
                            rowVersion: responseData.rowVersion
                        };
                    }
                });

                this.subscriptions.add(configurationSubscription);
            }

            let groupedSetting = this.appData.identifierIdToSettings[result.identifierId];

            if (!groupedSetting) {

                const identifier = {
                    id: result.identifierId,
                    name: result.identifierName,
                    sortOrder: result.identifierSortOrder,
                    mappingSortOrder: result.identifierMappingSortOrder,
                    mappingRowVersion: ''
                };

                this.appData.identifierIdToSettings[result.identifierId] = [];
                this.appData.identifierIdToIdentifier[result.identifierId] = identifier;

                groupedSetting = this.appData.identifierIdToSettings[result.identifierId];

                this.sortIdentifiers(Object.values(this.appData.identifierIdToIdentifier));
            }

            groupedSetting.push({
                id: result.settingId,
                version: '0',
                dataValidationDisabled: !emitData.isDataValidationEnabled,
                dataRestored: false,
                computedIdentifier: emitData.computedIdentifier,
                rowVersion: '',
                class: {
                    name: emitData.className,
                    namespace: emitData.classNamespace,
                    fullName: emitData.classFullName,
                    id: result.classId,
                    rowVersion: ''
                },
                storeInSeparateFile: emitData.storeInSeparateFile,
                ignoreOnFileChange: emitData.ignoreOnFileChange,
                registrationMode: emitData.registrationMode
            });

            let model = this.identifierIdToSettingsDataMap[result.identifierId];

            if (model === undefined) {
                this.updateSettingData(result.identifierId, groupedSetting);
                model = this.identifierIdToSettingsDataMap[result.identifierId];
            } else {
                model.push({
                    slug: this.data.appSlug,
                    clientId: this.data.clientId,
                    settingId: result.settingId,
                    className: emitData.className,
                    classNamespace: emitData.classNamespace,
                    classFullName: emitData.classFullName,
                    classId: result.classId,
                    computedIdentifier: emitData.computedIdentifier,
                    version: '0',
                    isDataFetched: true,
                    dataRestored: false,
                    dataValidationEnabled: emitData.isDataValidationEnabled,
                    rawData: emitData.rawData,
                    parsedData: emitData.parsedData,
                    tempData: { ...emitData.parsedData },
                    settingRowVersion: '',
                    classRowVersion: '',
                    storeInSeparateFile: emitData.storeInSeparateFile,
                    ignoreOnFileChange: emitData.ignoreOnFileChange,
                    registrationMode: emitData.registrationMode
                });
            }
            this.changeIdentifier(result.identifierId);

            this.appViewService.emitSettingView({
                selectedSettingId: result.settingId,
                settingViewType: 'viewSetting'
            });

            if (selectedSettingId) {
                this.router.navigate(['./apps', this.data.appSlug, result.identifierId, 'settings', result.settingId], { relativeTo: this.route, queryParamsHandling: 'merge' });
            } else {
                this.router.navigate(['./apps', this.data.appSlug, result.identifierId, 'settings'], { relativeTo: this.route, queryParamsHandling: 'merge' });
            }
        });

        this.subscriptions.add(subscription);
    }

    deleteIdentifier(key: string, event: Event) {
        event.stopPropagation();

        const title = 'Confirm delete';
        const message = `Are you sure you want to delete the "${key}" identifier? This action will remove the mapping, but existing settings will remain.`;

        const subscription = this.dialog.open(ConfirmationDialogComponent, {
            width: '500px',
            data: { title, message }
        }).afterClosed().subscribe(result => {
            if (result) {

                const identifier = this.appData.identifierIdToIdentifier[key];

                if (identifier) {

                    const internalSubscription = this.appIdentifierMappingsService.deleteAppIdentifierMapping({
                        appId: this.data.appId,
                        identifierId: key,
                        mappingRowVersion: identifier.mappingRowVersion
                    }).subscribe(() => {

                        this.snackBar.open(`Deleted successfully!`, 'Close', {
                            horizontalPosition: 'right',
                            verticalPosition: 'top',
                            duration: 5000
                        });

                        if (key in this.appData.identifierIdToIdentifier) {
                            delete this.appData.identifierIdToIdentifier[key];
                        }

                        if (key in this.appData.identifierIdToSettings) {
                            delete this.appData.identifierIdToSettings[key];
                        }

                        if (key in this.identifierIdToSettingsDataMap) {
                            delete this.identifierIdToSettingsDataMap[key];
                        }

                        if (key in this.appData.identifierIdToInstances) {
                            delete this.appData.identifierIdToInstances[key];
                        }

                        if (key in this.identifierIdToInstancesDataMap) {
                            delete this.identifierIdToInstancesDataMap[key];
                        }

                        this.calculateIdentifierInfo();

                        const keys = Object.keys(this.appData.identifierIdToSettings);

                        if (keys.length === 0) {
                            this.selectedIdentifierId = '';
                            this.settingListComponentData = undefined;
                            return;
                        }

                        if (this.selectedIdentifierId === key) {
                            const identifierId = keys[0];

                            this.changeIdentifier(identifierId);
                        }
                    });

                    this.subscriptions.add(internalSubscription);
                }
            }
        });

        this.subscriptions.add(subscription);
    }

    calculateIdentifierInfo() {

        const values = Object.values(this.appData.identifierIdToIdentifier);

        if (values.length === 0) {
            this.appData.identifierInfo = {
                minSortOrder: 0,
                maxSortOrder: 0,
                mappingMinSortOrder: 0,
                mappingMaxSortOrder: 0
            };
            return;
        }

        var firstValue = values[0];

        let minSortOrder = firstValue.sortOrder, maxSortOrder = firstValue.sortOrder, mappingMinOrder = firstValue.mappingSortOrder, mappingMaxOrder = firstValue.mappingSortOrder;

        values.forEach(value => {

            minSortOrder = Math.min(minSortOrder, value.sortOrder);
            maxSortOrder = Math.max(maxSortOrder, value.sortOrder);

            mappingMinOrder = Math.min(mappingMinOrder, value.mappingSortOrder);
            mappingMaxOrder = Math.max(mappingMaxOrder, value.mappingSortOrder);
        });

        this.appData.identifierInfo = {
            minSortOrder: minSortOrder,
            maxSortOrder: maxSortOrder,
            mappingMinSortOrder: mappingMinOrder,
            mappingMaxSortOrder: mappingMaxOrder
        };
    }

    moveSortOrder(identifierId: string, event: Event, ascent: boolean): void {

        event.stopPropagation();

        const identifier = this.appData.identifierIdToIdentifier[identifierId];

        const reloadIdentifiers = (): Observable<unknown> => {
            return this.appIdentifierMappingsService.getAppIdentifierMappingsByAppId({ appIdOrSlug: this.data.appId }).pipe(switchMap((response) => {
                const responseData = response.data

                if (!responseData) {
                    return of(null);
                }

                this.appData.identifierInfo = {
                    minSortOrder: responseData.minSortOrder,
                    maxSortOrder: responseData.maxSortOrder,
                    mappingMinSortOrder: responseData.mappingMinSortOrder,
                    mappingMaxSortOrder: responseData.mappingMaxSortOrder
                };

                responseData.identifiers.forEach(item => {

                    const identifier = this.appData.identifierIdToIdentifier[item.id];

                    if (identifier) {
                        identifier.mappingSortOrder = item.mappingSortOrder;
                        identifier.mappingRowVersion = item.mappingRowVersion;
                        identifier.sortOrder = item.sortOrder;
                    }
                });

                return of(null);
            }));
        }

        const subscription = this.appIdentifierMappingsService.updateAppIdentifierMappingSortOrder({
            appId: this.data.appId,
            identifierId: identifierId,
            body: {
                ascent: ascent,
                rowVersion: identifier.mappingRowVersion
            }
        }).subscribe({
            next: (resp) => {
                if (resp.status === 409 && resp.errors) {
                    this.utilityService.error(resp.errors, 3500);
                }

                this.subscriptions.add(reloadIdentifiers().subscribe());
            },
            error: (err: HttpErrorResponse) => {

                const error = err.error as IResponse<UpdateAppIdentifierMappingSortOrderResponse>;

                if (error) {

                    if (error.errors?.find(e => e.traces === 'MappingNotFound')) {

                        delete this.appData.identifierIdToInstances[identifierId];
                        delete this.appData.identifierIdToConfiguration[identifierId];
                        delete this.appData.identifierIdToIdentifier[identifierId];
                        delete this.appData.identifierIdToSettings[identifierId];

                        if (this.selectedIdentifierId === identifierId) {

                            const identifiers = this.identifiers;

                            if (identifiers.length == 0) {
                                this.createIdentifier('Add an identifier to start');
                                return;
                            }

                            const identifierId = identifiers[0].id;

                            this.changeIdentifier(identifierId);
                        }

                        this.subscriptions.add(reloadIdentifiers().subscribe());
                    }

                }
            }
        });

        this.subscriptions.add(subscription);
    }

    sortIdentifiers(identifiers: GetGroupedAppDataResponseIdentifier[]) {
        return identifiers.sort((a, b) => {
            if (a.mappingSortOrder !== b.mappingSortOrder) {
                return a.mappingSortOrder - b.mappingSortOrder;
            }

            if (a.sortOrder !== b.sortOrder) {
                return a.sortOrder - b.sortOrder;
            }

            return a.id.localeCompare(b.id);
        });
    }

    private loadData$(): Observable<IResponse<GetGroupedAppDataResponse> | null> {
        return of(null).pipe(
            switchMap(() => {
                if (this.isLoaded) {
                    return of(null);
                }
                return this.appsService.getGroupedAppDataByAppSlug({ appIdOrSlug: this.data.appSlug });
            }),
            tap((response) => {
                this.isLoaded = true;
                const responseData = response?.data;
                if (responseData) {
                    this.appData = responseData;
                }
            })
        );
    }
}

enum ViewTab {
    Settings = 0,
    Instances = 1,
    Configuration = 2
}