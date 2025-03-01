import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { debounceTime, distinctUntilChanged, map, Observable, startWith, Subject, Subscription, switchMap } from "rxjs";
import { MatSelect } from "@angular/material/select";
import { GetIdentifierResponse } from "../../../identifier/models/get-identifier-response";
import { isNullOrWhiteSpace } from "../../../../shared/utils/other-utils";
import { SettingsService } from "../../services/setting.service";
import { WindowService } from "../../../../core/services/window.service";
import { CopySettingToRequestBody } from "../../models/copy-setting-to-request-body";
import { IdentifiersService } from "../../../identifier/services/identifiers.service";
import { AppsService } from "../../../app/services/apps.service";
import { GetAppsResponseApp } from "../../../app/models/get-apps-response-app";

@Component({
    templateUrl: './setting-copy-to.component.html'
})
export class SettingCopyToComponent implements OnInit, OnDestroy {
    myForm!: FormGroup;
    filteredAppIdentifiers$?: Observable<GetIdentifierResponse[]>;
    selectedAppIdentifierId: string | null = null;
    selectedAppIdentifierOrder: number | null = null;
    fieldFirstTimeClicked: boolean = true;
    selectedApp: string | null = null;
    isAppsFetched: boolean = false;
    apps: GetAppsResponseApp[] = [];
    appFilterType: string = "1";
    @ViewChild('appSelect') appSelect!: MatSelect;
    subscriptions: Subscription = new Subscription();

    private destroy$ = new Subject<void>();

    constructor(
        private cdr: ChangeDetectorRef,
        private snackBar: MatSnackBar,
        public dialogRef: MatDialogRef<SettingCopyToComponent>,
        private formBuilder: FormBuilder,
        @Inject(MAT_DIALOG_DATA) public model: CopySettingToIdentifierComponentModel,
        private settingsService: SettingsService,
        private appsService: AppsService,
        private identifiersService: IdentifiersService,
        private windowService: WindowService
    ) { }

    ngOnInit(): void {

        this.apps.push({
            id: this.model.appId,
            client: {
                id: this.model.clientId,
                name: this.model.clientName
            }
        });

        this.myForm = this.formBuilder.group({
            targetAppId: [this.model.appId, [Validators.required, this.appClientValidator]],
            identifierName: ['', [Validators.required, this.identifierValidator]],
            identifierId: ['0']
        });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
        this.subscriptions.unsubscribe();
    }

    getApps(): void {
        if (this.isAppsFetched || !this.windowService.isProvider) {
            return;
        }

        this.isAppsFetched = true;

        const subscription = this.appsService.getApps({}).subscribe({
            next: (response) => {
                if (!response.data) {
                    return;
                }

                this.apps = response.data;
                this.cdr.detectChanges();
                this.appSelect.open();
            },
            error: () => {
                this.isAppsFetched = false;
            }
        });

        this.subscriptions.add(subscription);
    }

    appClientValidator = (control: any) => {

        if (control.value !== this.model.appId) {

            this.identifierFilterChanged();

            const identifierControl = this.myForm?.get('identifierName');

            if (identifierControl?.hasError('identifierExists')) {
                const currentErrors = identifierControl.errors;

                if (currentErrors) {
                    delete currentErrors['identifierExists'];
                    identifierControl.setErrors(Object.keys(currentErrors).length ? currentErrors : null);
                }
            }
        } else {

            const identifierControl = this.myForm?.get('identifierName');

            if (identifierControl) {
                if (this.model.notAvailableAppIdentifiers.some(a => a.name.toLocaleLowerCase() === identifierControl.value.toLocaleLowerCase())) {

                    const currentErrors = identifierControl.errors || {};
                    currentErrors['identifierExists'] = true;
                    identifierControl.setErrors(currentErrors);

                } else {
                    const currentErrors = identifierControl.errors;

                    if (currentErrors && currentErrors['identifierExists']) {
                        delete currentErrors['identifierExists'];
                        identifierControl.setErrors(Object.keys(currentErrors).length ? currentErrors : null);
                    }
                }
            }
        }

        return null;
    };

    identifierValidator = (control: any) => {

        if (isNullOrWhiteSpace(control.value)) {
            return { invalidIdentifierName: true };
        }

        if (this.model.appId === this.myForm.get('targetAppId')?.value) {
            if (this.model.notAvailableAppIdentifiers.some(a => a.name.toLocaleLowerCase() === control.value.toLocaleLowerCase())) {
                return { identifierExists: true };
            }
        }

        return null;
    };

    clear() {
        this.myForm.get('identifierName')?.setValue('');

        this.identifierFilterChanged();
    }

