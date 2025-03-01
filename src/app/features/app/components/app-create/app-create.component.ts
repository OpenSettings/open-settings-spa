import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { MatDialogRef, MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatChipInputEvent } from "@angular/material/chips";
import { v4 as uuidv4 } from 'uuid';
import { debounceTime, distinctUntilChanged, map, Observable, startWith, Subscription, switchMap } from "rxjs";
import { MatAutocompleteSelectedEvent } from "@angular/material/autocomplete";
import { CustomValidators } from "../../../../shared/utils/custom-validators";
import { AppsService } from "../../services/apps.service";
import { UtilityService } from "../../../../shared/services/utility.service";
import { ConfirmationDialogComponent } from "../../../../shared/components/confirmation-dialog/confirmation-dialog.component";
import { isNullOrWhiteSpace } from "../../../../shared/utils/other-utils";
import { GroupsService } from "../../../group/services/app-groups.service";
import { TagsService } from "../../../tag/services/tags.service";
import { CreateAppRequestBody } from "../../models/create-app-request-body";
import { GetAppGroupsResponseGroup } from "../../../group/models/get-app-groups-response-group";
import { GetTagsResponseTag } from "../../../tag/models/get-tags-response-tag";
import { WindowService } from "../../../../core/services/window.service";

@Component({
    templateUrl: './app-create.component.html',
    styleUrls: ['./app-create.component.css']
})
export class AppCreateComponent implements OnInit, OnDestroy {
    isFullScreen: boolean = false;
    form!: FormGroup;
    filteredGroups$?: Observable<GetAppGroupsResponseGroup[]>;
    filteredTags$?: Observable<GetTagsResponseTag[]>;
    selectedGroupId: string | null = null;
    groupFirstTimeClicked: boolean = true;
    tagFirstTimeClicked: boolean = true;
    prefetchedAppTags: GetTagsResponseTag[] = [];
    isConnectionSecure?: boolean
    subscriptions = new Subscription();

    @ViewChild('tagSearchInput') tagSearchInput!: ElementRef<HTMLInputElement>;

    constructor(public dialogRef: MatDialogRef<AppCreateComponent>,
        private appsService: AppsService,
        private groupsService: GroupsService,
        private tagsService: TagsService,
        private formBuilder: FormBuilder,
        private utilityService: UtilityService,
        private windowService: WindowService,
        private snackBar: MatSnackBar,
        private dialog: MatDialog
    ) { }

    ngOnInit(): void {

        this.form = this.formBuilder.group({
            displayName: [''],
            clientName: ['', Validators.required],
            slug: [''],
            clientId: [uuidv4(), [Validators.required, CustomValidators.mustGuid]],
            clientSecret: [uuidv4(), [Validators.required, CustomValidators.mustGuid]],
            groupName: [''],
            groupId: ['0'],
            description: [''],
            imageUrl: [''],
            wikiUrl: [''],
            tags: [[]],
            tagSearch: ['']
        });

        this.isConnectionSecure = this.windowService.isConnectionSecure;
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    generateGuid(formName: string) {
        this.form.get(formName)?.setValue(uuidv4());
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

    get tags(): GetTagsResponseTag[] {
        return this.form.get('tags')!.value;
    }

    onAppGroupFieldFocus() {

        if (!this.groupFirstTimeClicked) {
            return;
        }

        this.groupFirstTimeClicked = false;

        const formField = this.form.get('groupName')!;

        const groupName$ = formField.valueChanges.pipe(
            startWith(formField.value),
            debounceTime(300),
            distinctUntilChanged());

        this.filteredGroups$ = groupName$.pipe(
            switchMap(value => this.groupsService.getGroups({
                searchTerm: value
            }).pipe(map(response => {
                const responseData = response.data?.appGroups;

                if (!responseData) {
                    return [];
                }

                const selectedGroup = responseData.find(group => group.name.toLowerCase() === value.toLowerCase());
                this.selectedGroupId = selectedGroup ? selectedGroup.id : null;

                return responseData;
            }
            ))));
    }

    onAppTagFieldFocus() {

        if (!this.tagFirstTimeClicked) {
            return;
        }

        this.tagFirstTimeClicked = false;

        const formField = this.form.get('tagSearch')!;

        const tagName$ = formField.valueChanges.pipe(
            startWith(formField.value),
            debounceTime(300),
            distinctUntilChanged());

        this.filteredTags$ = tagName$.pipe(
            switchMap(value => this.tagsService.getTags({
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

        if (!this.form.valid) {
            return;
        }

        const title = 'Warn!';
        const message = 'Unsaved "Client Secret" will not retrievable later. Do you want to proceed?';

        const subscription = this.dialog.open(ConfirmationDialogComponent, {
            width: '500px',
            data: { title, message }
        }).afterClosed().subscribe(result => {
            if (result) {
                const formValue = this.form.value;

                this.add(formValue);
            }
        });

        this.subscriptions.add(subscription);
    }

    add(formValue: any) {

        const model: CreateAppRequestBody = {
            displayName: formValue.displayName,
            slug: formValue.slug,
            client: {
                name: formValue.clientName,
                id: formValue.clientId,
                secret: formValue.clientSecret
            },
            group: isNullOrWhiteSpace(formValue.groupName)
                ? null
                : {
                    id: this.selectedGroupId ?? formValue.groupId,
                    name: formValue.groupName,
                    sortOrder: 0
                },
            description: formValue.description,
            imageUrl: formValue.imageUrl,
            wikiUrl: formValue.wikiUrl,
            tags: formValue.tags
        };

        const subscription = this.appsService.createApp({ body: model }).subscribe(response => {
            if (response) {

                this.snackBar.open(`Added successfully!`, 'Close', {
                    horizontalPosition: 'right',
                    verticalPosition: 'top',
                    duration: 5000
                });

                this.dialogRef.close(response.data);
            }
        });

        this.subscriptions.add(subscription);
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
                name: value,
                sortOrder: 0,
                rowVersion: ''
            });
        }

        this.form.get('tagSearch')?.setValue('');
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

    copyToClipboard(input: string) {

        const form = this.form.get(input);

        if (form) {
            this.utilityService.copyToClipboard(form.value);
        }
    }
}