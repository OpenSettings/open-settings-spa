import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, Subscription, catchError, tap } from "rxjs";
import { AuthService } from "../services/auth.service";
import { IResponseAny } from "../../shared/models/response";
import { UtilityService } from "../../shared/services/utility.service";

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    subscriptions: Subscription = new Subscription();

    constructor(
        private authService: AuthService,
        private utilityService: UtilityService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        return next.handle(request).pipe(catchError((error: HttpErrorResponse) => {

            switch (error.status) {
                case 401:

                    this.authService.setAuthorizationRequired(true);

                    if (this.authService.token && !request.headers.has('Authorization')) {

                        return next.handle(this.addToken(request, this.authService.token)).pipe(tap(() => {
                        }), catchError(error => {

                            this.authService.logout(true);

                            throw error;
                        }));
                    }

                    this.authService.logout();

                    break;

                case 0:

                    this.utilityService.simpleErrorWithRestart(error.message, undefined, true);

                    break;

                case 409:
                    break;

                default:

                    const response = error.error as IResponseAny;

                    if (response && response.errors) {
                        this.utilityService.error(response.errors, 3500);
                    } else {
                        this.utilityService.simpleError(error.message, 2250);
                    }

                    break;
            }

            throw error;
        }));
    }

    private addToken(request: HttpRequest<any>, token: string | null): HttpRequest<any> {

        return request.clone({
            setHeaders: {
                Authorization: `${token}`
            }
        });
    }
}