    onFieldFocus() {

        if (!this.fieldFirstTimeClicked) {
            return;
        }

        this.fieldFirstTimeClicked = false;

        const formField = this.myForm.get('identifierName')!;

        const identifierName$ = formField.valueChanges.pipe(
            startWith(formField.value),
            debounceTime(300),
            distinctUntilChanged());

        this.filteredAppIdentifiers$ = identifierName$.pipe(
            switchMap((value) => {

                const targetAppId = this.myForm.get('targetAppId')!.value;

                const appId = this.apps.find(a => a.id === targetAppId)!.id;

                return this.identifiersService.getIdentifiers({
                    searchTerm: value,
                    appId: this.appFilterType ? appId : undefined,
                    isAppMapped: this.appFilterType === '1'
                }).pipe(map(response => {

                    if (!response.data) {
                        return [];
                    }

                    const identifiers = appId == this.model.appId ? response.data.identifiers.filter(d => !this.model.notAvailableAppIdentifiers.some(a => a.name.toLocaleLowerCase() === d.name.toLocaleLowerCase())) : response.data.identifiers;

                    const selectedIdentifier = identifiers.find(group => group.name.toLowerCase() === value.toLowerCase());
                    this.selectedAppIdentifierId = selectedIdentifier ? selectedIdentifier.id : null;
                    this.selectedAppIdentifierOrder = selectedIdentifier ? selectedIdentifier.sortOrder : null;

                    return identifiers;
                }))
            }));
    }

    identifierFilterChanged() {

        const targetAppId = this.myForm.get('targetAppId')!.value;

        const appId = this.apps.find(a => a.id === targetAppId)!.id;

        const formField = this.myForm.get('identifierName')!;
        this.filteredAppIdentifiers$ = this.identifiersService.getIdentifiers({
            searchTerm: formField.value,
            appId: this.appFilterType ? appId : undefined,
            isAppMapped: this.appFilterType === '1'
        }).pipe(map(response => {

            if (!response.data) {
                return [];
            }

            const identifiers = appId == this.model.appId ? response.data.identifiers.filter(d => !this.model.notAvailableAppIdentifiers.some(a => a.name.toLocaleLowerCase() === d.name.toLocaleLowerCase())) : response.data.identifiers;

            const selectedIdentifier = identifiers.find(group => group.name.toLowerCase() === formField.value.toLowerCase());
            this.selectedAppIdentifierId = selectedIdentifier ? selectedIdentifier.id : null;
            this.selectedAppIdentifierOrder = selectedIdentifier ? selectedIdentifier.sortOrder : null;

            return identifiers;
        }));
    }

    onSubmit() {

        if (!this.myForm.valid) {
            return;
        }

        const formValue = this.myForm.value;

        const model: CopySettingToRequestBody = {
            targetAppId: formValue.targetAppId,
            identifier: {
                id: this.selectedAppIdentifierId ?? formValue.identifierId,
                name: formValue.identifierName
            }
        };

        const subscription = this.settingsService.copySettingTo({
            settingId: this.model.currentSettingId,
            body: model
        }).subscribe(response => {

            if (response.success) {

                const responseData = response.data;

                if (!responseData) {
                    return;
                }

                const returnModel: CopyAppSettingToComponentReturnModel = {
                    settingId: responseData.setting.id,
                    clientId: responseData.clientId,
                    appSlug: responseData.appSlug,
                    classId: responseData.setting.classId,
                    identifierId: responseData.identifier.id,
                    identifierName: responseData.identifier.name,
                    identifierSortOrder: responseData.identifier.sortOrder,
                    identifierMappingSortOrder: responseData.identifier.mappingSortOrder
                };

                this.snackBar.open(`Copied successfully!`, 'Close', {
                    horizontalPosition: 'right',
                    verticalPosition: 'top',
                    duration: 5000
                });

                this.dialogRef.close(returnModel);
            }
        });

        this.subscriptions.add(subscription);
    }

    close(){
        this.dialogRef.close();
    }
}

export interface CopySettingToIdentifierComponentModel {
    clientName: string;
    clientId: string;
    computedIdentifier: string;
    className: string;
    appId: string;
    currentSettingId: string;
    currentAppIdentifierName: string;
    currentAppIdentifierId: string;
    notAvailableAppIdentifiers: GetIdentifierResponse[]
}

export interface CopyAppSettingToComponentReturnModel {
    settingId: string;
    clientId: string;
    appSlug: string;
    classId: string;
    identifierId: string;
    identifierName: string;
    identifierSortOrder: number;
    identifierMappingSortOrder: number;
}