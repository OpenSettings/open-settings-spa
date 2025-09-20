import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Subscription } from "rxjs";
import { ConfigurationUpdateComponentData } from "../../models/configuration-update-component-data";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { MatSelect, MatSelectChange } from "@angular/material/select";
import { MatSlideToggleChange } from "@angular/material/slide-toggle";
import { AppConfigurationService } from "../../services/app-configuration.service";
import { HttpErrorResponse } from "@angular/common/http";
import { PatchConfigurationResponse } from "../../models/patch-configuration-response";
import { IResponse } from "../../../../shared/models/response";
import { UtilityService } from "../../../../shared/services/utility.service";

@Component({
    selector: 'configuration-update',
    templateUrl: './configuration-update.component.html',
    styleUrls: ['./configuration-update.component.css']
})
export class ConfigurationUpdateComponent implements OnInit, OnDestroy, OnChanges {
    subscriptions: Subscription = new Subscription();
    form!: FormGroup;
    isLoading: boolean = false;

    @Input() data!: ConfigurationUpdateComponentData;
    @Output() configUpdateEmitter: EventEmitter<any> = new EventEmitter<any>();
    @ViewChild('selectRef') selectRef?: MatSelect;

    constructor(
        private snackBar: MatSnackBar,
        private formBuilder: FormBuilder,
        private configurationsService: AppConfigurationService,
        private utilityService: UtilityService
    ) { }

