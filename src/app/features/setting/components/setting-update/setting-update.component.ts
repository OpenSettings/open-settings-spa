import { Component, EventEmitter, Inject, OnDestroy, OnInit, Output } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ConfirmationDialogComponent } from "../../../../shared/components/confirmation-dialog/confirmation-dialog.component";
import { UtilityService } from "../../../../shared/services/utility.service";
import { isValidGuid, computeIdentifier } from "../../../../shared/utils/hash-utils";
import { SettingsService } from "../../services/setting.service";
import { UpdateSettingRequestBody } from "../../models/update-setting-request-body";
import { catchError, Observable, of, Subscription, switchMap } from "rxjs";
import { SettingUpdateComponentReturnModel } from "../../models/setting-update-component-return.model";
import { SettingUpdateComponentModel } from "../../models/setting-update-component.model";
import { ConflictResolverDialogComponent, ConflictResolverReturnType } from "../../../../shared/components/conflict-resolver-dialog/conflict-resolver-dialog.component";
import { WindowService } from "../../../../core/services/window.service";
import { IResponseAny } from "../../../../shared/models/response";

@Component({
    templateUrl: './setting-update.component.html'
})
export class SettingUpdateComponent implements OnInit, OnDestroy {
    isFullScreen: boolean = false;
    form!: FormGroup;
    computedIdentifierPreview: string = '';
    subscriptions: Subscription = new Subscription();
    isConnectionSecure?: boolean;

    constructor(public dialogRef: MatDialogRef<SettingUpdateComponent>,
        @Inject(MAT_DIALOG_DATA) public data: SettingUpdateComponentModel,
        private settingsService: SettingsService,
        private formBuilder: FormBuilder,
        private utilityService: UtilityService,
        private windowService: WindowService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.form = this.formBuilder.group({
            computedIdentifier: [this.data.computedIdentifier, Validators.required],
            classNamespace: [this.data.classNamespace, Validators.required],
            className: [this.data.className, Validators.required],
            classFullName: [this.data.classFullName, Validators.required],
            isDataValidationEnabled: [this.data.isDataValidationEnabled],
            storeInSeparateFile: [this.data.storeInSeparateFile],
            ignoreOnFileChange: [this.data.storeInSeparateFile ? this.data.ignoreOnFileChange ?? false : null],
            registrationMode: [this.data.registrationMode]
        });

        this.computedIdentifierPreview = this.data.computedIdentifier;

        this.subscriptions.add(this.form.get('computedIdentifier')!.valueChanges.subscribe(value => this.updateComputedIdentifierPreview(value)));

        this.isConnectionSecure = this.windowService.isConnectionSecure;
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    updateComputedIdentifierPreview(value: string): void {
        if (value && isValidGuid(value)) {
            this.computedIdentifierPreview = value;
        } else if (value) {
            this.computedIdentifierPreview = computeIdentifier(value);
        } else {
            this.computedIdentifierPreview = '';
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

    copyToClipboard(input: string) {

        this.utilityService.copyToClipboard(input);
    }

    onSubmit() {

        if (!this.form.valid) {
            return;
        }

        const formValue = this.form.value;

        if (this.data.computedIdentifier === this.computedIdentifierPreview) {
            this.edit(formValue);
            return;
        }

        const title = 'Confirm edit';
        const message = 'Updating the "Computed Identifier" may cause problems. Do you want to proceed? (Potential unmatching)';

        const subscription = this.dialog.open(ConfirmationDialogComponent, {
            width: '500px',
            data: { title, message }
        }).afterClosed().subscribe(result => {
            if (result) {
                this.edit(formValue);
            }
        });

        this.subscriptions.add(subscription);
    }

    edit(formValue: any) {
        const model: UpdateSettingRequestBody = {
            computedIdentifier: this.computedIdentifierPreview,
            dataValidationDisabled: !formValue.isDataValidationEnabled,
            rowVersion: this.data.settingRowVersion,
            class: {
                namespace: formValue.classNamespace,
                name: formValue.className,
                fullName: formValue.classFullName,
                rowVersion: this.data.classRowVersion
            },
            storeInSeparateFile: formValue.storeInSeparateFile,
            ignoreOnFileChange: formValue.ignoreOnFileChange,
            registrationMode: formValue.registrationMode
        };

        let editAppSettingComponentReturnModel: SettingUpdateComponentReturnModel;

        const updateSetting = (model: UpdateSettingRequestBody) => {
            return this.settingsService.updateSetting({
                settingId: this.data.id,
                body: model
            });
        };

        const handleUpdate = (request: UpdateSettingRequestBody): Observable<any> => {
            return updateSetting(request).pipe(
                switchMap(response => {

                    const responseData = response.data;

                    editAppSettingComponentReturnModel = {
                        computedIdentifier: model.computedIdentifier,
                        classNamespace: formValue.classNamespace,
                        className: formValue.className,
                        classFullName: formValue.classFullName,
                        isDataValidationEnabled: formValue.isDataValidationEnabled,
                        rowVersion: responseData?.rowVersion ?? '',
                        storeInSeparateFile: request.storeInSeparateFile,
                        ignoreOnFileChange: request.storeInSeparateFile ? request.ignoreOnFileChange : null,
                        registrationMode: request.registrationMode,
                        type: editAppSettingComponentReturnModel?.type
                    };


                    if (!responseData && response.extras) {

                        const availableReturnTypes: ConflictResolverReturnType[] = ['Discard', 'Override', 'Fetch Latest'];

                        return this.dialog.open(ConflictResolverDialogComponent, {
                            width: '400px',
                            data: availableReturnTypes,
                            autoFocus: false
                        }).afterClosed().pipe(switchMap((type: ConflictResolverReturnType) => {

                            if (type === "Fetch Latest") {

                                editAppSettingComponentReturnModel.type = "Fetch Latest";

                                return of(true);

                            } else if (type === 'Override') {

                                const settingRowVersion = response.extras!['Conflicts']["SettingId"]?.properties["RowVersion"].current;

                                const classRowVersion = response.extras!['Conflicts']["ClassId"]?.properties["RowVersion"].current;

                                editAppSettingComponentReturnModel.type = "Override";

                                if (settingRowVersion) {
                                    model.rowVersion = settingRowVersion;
                                }

                                if (classRowVersion) {
                                    model.class.rowVersion = classRowVersion;
                                }

                                return handleUpdate(model);
                            }

                            return of(false);

                        }));
                    } else {

                        this.snackBar.open(`Data has been updated successfully! A restart is required for the changes to take effect.`, 'Close', {
                            horizontalPosition: 'right',
                            verticalPosition: 'top',
                            duration: 5000
                        });

                        return of(true);
                    }
                })
            )
        };

        const subscription = handleUpdate(model).subscribe({
            next: (close: boolean) => {

                if (close) {
                    this.dialogRef?.close(editAppSettingComponentReturnModel);
                }
            }
        });

        this.subscriptions.add(subscription);
    }
}