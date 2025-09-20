import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { AppUpdateComponent } from "../app-update/app-update.component";
import { MatSelect, MatSelectChange } from "@angular/material/select";
import { debounceTime, Subject, Subscription, } from "rxjs";
import { MatAccordion } from "@angular/material/expansion";
import { UtilityService } from "../../../../shared/services/utility.service";
import { WindowService } from "../../../../core/services/window.service";
import { DefaultLayoutService } from "../../../../shared/layouts/default-layout/default-layout.service";
import { AuthService } from "../../../../core/services/auth.service";
import { AppService } from "../../services/app.service";
import { GetGroupedAppsResponseApp } from "../../models/get-grouped-apps-response-app";
import { AppGroupService } from "../../../group/services/app-group.service";
import { AppCreateComponent } from "../app-create/app-create.component";
import { ConfirmationDialogComponent } from "../../../../shared/components/confirmation-dialog/confirmation-dialog.component";
import { AppViewComponent } from "../app-view/app-view.component";
import { AppEditComponentModel } from "../../models/app-edit-component.model";
import { AppEditComponentReturnModel } from "../../models/app-editor-component-return.model";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { DummyComponentService } from "../../../../shared/components/dummy/dummy-component.service";
import { APP_ROUTES } from "../../app-routes";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AppViewComponentModel } from "../../models/app-view-component.model";
import { ConfirmationDialogComponentModel } from "../../../../shared/components/confirmation-dialog/confirmation-dialog-component.model";
import { GetAppGroupsResponseGroup } from "../../../group/models/get-app-groups-response-group";

@Component({
    templateUrl: './app-list.component.html',
    styleUrls: ['./app-list.component.css']
})
export class AppListComponent implements OnInit, AfterViewInit, OnDestroy {
    groupedApps: { key: string, apps: GetGroupedAppsResponseApp[] }[] = [];
    groups: GetAppGroupsResponseGroup[] = [];
    isGroupsFetched: boolean = false;
    groupsCount: number = 0;
    appsCount: number = 0;
    appsFetched: boolean = false;
    queryParams: ({
        searchTerm: string | null;
        groupId: string | null;
    }) = {
            searchTerm: null,
            groupId: null
        };

    private searchTermSubject = new Subject<string>();
    isProvider: boolean = false;

    @ViewChild('groupSelect') groupSelect?: MatSelect;
    @ViewChild('searchTermInput') searchTermInput?: ElementRef<HTMLInputElement>;

    @ViewChild(MatAccordion) accordion!: MatAccordion;

    menuOpened: boolean = false;

    private subscriptions = new Subscription();
    private searchTermSubscription?: Subscription;
    private queryParamSubscription?: Subscription;

    isLoading: boolean = false;
    isConnectionSecure?: boolean;

    constructor(
        private cdr: ChangeDetectorRef,
        private dialog: MatDialog,
        private snackBar: MatSnackBar,
        private appsService: AppService,
        private groupsService: AppGroupService,
        private authService: AuthService,
        private utilityService: UtilityService,
        private windowService: WindowService,
        private defaultLayoutService: DefaultLayoutService,
        private dummyComponentService: DummyComponentService,
        private route: ActivatedRoute,
        private router: Router) {
    }