    ngOnInit(): void {
        this.form = this.formBuilder.group({
            storeInSeparateFile: [this.data.storeInSeparateFile],
            ignoreOnFileChange: [this.data.storeInSeparateFile ? this.data.ignoreOnFileChange ?? false : null],
            registrationMode: [this.data.registrationMode],
            consumer: this.formBuilder.group({
                providerUrl: [this.data.consumer.providerUrl],
                requestEncodings: [this.data.consumer.requestEncodings],
                isRedisActive: [this.data.consumer.isRedisActive],
                pollingSettingsWorker: this.formBuilder.group({
                    isActive: [this.data.consumer.pollingSettingsWorker.isActive],
                    startsIn: [this.data.consumer.pollingSettingsWorker.startsIn],
                    period: [this.data.consumer.pollingSettingsWorker.period]
                })
            }),
            provider: this.formBuilder.group({
                redis: this.formBuilder.group({
                    isActive: [this.data.provider.redis.isActive],
                    configuration: [this.data.provider.redis.configuration],
                    channel: [this.data.provider.redis.channel]
                }),
                compressionType: [this.data.provider.compressionType],
                compressionLevel: [this.data.provider.compressionLevel]
            }),
            controller: this.formBuilder.group({
                route: [this.data.controller.route],
                allowFromExploring: [this.data.controller.allowFromExploring],
                requiresAuthentication: [this.data.controller.requiresAuthentication],
                openIdConnect: this.formBuilder.group({
                    authority: [this.data.controller.openIdConnect.authority],
                    clientId: [this.data.controller.openIdConnect.clientId],
                    clientSecret: [this.data.controller.openIdConnect.clientSecret],
                    signedOutRedirectUri: [this.data.controller.openIdConnect.signedOutRedirectUri],
                    allowOfflineAccess: [this.data.controller.openIdConnect.allowOfflineAccess],
                    isActive: [this.data.controller.openIdConnect.isActive],
                })
            }),
            spa: this.formBuilder.group({
                routePrefix: [this.data.spa.routePrefix],
                documentTitle: [this.data.spa.documentTitle],
                isActive: [this.data.spa.isActive]
            })
        });
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['data'] && this.data) {
            this.form?.patchValue({
                storeInSeparateFile: this.data.storeInSeparateFile,
                ignoreOnFileChange: this.data.ignoreOnFileChange,
                registrationMode: this.data.registrationMode,
                consumer: {
                    providerUrl: this.data.consumer.providerUrl,
                    requestEncodings: [...this.data.consumer.requestEncodings],
                    isRedisActive: this.data.consumer.isRedisActive,
                    pollingSettingsWorker: {
                        isActive: this.data.consumer.pollingSettingsWorker.isActive,
                        startsIn: this.data.consumer.pollingSettingsWorker.startsIn,
                        period: this.data.consumer.pollingSettingsWorker.period
                    }
                },
                provider: {
                    redis: {
                        isActive: this.data.provider.redis.isActive,
                        configuration: this.data.provider.redis.configuration,
                        channel: this.data.provider.redis.channel
                    },
                    compressionType: this.data.provider.compressionType,
                    compressionLevel: this.data.provider.compressionLevel
                },
                controller: {
                    route: this.data.controller.route,
                    allowFromExploring: this.data.controller.allowFromExploring,
                    requiresAuthentication: this.data.controller.requiresAuthentication,
                    openIdConnect: {
                        authority: this.data.controller.openIdConnect.authority,
                        clientId: this.data.controller.openIdConnect.clientId,
                        clientSecret: this.data.controller.openIdConnect.clientSecret,
                        signedOutRedirectUri: this.data.controller.openIdConnect.signedOutRedirectUri,
                        allowOfflineAccess: this.data.controller.openIdConnect.allowOfflineAccess,
                        isActive: this.data.controller.openIdConnect.isActive
                    }
                },
                spa: {
                    routePrefix: this.data.spa.routePrefix,
                    documentTitle: this.data.spa.documentTitle,
                    isActive: this.data.spa.isActive
                }
            });
        }
    }

    onSelectionChange(event: MatSelectChange): void {

        if (this.data.registrationMode === event.value) {
            return;
        }

        this.isLoading = true;

        const registrationMode = event.value;

        let updatedFieldNameToValue: { [key: string]: any } = {};

        updatedFieldNameToValue['registrationMode'] = registrationMode;

        const subscription = this.configurationsService.patchAppConfiguration({
            appId: this.data.appId,
            identifierId: this.data.selectedIdentifierId,
            body: {
                rowVersion: this.data.rowVersion,
                updatedFieldNameToValue
            }
        }).subscribe({
            next: (response) => {
                const responseData = response.data;

                if (!responseData) {
                    return;
                }

                this.configUpdateEmitter.emit({
                    formControlName: 'registrationMode',
                    registrationMode: responseData.updatedFieldNameToValue['RegistrationMode'],
                    rowVersion: responseData.rowVersion
                });

                this.snackBar.open(`Configuration has been successfully updated! A restart is required for the changes to take effect.`, 'Close', {
                    horizontalPosition: 'right',
                    verticalPosition: 'top',
                    duration: 5000
                });

                this.isLoading = false;
            },
            error: (err: HttpErrorResponse) => {
                this.form.get('registrationMode')?.setValue(this.data.registrationMode);

                if (this.selectRef) {
                    this.selectRef.value = this.data.registrationMode;
                }

                const error = err.error as IResponse<PatchConfigurationResponse>;

                if (error && error.status === 409 && error.errors) {
                    this.isLoading = false;

                    this.utilityService.error(error.errors, 3500);
                    this.fetchLatestConfiguration();
                }
                else {
                    this.isLoading = false;
                }
            }
        });

        this.subscriptions.add(subscription);
    }

    onToggleChange(event: MatSlideToggleChange, formControlName: string) {

        this.isLoading = true;

        let updatedFieldNameToValue: { [key: string]: any } = {};

        updatedFieldNameToValue[formControlName] = event.checked;

        const subscription = this.configurationsService.patchAppConfiguration({
            appId: this.data.appId,
            identifierId: this.data.selectedIdentifierId,
            body: {
                rowVersion: this.data.rowVersion,
                updatedFieldNameToValue
            }
        }).subscribe({
            next: (response) => {
                const responseData = response.data;

                if (!responseData) {
                    return;
                }

                this.data.rowVersion = responseData.rowVersion;

                switch (formControlName) {

                    case 'storeInSeparateFile':
                        this.configUpdateEmitter.emit({
                            formControlName,
                            storeInSeparateFile: responseData.updatedFieldNameToValue['StoreInSeparateFile'],
                            rowVersion: responseData.rowVersion
                        });
                        break;

                    case 'ignoreOnFileChange':
                        this.configUpdateEmitter.emit({
                            formControlName,
                            ignoreOnFileChange: responseData.updatedFieldNameToValue['IgnoreOnFileChange'],
                            rowVersion: responseData.rowVersion
                        });
                        break;
                }

                this.snackBar.open(`Configuration has been successfully updated! A restart is required for the changes to take effect.`, 'Close', {
                    horizontalPosition: 'right',
                    verticalPosition: 'top',
                    duration: 5000
                });

                this.isLoading = false;
            },
            error: (err: HttpErrorResponse) => {
                this.form.get(formControlName)?.setValue(!event.checked);

                const error = err.error as IResponse<PatchConfigurationResponse>;

                if (error && error.status === 409 && error.errors) {
                    this.isLoading = false;

                    this.utilityService.error(error.errors, 3500);
                    this.fetchLatestConfiguration();
                }
                else {
                    this.isLoading = false;
                }
            }
        });

        this.subscriptions.add(subscription);
    }

    saveSettings<K extends keyof Pick<ConfigurationUpdateComponentData, 'consumer' | 'provider' | 'controller' | 'spa'>>(
        event: Event,
        fieldName: K
    ): void {
        event.stopPropagation();
        this.isLoading = true;

        const updatedFieldNameToValue = {
            [fieldName]: { ...this.form.value[fieldName] }
        };

        const subscription = this.configurationsService.patchAppConfiguration({
            appId: this.data.appId,
            identifierId: this.data.selectedIdentifierId,
            body: {
                rowVersion: this.data.rowVersion,
                updatedFieldNameToValue
            }
        }).subscribe({
            next: (response) => {
                const responseData = response.data;
                if (!responseData) return;

                this.data.rowVersion = responseData.rowVersion;

                const updatedKey = fieldName.charAt(0).toUpperCase() + fieldName.slice(1); // "consumer" → "Consumer"
                const updatePayload = responseData.updatedFieldNameToValue[updatedKey];

                this.configUpdateEmitter.emit({
                    formControlName: fieldName,
                    [fieldName]: updatePayload,
                    rowVersion: responseData.rowVersion
                });

                this.snackBar.open(
                    `Configuration has been successfully updated! A restart is required for the changes to take effect.`,
                    'Close',
                    {
                        horizontalPosition: 'right',
                        verticalPosition: 'top',
                        duration: 5000
                    }
                );

                this.isLoading = false;
            },
            error: (err: HttpErrorResponse) => {

                this.isLoading = false;

                const formControl = this.form.get(fieldName) as FormControl;

                formControl?.setValue({ ...this.data[fieldName] });

                const error = err.error as IResponse<PatchConfigurationResponse>;

                if (error && error.status === 409 && error.errors) {
                    this.utilityService.error(error.errors, 3500);
                    this.fetchLatestConfiguration();
                }
            }
        });

        this.subscriptions.add(subscription);
    }

    fetchLatestConfiguration() {
        const subscription = this.configurationsService.getAppConfigurationByAppAndIdentifier({
            appId: this.data.appId,
            identifierId: this.data.selectedIdentifierId
        }).subscribe({
            next: (response) => {
                const responseData = response.data;

                if (!responseData) {
                    return;
                }

                this.configUpdateEmitter.emit({
                    storeInSeparateFile: responseData.storeInSeparateFile,
                    ignoreOnFileChange: responseData.ignoreOnFileChange,
                    registrationMode: responseData.registrationMode,
                    consumer: responseData.consumer,
                    provider: responseData.provider,
                    rowVersion: responseData.rowVersion
                });

                this.isLoading = false;
            },
            error: (err) => {
                this.isLoading = false;
            }
        });

        this.subscriptions.add(subscription);
    }
}