import { Severity } from "./severity.model";

export interface IValidationFailure {
    propertyName: string;
    message: string;
    attemptedValue: string;
    severity: Severity;
    code: string;
}