    ngOnInit(): void {
        this.isProvider = this.windowService.isProvider;
        this.handleRouting();
        this.setupMenusubscription();
        this.setupSearchTermSubscription();
        this.isConnectionSecure = this.windowService.isConnectionSecure;
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            this.setupQueryParams();
        })
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    setupMenusubscription() {
        const subscription = this.defaultLayoutService.menuOpened$.subscribe(menuOpened => this.menuOpened = menuOpened);

        this.subscriptions.add(subscription);
    }

    setupQueryParams() {

        if (this.queryParamSubscription) {
            return;
        }

        this.queryParamSubscription = this.route.queryParams.subscribe(params => {

            const searchTerm = this.getSearchTermFromRoute(params);
            const groupId = this.getGroupId(params);

            if (this.queryParams.searchTerm === searchTerm &&
                this.queryParams.groupId === groupId
            ) {
                return;
            }

            if(this.isProvider){
                this.queryParams.searchTerm = this.searchTermInput!.nativeElement.value = searchTerm;
                this.queryParams.groupId = this.groupSelect!.value = groupId;
            }

            this.loadData();
        });


        this.subscriptions.add(this.queryParamSubscription);
    }

    setupSearchTermSubscription() {

        if (this.searchTermSubscription) {
            return;
        }

        this.searchTermSubscription = this.searchTermSubject.pipe(
            debounceTime(300)
        ).subscribe(searchTerm => {
            this.queryParams.searchTerm = searchTerm;
            this.loadData();
        });

        this.subscriptions.add(this.searchTermSubscription);
    }

    getSearchTermFromRoute(params: Params) {
        let hasDifferentCaseSearchTerm = false;
        const filterKeys = Object.keys(params).filter(key => {
            const isMatches = key.toLocaleLowerCase() === 'searchterm';
            if (!hasDifferentCaseSearchTerm) {
                hasDifferentCaseSearchTerm = isMatches && key !== 'searchTerm';
            }
            return isMatches;
        });

        return filterKeys.length > 0
            ? hasDifferentCaseSearchTerm
                ? this.updateQueryParamsForSearchTerm(filterKeys, params)
                : params['searchTerm'] ?? ''
            : '';
    }

    getGroupId(params: Params): string {

        const groupId = params['groupId'] || '';

        if (groupId) {
            this.getGroups(groupId);
        }

        return groupId;
    }

    updateQueryParamsForSearchTerm(searchTermKeys: string[], params: any): string {
        let searchTerm = '';
        const updatedParams: { [key: string]: any } = {};

        searchTermKeys.forEach(key => {
            searchTerm += params[key] + ',';
            updatedParams[key] = null;
        });

        searchTerm = searchTerm.substring(0, searchTerm.length - 1);

        updatedParams['searchTerm'] = searchTerm;

        this.router.navigate([], {
            queryParams: updatedParams,
            queryParamsHandling: 'merge'
        });

        return searchTerm;
    }


    loadData(): void {
        this.startFetching();

        const fetchingSubscription = this.appsService.getGroupedApps({
            searchTerm: this.queryParams.searchTerm ?? undefined,
            groupId: this.queryParams.groupId
        }).subscribe({
            next: (response) => {
                if (!response.data) {
                    return;
                }

                this.groupedApps = this.mapGroupedAppsToArray(response.data.groupNameToApps);
                this.groupsCount = response.data.groupsCount;
                this.appsCount = response.data.appsCount;
                this.appsFetched = true;
            },
            error: () => {
                this.stopFetching(true);
            },
            complete: () => {
                this.stopFetching();
                this.updateUrl();
            }
        });

        this.subscriptions.add(fetchingSubscription);
    }

    startFetching() {
        this.isLoading = true;
    }

    stopFetching(hasError?: boolean) {
        this.isLoading = false;

        if (hasError) {
            return;
        }

        // if (this.dataSource.data.length > 0) {
        //     this.noResultsFound = false;
        //     this.message = '';
        //     return;
        // }

        // if (this.queryParams.searchTerm === '') {
        //     this.noResultsFound = true;
        //     this.message = 'No results found.';
        // } else {
        //     this.noResultsFound = false;
        //     this.message = '0 matches';
        // }
    }

    mapGroupedAppsToArray(groupedApps: { [key: string]: GetGroupedAppsResponseApp[] }): { key: string, apps: GetGroupedAppsResponseApp[] }[] {
        return Object.entries(groupedApps).map(([key, apps]) => ({ key, apps }));
    }

    getGroups(groupId?: string): void {
        if (this.isGroupsFetched || (this.authService.isAuthorizationRequired && !this.authService.isAuthenticated)) {
            return;
        }

        this.isGroupsFetched = true;

        const groupSubscription = this.groupsService.getAppGroups({ hasMappings: true }).subscribe({
            next: (response) => {
                this.groups = [
                    { id: "-1", name: "Filter > Ungrouped apps", sortOrder: 0, rowVersion: '' },
                    { id: "0", name: "Filter > Grouped apps", sortOrder: 0, rowVersion: '' },
                    ...response?.data?.appGroups ?? []
                ];
                this.cdr.detectChanges();
                if (!groupId) {
                    this.groupSelect?.open();
                }
            },
            error: () => {
                this.isGroupsFetched = false;
            }
        })

        this.subscriptions.add(groupSubscription);
    }

    applyFilter(event: Event): void {
        const searchTerm = (event.target as HTMLInputElement).value;

        if (searchTerm === this.queryParams.searchTerm) {
            return;
        }

        this.searchTermSubject.next(searchTerm);
    }

    onGroupChange(event: MatSelectChange): void {

        this.queryParams.groupId = event.value;

        this.loadData();
    }

    clearSelection() {

        if (this.queryParams.groupId === '' && this.queryParams.searchTerm === '') {
            return;
        }

        if(this.isProvider){
            this.queryParams.groupId = this.groupSelect!.value = '';
            this.searchTermInput!.nativeElement.value = this.queryParams.searchTerm = '';
        }
        
        this.loadData();
    }

    updateUrl(): void {
        this.router.navigate([], {
            queryParams: {
                searchTerm: this.queryParams.searchTerm === '' ? null : this.queryParams.searchTerm,
                groupId: this.queryParams.groupId === '' ? null : this.queryParams.groupId
            },
            queryParamsHandling: 'merge'
        });
    }

    handleRouting(): void {
        const dummyComponentSubscription = this.dummyComponentService.event$.subscribe(event => {
            setTimeout(() => {
                if (event === undefined) {
                    return;
                }

                switch (event.path) {

                    case APP_ROUTES.create:
                        this.add();
                        break;

                    case APP_ROUTES.update:

                        const updateParamSubscription = event.activatedRoute.paramMap.subscribe(params => {
                            const slug = params.get('appId');

                            if (!slug) {
                                return;
                            }

                            const app = this.groupedApps.flatMap(g => g.apps).find(app => app.slug == slug);

                            if (app) {
                                this.edit(app);
                                return;
                            }

                            const getAppSubscription = this.appsService.getAppBySlug({
                                appIdOrSlug: slug
                            }).subscribe((resp) => {

                                if (resp.data) {
                                    this.edit(resp.data);
                                } else {
                                    this.snackBar.open(`No data found for the given Id: ${slug}`, "Close", {
                                        duration: 3000,
                                        horizontalPosition: 'right',
                                        verticalPosition: 'top',
                                    });

                                    this.router.navigate(['./'], { relativeTo: this.route, queryParamsHandling: 'merge' });
                                }
                            });

                            this.subscriptions.add(getAppSubscription);
                        });

                        this.subscriptions.add(updateParamSubscription);
                        break;

                    case APP_ROUTES.view:
                        // case APP_VIEW_ROUTES.viewNewIdentifierMapping:
                        // case APP_VIEW_ROUTES.viewSettings:
                        // case APP_VIEW_ROUTES.viewSetting:
                        // case APP_VIEW_ROUTES.viewCreateSetting:
                        // case APP_VIEW_ROUTES.viewUpdateSetting:
                        // case APP_VIEW_ROUTES.viewCopySettingTo:
                        // case APP_VIEW_ROUTES.viewSettingHistories:
                        // case APP_VIEW_ROUTES.viewSettingHistory:
                        // case APP_VIEW_ROUTES.viewInstances:
                        // case APP_VIEW_ROUTES.viewInstance:

                        const viewParamSubscription = event.activatedRoute.paramMap.subscribe(params => {
                            const slug = params.get('appId');

                            if (!slug) {
                                return;
                            }

                            const app = this.groupedApps.flatMap(g => g.apps).find(app => app.slug == slug);

                            if (app) {
                                this.view(app.client.id, app.slug, app.client.name, app.id);
                                return;
                            }

                            const getAppSubscription = this.appsService.getAppBySlug({
                                appIdOrSlug: slug
                            }).subscribe((response) => {
                                const data = response.data;
                                if (data) {
                                    this.view(data.client.id, data.slug, data.client.name, data.id);
                                } else {
                                    this.snackBar.open(`No data found for the given Id: ${slug}`, "Close", {
                                        duration: 3000,
                                        horizontalPosition: 'right',
                                        verticalPosition: 'top',
                                    });

                                    this.router.navigate(['./'], { relativeTo: this.route, queryParamsHandling: 'merge' });
                                }
                            });

                            this.subscriptions.add(getAppSubscription);
                        });

                        this.subscriptions.add(viewParamSubscription);
                        break;
                }
            });
        });

        this.subscriptions.add(dummyComponentSubscription);
    }

    add() {

        const subscription = this.dialog.open(AppCreateComponent, {
            width: '1018px',
            height: '550px',
            minWidth: 'inherit',
            maxWidth: 'inherit',
            autoFocus: false
        }).afterClosed().subscribe((result: GetGroupedAppsResponseApp) => {
            if (result) {

                this.appsCount++;

                const group = result.group?.name ?? 'Ungrouped apps';
                const groupIndex = this.groupedApps.findIndex(g => g.key === group);

                if (this.isGroupsFetched && group !== 'Ungrouped apps' && result.group && !this.groups.some(g => g.id === result.group!.id)) {
                    this.groups.push({
                        id: result.group.id,
                        name: result.group.name,
                        sortOrder: result.group.sortOrder,
                        rowVersion: ''
                    });
                }

                if (groupIndex > -1) {
                    this.groupedApps[groupIndex].apps.push(result);
                } else {
                    this.groupedApps.push({ key: group, apps: [result] });
                    this.groupsCount++;
                }
            }

            this.router.navigate(['./'], { relativeTo: this.route, queryParamsHandling: 'merge' });
        });

        this.subscriptions.add(subscription);
    }


    edit(model: GetGroupedAppsResponseApp): void {

        const appEditorComponentModel: AppEditComponentModel = {
            displayName: model.displayName,
            clientName: model.client.name,
            slug: model.slug,
            appId: model.id,
            clientId: model.client.id,
            description: model.description,
            imageUrl: model.imageUrl,
            wikiUrl: model.wikiUrl,
            group: model.group,
            tags: model.tags,
            rowVersion: model.rowVersion
        };

        if (model.group?.id === "-1") {
            appEditorComponentModel.group = null;
        }

        const subscription = this.dialog.open(AppUpdateComponent, {
            data: appEditorComponentModel,
            minWidth: 500,
            maxWidth: 500
        }).afterClosed().subscribe((result: AppEditComponentReturnModel) => {
            if (result) {

                const oldGroupName = appEditorComponentModel.group?.name || 'Ungrouped apps';
                const newGroupName = result.group?.name || 'Ungrouped apps';

                const hasGroupNameChanged = oldGroupName !== newGroupName;

                if (hasGroupNameChanged) {
                    this.moveAppBetweenGroups(model.client.id, oldGroupName, newGroupName, result);
                } else {
                    this.updateAppInGroup(model.client.id, result);
                }

                if(result.type === "Fetch Latest"){
                    setTimeout(() => {
                        this.router.navigate([`./${model.slug}/update`], { relativeTo: this.route, queryParamsHandling: 'merge' });
                    }, 500)
                }
            }

            this.router.navigate(['./'], { relativeTo: this.route, queryParamsHandling: 'merge' });
        });

        this.subscriptions.add(subscription);
    }

    updateAppInGroup(clientId: string, updatedApp: AppEditComponentReturnModel): void {
        const currentGroupName = updatedApp.group?.name || 'Ungrouped apps';
        const group = this.groupedApps.find(g => g.key === currentGroupName);

        if (group) {
            const appInGroup = group.apps.find(a => a.client.id === clientId);
            if (appInGroup) {
                this.assignAppProperies(appInGroup, updatedApp);
            }
        }
    }

    moveAppBetweenGroups(clientId: string, oldGroupName: string, newGroup: string, updatedApp: AppEditComponentReturnModel) {

        if (!updatedApp.group) {
            updatedApp.group = { id: '-1', name: 'Ungrouped apps', sortOrder: 0 };
        }

        const oldGroupIndex = this.groupedApps.findIndex(g => g.key === oldGroupName);
        const newGroupIndex = this.groupedApps.findIndex(g => g.key === newGroup);

        if (oldGroupIndex === -1) {
            return;
        }

        const oldGroupApps = this.groupedApps[oldGroupIndex].apps;
        const appIndex = oldGroupApps.findIndex(a => a.client.id === clientId);

        if (appIndex === -1) {
            return;
        }

        const app = oldGroupApps[appIndex];

        this.assignAppProperies(app, updatedApp);

        if (newGroupIndex > -1) {
            this.groupedApps[newGroupIndex].apps.push(app);
        } else {
            this.groupedApps.push({ key: newGroup, apps: [app] });
            this.groupsCount++;
            if (updatedApp.group.id !== "-1") {
                this.groups.push({
                    id: updatedApp.group.id,
                    name: updatedApp.group.name,
                    sortOrder: updatedApp.group.sortOrder,
                    rowVersion: ''
                });
            }
        }

        oldGroupApps.splice(appIndex, 1);
        if (oldGroupApps.length === 0) {
            this.groupedApps.splice(oldGroupIndex, 1);
            this.groupsCount--;

            const oldGroupInGroups = this.groups.findIndex(g => g.name === oldGroupName);

            const group = this.groups[oldGroupInGroups];

            if (oldGroupInGroups !== -1 && group.id !== "-1" && group.id !== "0") {
                this.groups.splice(oldGroupInGroups, 1);
            }
        }
    }

    assignAppProperies(app: GetGroupedAppsResponseApp, result: AppEditComponentReturnModel) {
        app.displayName = result.displayName;
        app.client.name = result.clientName;
        app.slug = result.slug;
        app.description = result.description;
        app.imageUrl = result.imageUrl;
        app.wikiUrl = result.wikiUrl;
        app.tags = result.tags;
        app.group = result.group == null ? null : {
            id: result.group.id,
            name: result.group.name,
            sortOrder: result.group.sortOrder
        };
        app.rowVersion = result.rowVersion;
    }

    delete(app: GetGroupedAppsResponseApp): void {

        const title = 'Confirm delete';
        const message = `Are you sure you want to delete the "${app.client.name}" app? This action cannot be undone.`;

        const confirmationDialogComponentModel: ConfirmationDialogComponentModel = {
            title,
            message,
            requireConfirmation: true
        };

        const subscription = this.dialog.open(ConfirmationDialogComponent, {
            width: '500px',
            data: confirmationDialogComponentModel
        }).afterClosed().subscribe(result => {
            if (result) {
                const internalSubscription = this.appsService.deleteApp({ appId: app.id, rowVersion: app.rowVersion }).subscribe(() => {
                    this.appsCount--;

                    const groupName = app.group?.name ?? 'Ungrouped apps';
                    const groupIndex = this.groupedApps.findIndex(g => g.key === groupName);

                    if (groupIndex > -1) {
                        const appIndex = this.groupedApps[groupIndex].apps.findIndex(a => a.client.id === app.client.id);
                        if (appIndex > -1) {
                            this.groupedApps[groupIndex].apps.splice(appIndex, 1);
                            if (this.groupedApps[groupIndex].apps.length === 0) {
                                this.groupedApps.splice(groupIndex, 1);
                                this.groupsCount--;
                            }
                        }
                    }
                });

                this.subscriptions.add(internalSubscription);
            }
        });

        this.subscriptions.add(subscription);
    }

    view(clientId: string, slug: string, clientName: string, appId: string) {

        const data: AppViewComponentModel = { clientId, appSlug: slug, clientName, appId };

        const subscription = this.dialog.open(AppViewComponent, {
            data,
            width: '1350px',
            height: '680px',
            minWidth: 'inherit',
            maxWidth: 'inherit',
            autoFocus: false,
            closeOnNavigation: false
        }).afterClosed().subscribe(() => {

            this.router.navigate(['./'], { relativeTo: this.route, queryParamsHandling: 'merge' });
        });

        this.subscriptions.add(subscription);
    }

    copyToClipboard(content: string) {
        this.utilityService.copyToClipboard(content);
    }

    expandAll() {
        this.accordion.openAll();
    }

    collapseAll() {
        this.accordion.closeAll();
    }
}