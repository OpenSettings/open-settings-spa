import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { MatSort } from "@angular/material/sort";
import { MatSnackBar } from "@angular/material/snack-bar";
import { CdkDragDrop } from "@angular/cdk/drag-drop";
import { TagsService } from "../../services/tags.service";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { Subject, Subscription, debounceTime } from "rxjs";
import { WindowService } from "../../../../core/services/window.service";
import { ConfirmationDialogComponent } from "../../../../shared/components/confirmation-dialog/confirmation-dialog.component";
import { TagUpsertComponent } from "../tag-upsert/tag-upsert.component";
import { SortDirection } from "../../../../shared/models/sort-direction.enum";
import { DummyComponentService } from "../../../../shared/components/dummy/dummy-component.service";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { TAG_ROUTES } from "../../tag-routes";
import { QueryParams } from "../../../../shared/models/query-params";
import { TagUpsertComponentModel } from "../../models/tag-upsert-component.model";
import { ConfirmationDialogComponentModel } from "../../../../shared/components/confirmation-dialog/confirmation-dialog-component.model";
import { UtilityService } from "../../../../shared/services/utility.service";
import { ModelForPaginatedResponseData } from "../../../../shared/models/model-for-paginated-response-data";
import { HttpErrorResponse } from "@angular/common/http";
import { UserPreferencesService } from "../../../../shared/services/user-preferences.service";

@Component({
    templateUrl: './tag-list.component.html'
})
export class TagListComponent implements OnInit, AfterViewInit {
    displayedColumns: string[] = ['id', 'name', 'sortOrder', 'mappingsCount', 'createdOn', 'createdBy', 'updatedOn', 'updatedBy', 'edit'];
    dataSource: MatTableDataSource<ModelForPaginatedResponseData> = new MatTableDataSource();
    queryParams: QueryParams = {
        pageSize: 0,
        pageIndex: 0,
        searchTerm: '',
        sortBy: '',
        sortDirection: null
    };

    private searchTermSubject = new Subject<string>();
    isProvider: boolean = false;

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;
    @ViewChild('searchTermInput') searchTermInput!: ElementRef<HTMLInputElement>;

    private subscriptions = new Subscription();
    private sortChangeSubscription?: Subscription;
    private searchTermSubscription?: Subscription;
    private queryParamSubscription?: Subscription;
    dragAndDropEnabled = false;
    isLoading: boolean = false;
    noResultsFound: boolean = true;
    message: string = '';
    minSortOrder: number = 0;
    maxSortOrder: number = 0;

