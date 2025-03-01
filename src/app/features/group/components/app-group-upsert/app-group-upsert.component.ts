import { Component, Inject, OnDestroy, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { GroupsService } from "../../services/app-groups.service";
import { SetSortOrderPosition } from "../../../sponsor/models/set-order-position.enum";
import { catchError, Observable, of, Subscription, switchMap } from "rxjs";
import { AppGroupUpsertComponentModel } from "../../models/app-group-upsert-component.model";
import { AppGroupUpsertComponentReturnModel } from "../../models/app-group-upsert-component-return.model";
import { ConflictResolverDialogComponent, ConflictResolverReturnType } from "../../../../shared/components/conflict-resolver-dialog/conflict-resolver-dialog.component";

@Component({
    selector: 'app-group-upsert',
    templateUrl: './app-group-upsert.component.html'
})
export class AppGroupUpsertComponent implements OnInit, OnDestroy {
    myForm!: FormGroup;
    title?: string;
    isManualSortOrder: boolean = false;
    setSortOrderPositions = SetSortOrderPosition;
    defaultPosition?: SetSortOrderPosition = SetSortOrderPosition.Bottom;
    private subscriptions: Subscription = new Subscription();

    constructor(
        private snackBar: MatSnackBar,
        private formBuilder: FormBuilder,
        private groupsService: GroupsService,
        private dialog: MatDialog,
        public dialogRef: MatDialogRef<AppGroupUpsertComponent>,
        @Inject(MAT_DIALOG_DATA) public model: AppGroupUpsertComponentModel) { }

    ngOnInit(): void {

        const id = this.model.id ?? '0';

        if (id == '0') {
            this.title = 'Create a new group';
        } else {
            this.title = 'Update - Group'
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

        if (formValue.id === '0') {

            const trimmedName = formValue.name.trim();

            const subscription = this.groupsService.createGroup({
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

                    const returnModel: AppGroupUpsertComponentReturnModel = {
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

        const updateGroup = (formValue: any, rowVersion: string) => {
            return this.groupsService.updateGroup({
                groupId: formValue.id,
                body: {
                    name: formValue.name,
                    sortOrder: formValue.sortOrder,
                    setSortOrderPosition: formValue.position === -1 ? undefined : formValue.position,
                    rowVersion: rowVersion
                }
            });
        };

        const createGroup = (formValue: any) => {
            return this.groupsService.createGroup({
                body: {
                    name: formValue.name,
                    sortOrder: formValue.sortOrder,
                    setSortOrderPosition: formValue.position === -1 ? undefined : formValue.position
                }
            });
        };

        const handleUpdate = (formValue: any, currentRowVersion: string): Observable<any> => {
            return updateGroup(formValue, currentRowVersion).pipe(
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

                                    return createGroup(formValue).pipe(switchMap(() => {
                                        return of(true);
                                    }));
                                }

                                return of(false);
                            }));
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