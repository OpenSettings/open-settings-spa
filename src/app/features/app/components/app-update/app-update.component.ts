import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatChipInputEvent } from "@angular/material/chips";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Observable, startWith, debounceTime, switchMap, map, Subject, distinctUntilChanged, Subscription, of, catchError } from "rxjs";
import { MatAutocompleteSelectedEvent } from "@angular/material/autocomplete";
import { AppGroupService } from "../../../group/services/app-group.service";
import { AppTagService } from "../../../tag/services/app-tag.service";
import { AppService } from "../../services/app.service";
import { UpdateAppRequestBody } from "../../models/update-app-request-body";
import { ConfirmationDialogComponent } from "../../../../shared/components/confirmation-dialog/confirmation-dialog.component";
import { isNullOrWhiteSpace } from "../../../../shared/utils/other-utils";
import { UpdateAppRequestBodyTag } from "../../models/update-app-request-body-tag";
import { AppEditComponentReturnModel } from "../../models/app-editor-component-return.model";
import { AppEditComponentModel } from "../../models/app-edit-component.model";
import { GetAppGroupsResponseGroup } from "../../../group/models/get-app-groups-response-group";
import { GetTagsResponseTag } from "../../../tag/models/get-tags-response-tag";
import { ConflictResolverDialogComponent, ConflictResolverReturnType } from "../../../../shared/components/conflict-resolver-dialog/conflict-resolver-dialog.component";

@Component({
    templateUrl: './app-update.component.html'
})
export class AppUpdateComponent implements OnInit, OnDestroy {
    myForm!: FormGroup;
    filteredGroups$?: Observable<GetAppGroupsResponseGroup[]>;
    filteredTags$?: Observable<GetTagsResponseTag[]>;
    groupFirstTimeClicked: boolean = true;
    tagFirstTimeClicked: boolean = true;
    prefetchedAppTags: GetTagsResponseTag[] = [];
    subscriptions = new Subscription();

    @ViewChild('tagSearchInput') tagSearchInput!: ElementRef<HTMLInputElement>;
    private destroy$ = new Subject<void>();
    constructor(
        private dialog: MatDialog,
        private snackBar: MatSnackBar,
        private formBuilder: FormBuilder,
        public dialogRef: MatDialogRef<AppUpdateComponent>,
        @Inject(MAT_DIALOG_DATA) public model: AppEditComponentModel,
        private appsService: AppService,
        private groupsService: AppGroupService,
        private tagsService: AppTagService) { }

