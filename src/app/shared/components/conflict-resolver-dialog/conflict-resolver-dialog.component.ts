import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ConfirmationDialogComponent } from "../confirmation-dialog/confirmation-dialog.component";

export type ConflictResolverReturnType = 'Override' | 'Recreate' | 'Discard' | 'Fetch Latest'

@Component({
    templateUrl: './conflict-resolver-dialog.component.html'
})
export class ConflictResolverDialogComponent {

    overrideBtnEnabled: boolean;
    recreateBtnEnabled: boolean;
    discardBtnEnabled: boolean;
    fetchLatestBtnEnabled: boolean;

    title: string = 'Conflict occurred';
    actionText: string = 'Please select your action';

    constructor(
        private dialogRef: MatDialogRef<ConfirmationDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public availableReturnTypes: ConflictResolverReturnType[]
    ) {
        this.overrideBtnEnabled = availableReturnTypes.includes("Override");
        this.recreateBtnEnabled = availableReturnTypes.includes("Recreate");
        this.discardBtnEnabled = availableReturnTypes.includes("Discard");
        this.fetchLatestBtnEnabled = availableReturnTypes.includes("Fetch Latest");
    }


    onSubmit(returnType: ConflictResolverReturnType) {
        this.dialogRef.close(returnType);
    }
}