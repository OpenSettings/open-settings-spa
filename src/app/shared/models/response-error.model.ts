import { ErrorType } from "./error-type.model";
import { IValidationFailure } from "./validation-failure.model";

export interface IError {
    title: string;
    description: string;
    traces: string;
    code: string;
    helpLink: string;
    type: ErrorType;
    validationFailures: IValidationFailure[]
}