    ngOnInit(): void {

        this.myForm = this.formBuilder.group({
            displayName: [this.model.displayName],
            clientName: [this.model.clientName, Validators.required],
            slug: [this.model.slug, Validators.required],
            groupName: [this.model.group?.name ?? ''],
            description: [this.model.description],
            imageUrl: [this.model.imageUrl],
            wikiUrl: [this.model.wikiUrl],
            tags: [[...(this.model.tags ?? [])]],
            tagSearch: ['']
        });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    onAppGroupFieldFocus() {

        if (!this.groupFirstTimeClicked) {
            return;
        }

        this.groupFirstTimeClicked = false;

        const formField = this.myForm.get('groupName')!;

        const groupName$ = formField.valueChanges.pipe(
            startWith(formField.value),
            debounceTime(300),
            distinctUntilChanged());

        this.filteredGroups$ = groupName$.pipe(
            switchMap(value => this.groupsService.getAppGroups({
                searchTerm: value
            }).pipe(map(response => response.data?.appGroups ?? []))));
    }

    onAppTagFieldFocus() {

        if (!this.tagFirstTimeClicked) {
            return;
        }

        this.tagFirstTimeClicked = false;

        const formField = this.myForm.get('tagSearch')!;

        const tagName$ = formField.valueChanges.pipe(
            startWith(formField.value),
            debounceTime(300),
            distinctUntilChanged());

        this.filteredTags$ = tagName$.pipe(
            switchMap(value => this.tagsService.getAppTags({
                searchTerm: value
            }).pipe(map(response => {

                const responseData = response.data;

                if (!responseData) {
                    return [];
                }

                this.prefetchedAppTags = responseData.tags;

                return this.prefetchedAppTags.filter(tag =>
                    !this.tags.some(currentTag => currentTag.id === tag.id)
                );
            }))));
    }

    onSubmit() {
        if (this.myForm.valid) {

            const formValue = this.myForm.value;

            const updatedClientName = formValue.clientName;

            if (this.model.clientName !== updatedClientName) {

                const title = 'Confirm edit';
                const message = 'Updating the "Client Name" may cause problems. Do you want to proceed? (Potential start-up syncing issue)';

                const subscription = this.dialog.open(ConfirmationDialogComponent, {
                    width: '500px',
                    data: { title, message }
                }).afterClosed().subscribe(result => {
                    if (result) {
                        this.update(formValue);
                    }
                });

                this.subscriptions.add(subscription);
            } else {
                this.update(formValue);
            }
        }
    }

    update(formValue: any) {
        const model: UpdateAppRequestBody = {
            displayName: formValue.displayName,
            client: {
                id: this.model.clientId,
                name: formValue.clientName
            },
            slug: formValue.slug,
            group: isNullOrWhiteSpace(formValue.groupName)
                ? null
                : {
                    name: formValue.groupName
                },
            description: formValue.description,
            imageUrl: formValue.imageUrl,
            wikiUrl: formValue.wikiUrl,
            tags: formValue.tags,
            rowVersion: this.model.rowVersion
        };

        const updateApp = (appId: string, body: UpdateAppRequestBody) => {
            return this.appsService.updateApp({ appId, body });
        }

        const handleUpdate = (rowVersion?: string): Observable<any> => {
            return updateApp(this.model.appId, model).pipe(
                switchMap(response => {

                    const responseData = response.data;

                    if (!responseData && response.extras) {

                        const conflictedData = response.extras['Conflicts'][this.model.appId];

                        const availableReturnTypes: ConflictResolverReturnType[] = ['Discard', 'Override', 'Fetch Latest'];

                        return this.dialog.open(ConflictResolverDialogComponent, {
                            width: '400px',
                            data: availableReturnTypes,
                            autoFocus: false
                        }).afterClosed().pipe(
                            switchMap((type: ConflictResolverReturnType) => {
                                if (type === "Override") {

                                    const rowVersion = conflictedData.properties['RowVersion'].current;

                                    model.rowVersion = rowVersion;

                                    return handleUpdate(rowVersion);
                                } else if (type === "Fetch Latest") {

                                    const getAppSubscription = this.appsService.getAppById({ appIdOrSlug: this.model.appId }).subscribe({
                                        next: (appResponse) => {

                                            const appResponseData = appResponse.data;

                                            if (!appResponseData) {
                                                return;
                                            }

                                            const appEditComponentReturnModel: AppEditComponentReturnModel = {
                                                displayName: appResponseData.displayName,
                                                clientName: appResponseData.client.name,
                                                slug: appResponseData.slug,
                                                group: appResponseData.group ? { id: appResponseData.group.id, name: appResponseData.group.name, sortOrder: appResponseData.group.sortOrder } : null,
                                                description: appResponseData.description,
                                                imageUrl: appResponseData.imageUrl,
                                                wikiUrl: appResponseData.wikiUrl,
                                                tags: appResponseData.tags.map(t => ({ id: t.id, name: t.name, sortOrder: t.sortOrder })),
                                                rowVersion: appResponseData.rowVersion,
                                                type: "Fetch Latest"
                                            };

                                            this.snackBar.open(`Latest data fetched successfully!`, 'Close', {
                                                horizontalPosition: 'right',
                                                verticalPosition: 'top',
                                                duration: 5000
                                            });

                                            this.dialogRef.close(appEditComponentReturnModel);
                                        }
                                    });

                                    this.subscriptions.add(getAppSubscription);
                                }

                                return of(false);
                            }));
                    }
                    else if (!responseData) {
                        return of(false);
                    }
                    else {

                        const appEditComponentReturnModel: AppEditComponentReturnModel = {
                            displayName: responseData.displayName,
                            clientName: responseData.clientName,
                            slug: responseData.slug,
                            group: responseData.group ? { id: responseData.group.id, name: responseData.group.name, sortOrder: responseData.group.sortOrder } : null,
                            description: responseData.description,
                            imageUrl: responseData.imageUrl,
                            wikiUrl: responseData.wikiUrl,
                            tags: responseData.tags.map(t => ({ id: t.id, name: t.name, sortOrder: t.sortOrder })),
                            rowVersion: rowVersion ?? responseData.rowVersion
                        };

                        this.snackBar.open(`Data has been updated successfully!`, 'Close', {
                            horizontalPosition: 'right',
                            verticalPosition: 'top',
                            duration: 5000
                        });

                        this.dialogRef.close(appEditComponentReturnModel);

                    }


                    return of(true);

                }));
        };

        this.subscriptions.add(handleUpdate().subscribe());
    }

    onCancel() {
        this.dialogRef.close();
    }

    get tags(): UpdateAppRequestBodyTag[] {
        return this.myForm.get('tags')!.value;
    }

    onTagEntered(event: MatChipInputEvent): void {
        const value = (event.value || '');

        this.addTag(value);
    }

    addTag(tag: string) {
        const value = tag.trim();

        const valueLowercase = value.toLowerCase();

        if (value && this.tags.findIndex(t => t.name.toLowerCase() === valueLowercase) === -1) {

            const id = this.prefetchedAppTags.find(t => t.name.toLowerCase() === valueLowercase)?.id ?? '0';

            this.tags.push({
                id: id,
                name: value
            });
        }

        this.myForm.get('tagSearch')?.setValue('');
        this.tagSearchInput.nativeElement.value = '';
    }

    deleteTag(keyword: string) {
        const index = this.tags.findIndex(tag => tag.name === keyword);
        if (index !== -1) {
            this.tags.splice(index, 1);
        }
    }

    onTagSelected(event: MatAutocompleteSelectedEvent): void {
        const value = event.option.value as string;

        this.addTag(value);
    }
}