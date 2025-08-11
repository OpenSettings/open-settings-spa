import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class RequestInterceptor implements HttpInterceptor {
    constructor(private authService: AuthService) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const token = this.authService.token;

        let headers: { [key: string]: string } = {
            'x-os-caller-type': 'Spa',
        }

        if (token) {
            headers['Authorization'] = token;
            headers['x-os-auth-type'] = this.authService.authType!;
        }

        const cloned = req.clone({
            setHeaders: headers
        });

        return next.handle(cloned);
    }
}