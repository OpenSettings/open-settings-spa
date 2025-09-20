import { AfterViewInit, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { debounceTime, distinctUntilChanged, map, Observable, startWith, Subject, Subscription, switchMap, timeout } from "rxjs";
import { isNullOrWhiteSpace } from "../../../../shared/utils/other-utils";
import { GetIdentifierResponse } from "../../../identifier/models/get-identifier-response";
import { IdentifierService } from "../../../identifier/services/identifier.service";
import { SetSortOrderPosition } from "../../../sponsor/models/set-order-position.enum";
import { GetIdentifiersResponseIdentifier } from "../../../identifier/models/get-identifiers-response-identifier";
import { AppIdentifierMappingService } from "../../../../shared/services/app-identifier-mapping.service";
import { CreateAppIdentifierMappingRequestBody } from "../../../app/models/create-app-identifier-mapping-request-body";
import { HttpErrorResponse } from "@angular/common/http";
import { CreateAppIdentifierMappingResponse } from "../../../app/models/create-app-identifier-mapping-response";
import { IResponse } from "../../../../shared/models/response";

@Component({
    templateUrl: './identifier-mapping-create.component.html'
})
export class IdentifierMappingCreateComponent implements OnInit, AfterViewInit, OnDestroy {
    myForm!: FormGroup;
    filteredAppIdentifiers$?: Observable<GetIdentifierResponse[]>;
    selectedAppIdentifierId: string | null = null;
    selectedAppIdentifierOrder: number | null = null;
    fieldFirstTimeClicked: boolean = true;
    title?: string = '';
    isManualOrder: boolean = false;
    setSortOrderPositions = SetSortOrderPosition;
    defaultPosition: SetSortOrderPosition = SetSortOrderPosition.Bottom;

    private destroy$ = new Subject<void>();
    private subscriptions: Subscription = new Subscription();

    @ViewChild('input') input!: ElementRef<HTMLInputElement>;

    constructor(
        private snackBar: MatSnackBar,
        public dialogRef: MatDialogRef<IdentifierMappingCreateComponent>,
        private formBuilder: FormBuilder,
        @Inject(MAT_DIALOG_DATA) public model: AppIdentifierAddComponentModel,
        private identifiersService: IdentifierService,
        private appIdentifierMappingsService: AppIdentifierMappingService
    ) { }

    ngOnInit(): void {

        this.title = this.model.title ? this.model.title : `New mapping - ${this.model.clientName}`;

        this.myForm = this.formBuilder.group({
            identifierName: ['', [Validators.required, this.identifierValidator]],
            identifierId: ['0'],
            position: [this.defaultPosition]
        });
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            this.input.nativeElement.focus();
        }, 0);
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
        this.subscriptions.unsubscribe();
    }

    identifierValidator = (control: any) => {

        if (isNullOrWhiteSpace(control.value)) {
            return { invalidIdentifierName: true };
        }

        if (this.model.identifiers.some(s => s.name.toLowerCase() === control.value.toLowerCase())) {
            return { identifierExists: true };
        }

        return null;
    };

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
            switchMap(value => this.identifiersService.getIdentifiers({
                searchTerm: value
            }).pipe(map(response => {

                const responseData = response.data;

                if (!responseData) {
                    return [];
                }

                const identifiers = responseData.identifiers.filter(s => !this.model.identifiers.some(i => i.id === s.id));

                const selectedIdentifier = identifiers.find(group => group.name.toLowerCase() === value.toLowerCase());
                this.selectedAppIdentifierId = selectedIdentifier ? selectedIdentifier.id : null;
                this.selectedAppIdentifierOrder = selectedIdentifier ? selectedIdentifier.sortOrder : null;

                return identifiers;
            }
            ))));
    }

    onSubmit() {

        if (!this.myForm.valid) {
            return;
        }

        const formValue = this.myForm.value;

        const model: CreateAppIdentifierMappingRequestBody = {
            setSortOrderPosition: formValue.position,
            identifier: {
                id: this.selectedAppIdentifierId ?? formValue.identifierId,
                name: formValue.identifierName
            }
        };

        const subscription = this.appIdentifierMappingsService.createAppIdentifierMapping({
            appId: this.model.appId,
            body: model
        }).subscribe({
            next: (response) => {
                const responseData = response.data;

                if (!responseData) {
                    return;
                }

                const returnModel: AppIdentifierAddComponentReturnModel = {
                    mappingSortOrder: responseData.identifier.mappingSortOrder,
                    identifierId: responseData.identifier.id,
                    identifierName: model.identifier.name,
                    identifierSortOrder: responseData.identifier.sortOrder
                };

                this.snackBar.open(`Added successfully!`, 'Close', {
                    horizontalPosition: 'right',
                    verticalPosition: 'top',
                    duration: 5000
                });

                this.dialogRef.close(returnModel);

            },
            error: (err: HttpErrorResponse) => {

                const error = err.error as IResponse<CreateAppIdentifierMappingResponse>;

                if(error){

                    if(error.errors?.find(e => e.traces === 'MappingAlreadyExists')){

                        const errorSubscription = this.appIdentifierMappingsService.getAppIdentifierMappingByAppSlugAndIdentifierSlug({
                            appIdOrSlug: this.model.appSlug,
                            identifierIdOrSlug: formValue.identifierName
                        }).subscribe(resp => {

                            const responseData = resp.data;

                            if(!responseData){
                                return;
                            }

                            const returnModel: AppIdentifierAddComponentReturnModel = {
                                mappingSortOrder: responseData.mappingSortOrder,
                                identifierId: responseData.identifier.id,
                                identifierName: model.identifier.name,
                                identifierSortOrder: responseData.identifier.sortOrder
                            };


                            this.dialogRef.close(returnModel);
                        });

                        this.subscriptions.add(errorSubscription);
                    }
                }
            }
        });

        this.subscriptions.add(subscription);
    }
    

    onPositionChange(): void {
        const position = this.myForm.get('position')?.value;
        if (position === -1) {
            this.isManualOrder = true;
        } else {
            this.isManualOrder = false;
        }
    }
}

export interface AppIdentifierAddComponentModel {
    appId: string;
    appSlug: string;
    clientName: string;
    identifiers: GetIdentifiersResponseIdentifier[];
    title?: string;
}

export interface AppIdentifierAddComponentReturnModel {
    mappingSortOrder: number;
    identifierId: string;
    identifierName: string;
    identifierSortOrder: number;
}