    constructor(
        private tagsService: TagsService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar,
        private windowService: WindowService,
        private dummyComponentService: DummyComponentService,
        private utilityService: UtilityService,
        private userPreferencesService: UserPreferencesService,
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.isProvider = this.windowService.isProvider;
        this.dragAndDropEnabled = this.userPreferencesService.dragAndDropEnabled;
        this.handleRouting();
        this.setupSearchTermSubscription();
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            this.setupQueryParams();
        });
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    setupQueryParams() {

        if (this.queryParamSubscription) {
            return;
        }

        this.queryParamSubscription = this.route.queryParams.subscribe(params => {
            const pageIndex = +params['page'] - 1 || 0;
            const pageSize = +params['size'] || 5;
            const sortBy = params['sortBy'] || '';
            const sortDirection = (params['sortDirection']?.toLowerCase() ?? '0') === '0'
                ? sortBy === ''
                    ? null
                    : SortDirection.Asc
                : SortDirection.Desc;
            const searchTerm = this.getSearchTermFromRoute(params);

            if (this.queryParams.pageIndex === pageIndex &&
                this.queryParams.pageSize === pageSize &&
                this.queryParams.sortBy === sortBy &&
                this.queryParams.sortDirection === sortDirection &&
                this.queryParams.searchTerm === searchTerm) {
                return;
            }

            this.queryParams.pageIndex = pageIndex;
            this.queryParams.pageSize = pageSize;
            this.queryParams.sortBy = sortBy;
            this.queryParams.sortDirection = sortDirection;
            this.queryParams.searchTerm = searchTerm;
            this.searchTermInput.nativeElement.value = searchTerm;

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

    setupSortChangeIfNotAlready(sortBy: string, sortDirection: SortDirection | null): void {

        if (this.sortChangeSubscription) {
            return;
        }

        this.sort.active = sortBy;
        this.sort.direction = sortDirection === null
            ? ''
            : sortDirection === SortDirection.Desc
                ? 'desc'
                : 'asc';

        this.sortChangeSubscription = this.sort.sortChange.subscribe(() => {

            const sortBy = this.sort.direction === ''
                ? ''
                : this.sort.active;

            const sortDirection = this.sort.direction === 'desc'
                ? SortDirection.Desc
                : this.sort.direction === ''
                    ? null
                    : SortDirection.Asc;

            if (sortBy === this.queryParams.sortBy && sortDirection === this.queryParams.sortDirection) {
                return;
            }

            this.queryParams.sortBy = sortBy;
            this.queryParams.sortDirection = sortDirection;

            this.loadData();
        });

        this.subscriptions.add(this.sortChangeSubscription);
    }

    onPaginate(event: PageEvent): void {
        if (this.queryParams.pageIndex === event.pageIndex && this.queryParams.pageSize === event.pageSize) {
            return;
        }

        this.queryParams.pageIndex = event.pageIndex;
        this.queryParams.pageSize = event.pageSize;

        this.loadData();
    }

    loadData(): void {
        this.startFetching();

        const subscription = this.tagsService.getPaginatedTags({
            searchTerm: this.queryParams.searchTerm,
            pageIndex: this.queryParams.pageIndex + 1,
            pageSize: this.queryParams.pageSize,
            sortBy: this.queryParams.sortBy,
            sortDirection: this.queryParams.sortDirection
        }).subscribe({
            next: (response) => {

                const responseData = response.data;

                if (!responseData) {
                    return;
                }

                this.minSortOrder = responseData.minSortOrder;
                this.maxSortOrder = responseData.maxSortOrder;
                this.dataSource.data = responseData.tags;
                this.paginator.pageIndex = responseData.pagingInfo.pageIndex - 1;
                this.paginator.pageSize = responseData.pagingInfo.pageSize;
                this.paginator.length = responseData.pagingInfo.itemCount;

                this.queryParams.pageIndex = this.paginator.pageIndex;
                this.queryParams.pageSize = this.paginator.pageSize;

                this.stopFetching();
            },
            error: () => {
                this.stopFetching();
            },
            complete: () => {
                this.setupSortChangeIfNotAlready(this.queryParams.sortBy, this.queryParams.sortDirection);
                this.updateUrl();
            }
        });

        this.subscriptions.add(subscription);
    }

    startFetching() {
        this.isLoading = true;
    }

    stopFetching(hasError?: boolean) {
        this.isLoading = false;

        if (hasError) {
            return;
        }

        if (this.dataSource.data.length > 0) {
            this.noResultsFound = false;
            this.message = '';
            return;
        }

        if (this.queryParams.searchTerm === '') {
            this.noResultsFound = true;
            this.message = 'No results found.';
        } else {
            this.noResultsFound = false;
            this.message = '0 matches';
        }
    }

    applyFilter(event: Event): void {
        const searchTerm = (event.target as HTMLInputElement).value;

        if (searchTerm === this.queryParams.searchTerm) {
            return;
        }

        this.queryParams.pageIndex = 0;
        this.searchTermSubject.next(searchTerm);
    }

    clearSearchTerm() {

        if (this.queryParams.searchTerm === '') {
            return;
        }

        this.searchTermInput.nativeElement.value = '';
        this.queryParams.pageIndex = 0;
        this.queryParams.searchTerm = '';
        this.loadData();
    }

    updateUrl(): void {
        this.router.navigate([], {
            queryParams: {
                page: this.queryParams.pageIndex + 1,
                size: this.queryParams.pageSize,
                sortBy: this.queryParams.sortBy === '' ? null : this.queryParams.sortBy,
                sortDirection: this.queryParams.sortDirection,
                searchTerm: this.queryParams.searchTerm === '' ? null : this.queryParams.searchTerm,
            },
            queryParamsHandling: 'merge'
        });
    }

    handleRouting() {

        const dummyComponentSubscription = this.dummyComponentService.event$.subscribe(event => {
            setTimeout(() => {

                if (event === undefined) {
                    return;
                }

                switch (event.path) {

                    case TAG_ROUTES.create:
                        this.add();
                        break;

                    case TAG_ROUTES.update:

                        const paramSubscription = event.activatedRoute.paramMap.subscribe(params => {
                            const slug = params.get('slug');

                            if (!slug) {
                                return;
                            }

                            const data = this.dataSource.data.find(d => d.slug === slug);

                            if (data) {
                                this.edit(data);
                                return;
                            }

                            const internalSubscription = this.tagsService.getTagById({
                                tagIdOrSlug: slug
                            }).subscribe({
                                next: (response) => {

                                    const responseData = response.data;

                                    if (!responseData) {
                                        return;
                                    }

                                    const editModel: TagUpsertComponentModel = {
                                        id: slug,
                                        name: responseData.name,
                                        sortOrder: responseData.sortOrder,
                                        rowVersion: responseData.rowVersion
                                    };

                                    this.edit(editModel);

                                },
                                error: (err: HttpErrorResponse) => {
                                    this.router.navigate(['./'], { relativeTo: this.route, queryParamsHandling: 'merge' });
                                }
                            });

                            this.subscriptions.add(internalSubscription);
                        });

                        this.subscriptions.add(paramSubscription);

                        break;
                }
            }, 0)
        });

        this.subscriptions.add(dummyComponentSubscription);
    }

    delete(model: ModelForPaginatedResponseData): void {
        const title = 'Confirm delete';
        let message = `Are you sure you want to delete the "${model.name}" tag?`;
        let requireConfirmation = false;

        if (model.mappingsCount > 0) {
            message += ' The tag has ' + model.mappingsCount + ' mapping(s).'
            requireConfirmation = true;
        }

        message += ' This action cannot be undone.'

        const confirmationDialogComponentModel: ConfirmationDialogComponentModel = {
            title,
            message,
            requireConfirmation
        };

        const subscription = this.dialog.open(ConfirmationDialogComponent, {
            width: '500px',
            data: confirmationDialogComponentModel
        }).afterClosed().subscribe(result => {
            if (result) {

                const internalSubscription = this.tagsService.deleteTag({ tagId: model.id, rowVersion: model.rowVersion }).subscribe(() => {

                    this.snackBar.open(`Deleted successfully!`, 'Close', {
                        horizontalPosition: 'right',
                        verticalPosition: 'top',
                        duration: 5000
                    });

                    this.loadData();
                });

                this.subscriptions.add(internalSubscription);
            }
        });

        this.subscriptions.add(subscription);
    }

    moveUpOrder(model: ModelForPaginatedResponseData): void {
        this.moveOrder(model, false);
    }

    moveDownOrder(model: ModelForPaginatedResponseData): void {
        this.moveOrder(model, true);
    }

    moveOrder(model: ModelForPaginatedResponseData, ascent: boolean): void {
        const subscription = this.tagsService.updateTagSortOrder({
            id: model.id,
            ascent: ascent,
            rowVersion: model.rowVersion
        }).subscribe((response) => {
            if (response.status === 409 && response.errors) {
                this.utilityService.error(response.errors, 3500);
            }

            this.loadData();
        });

        this.subscriptions.add(subscription);
    }

    reorder() {
        const subscription = this.tagsService.reorder().subscribe(() => {
            this.snackBar.open(`Reordered successfully!`, 'Close', {
                horizontalPosition: 'right',
                verticalPosition: 'top',
                duration: 5000
            });

            this.loadData();
        });

        this.subscriptions.add(subscription);
    }

    add() {

        const tagEditComponentModel: TagUpsertComponentModel = {
            id: '0',
            name: '',
            sortOrder: 0,
            rowVersion: ''
        };

        const subscription = this.dialog.open(TagUpsertComponent, {
            data: tagEditComponentModel,
            width: '500px',
            height: '370px',
            minWidth: 'inherit',
            maxWidth: 'inherit',
            autoFocus: true
        }).afterClosed().subscribe(() => {
            this.loadData();
            this.router.navigate(['./'], { relativeTo: this.route, queryParamsHandling: 'merge' });
        });

        this.subscriptions.add(subscription);
    }

    edit(model: TagUpsertComponentModel) {
        const subscription = this.dialog.open(TagUpsertComponent, {
            data: model,
            width: '500px',
            height: '500px',
            minWidth: 'inherit',
            maxWidth: 'inherit',
            autoFocus: false
        }).afterClosed().subscribe(() => {
            this.loadData();
            this.router.navigate(['./'], { relativeTo: this.route, queryParamsHandling: 'merge' });
        });

        this.subscriptions.add(subscription);
    }

    deleteUnmappedTags() {
        const title = 'Confirm delete';
        const message = `Are you sure you want to delete the unmapped tags? This action cannot be undone.`;

        const subscription = this.dialog.open(ConfirmationDialogComponent, {
            width: '500px',
            data: { title, message }
        }).afterClosed().subscribe(result => {
            if (result) {

                const internalSubscription = this.tagsService.deleteUnmappedTags().subscribe(() => {

                    this.snackBar.open(`Deleted successfully!`, 'Close', {
                        horizontalPosition: 'right',
                        verticalPosition: 'top',
                        duration: 5000
                    });

                    this.loadData();
                });

                this.subscriptions.add(internalSubscription);
            }
        });

        this.subscriptions.add(subscription);
    }

    onRowDrop(event: CdkDragDrop<any[]>) {
        const previousIndex = event.previousIndex;
        const currentIndex = event.currentIndex;

        if (previousIndex === currentIndex) {
            return;
        }

        const ascent = currentIndex > previousIndex;
        const source = this.dataSource.data[previousIndex];

        if (Math.abs(previousIndex - currentIndex) === 1) {

            this.moveOrder(source, ascent);
            return;
        }

        const target = this.dataSource.data[currentIndex];

        const subscription = this.tagsService.dragTag({
            sourceId: source.id,
            targetId: target.id,
            ascent: ascent,
            sourceRowVersion: source.rowVersion
        }).subscribe((response) => {
            if (response.status === 409 && response.errors) {
                this.utilityService.error(response.errors, 3500);
            }

            this.loadData();
        });

        this.subscriptions.add(subscription);
    }

    toggleDragAndDrop() {
        this.dragAndDropEnabled = !this.dragAndDropEnabled;

        this.userPreferencesService.setDragAndDropEnabled(this.dragAndDropEnabled);
    }
}
