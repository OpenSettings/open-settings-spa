import { AbstractControl, ValidationErrors } from "@angular/forms";
import { isValidGuid } from "../utils/hash-utils";


export class CustomValidators {

    static mustGuid(control: AbstractControl): ValidationErrors | null {

        if (!control?.value) {
            return null;
        }

        if (isValidGuid(control.value)) {
            return null;
        }

        return { invalidGuid: true };
    }
}