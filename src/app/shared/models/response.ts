import { IError } from "./response-error.model";

export interface IResponse<TData> {
    success: boolean;
    status: number;
    data?: TData;
    errors?: IError[];
    extras?: { [key: string]: any };
}

export interface IResponseAny extends IResponse<any> { }