import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ConfirmationDialogComponentModel } from './confirmation-dialog-component.model';

@Component({
  templateUrl: './confirmation-dialog.component.html',
})
export class ConfirmationDialogComponent {
  userInput: string = '';
  confirmationTextLowercase: string = '';

  constructor(
    private dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogComponentModel
  ) {
    this.data.confirmationText ??= 'I confirm';
    this.confirmationTextLowercase = this.data.confirmationText.toLocaleLowerCase();
  }

  isInputMatching(): boolean {
    return this.userInput.toLocaleLowerCase() === this.confirmationTextLowercase || 
      `${this.userInput.toLocaleLowerCase()}` === `"${this.confirmationTextLowercase}"`;
  }

  onConfirm() {
    this.dialogRef.close(true);
  }
}