import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AppTagService } from "../../services/app-tag.service";
import { SetSortOrderPosition } from "../../../sponsor/models/set-order-position.enum";
import { catchError, Observable, of, Subscription, switchMap } from "rxjs";
import { TagUpsertComponentModel } from "../../models/tag-upsert-component.model";
import { ConflictResolverDialogComponent, ConflictResolverReturnType } from "../../../../shared/components/conflict-resolver-dialog/conflict-resolver-dialog.component";
import { TagUpsertComponentReturnModel } from "../../models/tag-upsert-component-return.model";

@Component({
    templateUrl: './tag-upsert.component.html'
})
export class TagUpsertComponent implements OnInit {
    myForm!: FormGroup;
    title?: string;
    isManualSortOrder: boolean = false;
    setSortOrderPositions = SetSortOrderPosition;
    defaultPosition?: SetSortOrderPosition = SetSortOrderPosition.Bottom;

    private subscriptions: Subscription = new Subscription();

    constructor(
        private snackBar: MatSnackBar,
        private formBuilder: FormBuilder,
        private tagsService: AppTagService,
        private dialog: MatDialog,
        public dialogRef: MatDialogRef<TagUpsertComponent>,
        @Inject(MAT_DIALOG_DATA) public model: TagUpsertComponentModel) { }

    ngOnInit(): void {

        const id = this.model.id ?? null;

        if (id === null) {
            this.title = 'Create a new tag';
        } else {
            this.title = 'Update - Tag';
            this.isManualSortOrder = true;
            this.defaultPosition = SetSortOrderPosition.Manual;
        }

        this.myForm = this.formBuilder.group({
            id: [id],
            name: [this.model.name, Validators.required],
            position: [this.defaultPosition],
            sortOrder: [this.model.sortOrder],
            rowVersion: [this.model.rowVersion]
        });
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    onSubmit() {

        if (!this.myForm.valid) {
            return;
        }

        const formValue = this.myForm.value;

        this.update(formValue);
    }

    update(formValue: any) {

        if (formValue.id === null) {

            const trimmedName = formValue.name.trim();

            const subscription = this.tagsService.createAppTag({
                body: {
                    name: trimmedName,
                    sortOrder: formValue.sortOrder,
                    setSortOrderPosition: formValue.position === -1 ? undefined : formValue.position
                }
            }).subscribe({
                next: (response) => {

                    const responseData = response.data;

                    if (!responseData) {
                        return;
                    }

                    const returnModel: TagUpsertComponentReturnModel = {
                        id: responseData.id,
                        name: responseData.name,
                        sortOrder: responseData.sortOrder
                    };

                    this.snackBar.open(`Data has been added successfully!`, 'Close', {
                        horizontalPosition: 'right',
                        verticalPosition: 'top',
                        duration: 5000
                    });

                    this.dialogRef?.close(returnModel);
                }
            });

            this.subscriptions.add(subscription);

            return;
        }

        const updatetag = (formValue: any, rowVersion: string) => {
            return this.tagsService.updateAppTag({
                appTagId: formValue.id,
                body: {
                    name: formValue.name,
                    sortOrder: formValue.sortOrder,
                    setSortOrderPosition: formValue.position === -1 ? undefined : formValue.position,
                    rowVersion: rowVersion
                }
            });
        };

        const createtag = (formValue: any) => {
            return this.tagsService.createAppTag({
                body: {
                    name: formValue.name,
                    sortOrder: formValue.sortOrder,
                    setSortOrderPosition: formValue.position === -1 ? undefined : formValue.position
                }
            });
        };

        const handleUpdate = (formValue: any, currentRowVersion: string): Observable<any> => {
            return updatetag(formValue, currentRowVersion).pipe(
                switchMap(response => {
                    const responseData = response.data;

                    if (!responseData && response.extras) {

                        const conflictedData = response.extras['Conflicts'][formValue.id];

                        const availableReturnTypes: ConflictResolverReturnType[] = ['Discard'];

                        availableReturnTypes.push(conflictedData ? 'Recreate' : 'Override');

                        return this.dialog.open(ConflictResolverDialogComponent, {
                            width: '400px',
                            data: availableReturnTypes,
                            autoFocus: false
                        }).afterClosed().pipe(
                            switchMap((type: ConflictResolverReturnType) => {
                                if (type === "Override") {

                                    const rowVersion = conflictedData.properties['RowVersion'].current;

                                    return handleUpdate(formValue, rowVersion);

                                } else if (type === 'Recreate') {

                                    return createtag(formValue).pipe(switchMap(() => {
                                        return of(true);
                                    }));
                                }

                                return of(false);
                            })
                        );
                    } else {
                        this.snackBar.open(`Data has been updated successfully!`, 'Close', {
                            horizontalPosition: 'right',
                            verticalPosition: 'top',
                            duration: 5000
                        });
                    }

                    return of(true);
                }),
                catchError(err => {

                    this.snackBar.open(`An error occurred or action not completed.`, 'Close', {
                        horizontalPosition: 'right',
                        verticalPosition: 'top',
                        duration: 5000
                    });

                    return err;
                })
            );
        };

        const subscription = handleUpdate(formValue, formValue.rowVersion).subscribe({
            next: (close: boolean) => {

                if (close) {
                    this.dialogRef?.close();
                }
            }
        });

        this.subscriptions.add(subscription);
    }

    onPositionChange(): void {
        const position = this.myForm.get('position')?.value;
        if (position === -1) {
            this.isManualSortOrder = true;
        } else {
            this.isManualSortOrder = false;
        }
    }
}