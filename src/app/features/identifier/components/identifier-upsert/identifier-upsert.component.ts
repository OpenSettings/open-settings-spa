import { Component, Inject, OnDestroy, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { IdentifierService } from "../../services/identifier.service";
import { SetSortOrderPosition } from "../../../sponsor/models/set-order-position.enum";
import { catchError, Observable, of, Subscription, switchMap } from "rxjs";
import { ConflictResolverDialogComponent, ConflictResolverReturnType } from "../../../../shared/components/conflict-resolver-dialog/conflict-resolver-dialog.component";
import { IdentifierUpsertComponentReturnModel } from "../../models/identifier-upsert-component-return.model";
import { IdentifierUpsertComponentModel } from "../../models/identifier-upsert-component.model";
import { IResponseAny } from "../../../../shared/models/response";

@Component({
    selector: 'app-identifier-upsert',
    templateUrl: './identifier-upsert.component.html'
})
export class IdentifierUpsertComponent implements OnInit, OnDestroy {
    myForm!: FormGroup;
    title?: string;
    isManualSortOrder: boolean = false;
    setSortOrderPositions = SetSortOrderPosition;
    defaultPosition?: SetSortOrderPosition = SetSortOrderPosition.Bottom;

    private subscriptions: Subscription = new Subscription();

    constructor(
        private snackBar: MatSnackBar,
        private formBuilder: FormBuilder,
        private identifiersService: IdentifierService,
        private dialog: MatDialog,
        public dialogRef: MatDialogRef<IdentifierUpsertComponent>,
        @Inject(MAT_DIALOG_DATA) public model: IdentifierUpsertComponentModel) { }

    ngOnInit(): void {

        const id = this.model.id ?? null;

        if (id === null) {
            this.title = 'Create a new identifier';
        } else {
            this.title = 'Update - Identifier'
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

            const subscription = this.identifiersService.createIdentifier({
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

                    const returnModel: IdentifierUpsertComponentReturnModel = {
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

        const updateIdentifier = (formValue: any, rowVersion: string) => {
            return this.identifiersService.updateIdentifier({
                identifierId: formValue.id,
                body: {
                    name: formValue.name,
                    sortOrder: formValue.sortOrder,
                    setSortOrderPosition: formValue.position === -1 ? undefined : formValue.position,
                    rowVersion: rowVersion
                }
            });
        };

        const createIdentifier = (formValue: any) => {
            return this.identifiersService.createIdentifier({
                body: {
                    name: formValue.name,
                    sortOrder: formValue.sortOrder,
                    setSortOrderPosition: formValue.position === -1 ? undefined : formValue.position
                }
            });
        };

        const handleUpdate = (formValue: any, currentRowVersion: string): Observable<any> => {
            return updateIdentifier(formValue, currentRowVersion).pipe(
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

                                    return createIdentifier(formValue).pipe(switchMap(() => {
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

                    const response = err.error as IResponseAny;

                    if (!response) {
                        this.snackBar.open(`An error occurred or action not completed.`, 'Close', {
                            horizontalPosition: 'right',
                            verticalPosition: 'top',
                            duration: 5000
                        });
                    }

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