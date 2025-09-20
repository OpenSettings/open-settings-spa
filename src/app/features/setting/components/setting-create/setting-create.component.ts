import { Component, ElementRef, Inject, OnDestroy, OnInit, QueryList, ViewChildren } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ThemeService } from "../../../../core/services/theme.service";
import { UtilityService } from "../../../../shared/services/utility.service";
import { isValidGuid, computeIdentifier } from "../../../../shared/utils/hash-utils";
import { AppSettingService } from "../../services/app-setting.service";
import { Subscription } from "rxjs";
import { CreateSettingRequestBody } from "../../models/create-setting-request-body";
import { SettingCreateComponentReturnModel } from "../../models/setting-create-component-return.model";
import { SettingCreateComponentModel } from "../../models/setting-create-component.model";
import { WindowService } from "../../../../core/services/window.service";

@Component({
    templateUrl: './setting-create.component.html'
})
export class SettingCreateComponent implements OnInit, OnDestroy {
    isFullScreen: boolean = false;
    form!: FormGroup;
    classFullName: string = '';
    computedIdentifierPreview: string = '';
    theme: string;
    jsonInvalid: boolean = false;
    isConnectionSecure?: boolean;
    subscriptions: Subscription = new Subscription();

    @ViewChildren('textarea') textareas!: QueryList<ElementRef<HTMLTextAreaElement>>;

    constructor(public dialogRef: MatDialogRef<SettingCreateComponent>,
        @Inject(MAT_DIALOG_DATA) public data: SettingCreateComponentModel,
        private settingsService: AppSettingService,
        private formBuilder: FormBuilder,
        private utilityService: UtilityService,
        private windowService: WindowService,
        private snackBar: MatSnackBar,
        private themeService: ThemeService) {
        this.theme = this.themeService.isDarkTheme() ? 'vs-dark' : 'vs-light';
    }

    ngOnInit(): void {
        this.form = this.formBuilder.group({
            computedIdentifier: ['', Validators.required],
            classNamespace: ['', Validators.required],
            className: ['', Validators.required],
            classFullName: ['', Validators.required],
            data: [{}, [Validators.required]],
            storeInSeparateFile: [true],
            ignoreOnFileChange: [false],
            registrationMode: [1]
        });

        this.subscriptions.add(this.form.get('classNamespace')!.valueChanges.subscribe(() => this.updateClassFullName()));
        this.subscriptions.add(this.form.get('className')!.valueChanges.subscribe(() => this.updateClassFullName()));
        this.subscriptions.add(this.form.get('computedIdentifier')!.valueChanges.subscribe(value => this.updateComputedIdentifierPreview(value)));

        this.isConnectionSecure = this.windowService.isConnectionSecure
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    updateClassFullName(): void {
        const classNamespace = this.form.get('classNamespace')?.value;
        const className = this.form.get('className')?.value;

        if (classNamespace && className) {
            const classFullName = `${classNamespace}.${className}`
            this.form.get('classFullName')?.setValue(classFullName, { emitEvent: false });

            const computedIdentifier = this.form.get('computedIdentifier');

            const classComputedIdentifierValue = computedIdentifier!.value;

            if (!classComputedIdentifierValue || classFullName.includes(classComputedIdentifierValue)) {
                computedIdentifier?.setValue(classFullName);
            }
        }
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

    add() {

        if (this.form.valid) {

            const formValue = this.form.value;

            const rawData = JSON.stringify(formValue.data);

            const model: CreateSettingRequestBody = {
                appId: this.data.appId,
                identifierId: this.data.identifierId,
                computedIdentifier: this.computedIdentifierPreview,
                class: {
                    namespace: formValue.classNamespace,
                    name: formValue.className,
                    fullName: formValue.classFullName,
                },
                data: rawData,
                storeInSeparateFile: formValue.storeInSeparateFile,
                ignoreOnFileChange: formValue.ignoreOnFileChange,
                registrationMode: formValue.registrationMode
            }

            const subscription = this.settingsService.createAppSetting({
                body: model
            }).subscribe(response => {

                const responseData = response.data;

                if(!responseData){
                    return;
                }

                const addAppSettingComponentReturnModel: SettingCreateComponentReturnModel = {
                    id: responseData.settingId,
                    version: "0",
                    classId: responseData.classId,
                    computedIdentifier: this.computedIdentifierPreview,
                    className: model.class.name,
                    classNamespace: model.class.namespace,
                    classFullName: model.class.fullName,
                    rawData: rawData,
                    parsedData: { ...formValue.data },
                    storeInSeparateFile: model.storeInSeparateFile,
                    ignoreOnFileChange: model.ignoreOnFileChange,
                    registrationMode: model.registrationMode
                };

                this.snackBar.open(`Added successfully!`, 'Close', {
                    horizontalPosition: 'right',
                    verticalPosition: 'top',
                    duration: 5000
                });

                this.dialogRef.close(addAppSettingComponentReturnModel);
            });

            this.subscriptions.add(subscription);
        }
    }

    download() {

        const data = this.form.get('data')?.value;

        // const classFullName = this.form.get('classFullName')?.value ?? this.data.clientName;

        // const model = {
        //     [classFullName]: data
        // };

        const value = JSON.stringify(data, null, 4);

        this.utilityService.download(value, this.form.get('className')?.value ?? this.data.clientName);
    }

    upload(event: any) {
        this.utilityService.upload(event.target.files[0] as File).then(content => {

            const parsedData = JSON.parse(content);

            if (typeof parsedData === 'object' && parsedData !== null) {
                this.form.get('data')?.setValue(parsedData);
            } else {
                throw ("Invalid JSON data");
            }

            this.snackBar.open(`Changes applied. Click Save icon to confirm.`, 'Close', {
                horizontalPosition: 'right',
                verticalPosition: 'top',
                duration: 5000
            });

        }).catch(error => {
            this.snackBar.open(`Error occurred while uploading file. Error: ${error}`, 'Close', {
                horizontalPosition: 'right',
                verticalPosition: 'top',
                duration: 8000
            });
        });
    }

    copyToClipboard(input: any) {

        let value = input ?? '{}';

        if (typeof input === 'object') {

            value = JSON.stringify(input, null, 4)
        }

        this.utilityService.copyToClipboard(value);
    }

    invalidData($event: any) {
        this.jsonInvalid = $event;
    }
}