import { Injectable } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { IError } from "../models/response-error.model";
import { Subscription } from "rxjs";
import { ErrorType } from "../models/error-type.model";

@Injectable({
  providedIn: 'root'
})
export class UtilityService {
  constructor(private snackBar: MatSnackBar) { }

  private internalError(errors: IError[], duration: number | undefined, action: string) {
    if (errors.length > 1) {
      const errorMessages = errors.map(error => `* ${error.description}`).join('\n');
      return this.snackBar.open(`Errors occurred:\n${errorMessages}`, action, {
        horizontalPosition: 'right',
        verticalPosition: 'top',
        duration: duration
      });
    } else if (errors.length === 1) {
      const error = errors[0];

      if (error.type === ErrorType.Validation) {
        const validationFailures = error.validationFailures.map(v => `PropertyName: '${v.propertyName}', Message: '${v.message}'`).join('\n');
        return this.snackBar.open(`${error.title}: ${error.description} ${validationFailures}`, action, {
          horizontalPosition: 'right',
          verticalPosition: 'top',
          duration: duration
        });
      } else {
        return this.snackBar.open(`${error.title}: ${error.description}`, action, {
          horizontalPosition: 'right',
          verticalPosition: 'top',
          duration: duration
        });
      }


    }

    return null;
  }

  private internalSimpleError(messages: string[], duration: number | undefined, action: string) {
    if (messages.length > 1) {
      const errorMessages = messages.map(message => `* ${message}`).join('\n');
      return this.snackBar.open(`Errors occurred:\n${errorMessages}`, action, {
        horizontalPosition: 'right',
        verticalPosition: 'top',
        duration: duration
      });
    } else if (messages.length === 1) {
      const error = messages[0];
      return this.snackBar.open(error, action, {
        horizontalPosition: 'right',
        verticalPosition: 'top',
        duration: duration
      });
    }

    return null;
  }

  error(errors: IError[], duration: number | undefined) {
    return this.internalError(errors, duration, 'Close');
  }

  errorWithRestart(errors: IError[], duration: number | undefined, dismissByAction: boolean) {
    return this.internalError(errors, duration, 'Restart')?.afterDismissed().subscribe((action) => {
      if (!dismissByAction || action.dismissedByAction) {
        window.location.reload();
      }
    });
  }

  simpleError(message: string, duration: number | undefined) {
    return this.internalSimpleError([message], duration, 'Close');
  }

  simpleErrorWithRestart(message: string, duration: number | undefined, dismissByAction: boolean) {
    return this.internalSimpleError([message], duration, 'Restart')?.afterDismissed().subscribe((action) => {
      if (!dismissByAction || action.dismissedByAction) {
        window.location.reload();
      }
    });
  }

  copyToClipboard(text: string) {

    navigator.clipboard.writeText(text)
      .then(() => {
        this.snackBar.open(`Copied to clipboard!`, 'Close', {
          horizontalPosition: 'right',
          verticalPosition: 'top',
          duration: 1500
        });
      })
      .catch(err => {
      });
  }

  download(text: string, className: string) {
    const blob = new Blob([text], { type: 'application/json' });
    const downloadLink = document.createElement('a');
    downloadLink.href = window.URL.createObjectURL(blob);
    downloadLink.download = `settings.${className}.json`;
    downloadLink.click();
  }

  upload(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      if (file) {
        const reader = new FileReader();
        reader.readAsText(file, 'UTF-8');

        reader.onload = () => {
          const content: string = reader.result as string;
          resolve(content);
        };

        reader.onerror = (error) => {
          reject(error);
        };
      } else {
        reject(new Error('No file provided'));
      }
    });
  }
}