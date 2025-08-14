import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { WindowService } from '../services/window.service';

@Injectable()
export class RequestInterceptor implements HttpInterceptor {
    constructor(private authService: AuthService, private windowService: WindowService) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const token = this.authService.token;

        let headers: { [key: string]: string } = {
            'x-os-caller-type': 'Spa',
            'x-os-client-id': this.windowService.client.id,
            'x-os-pack-version': this.windowService.packInfo.version,
            'x-os-pack-version-score': this.windowService.packInfo.score.toString()
        };

        if (token) {
            headers['Authorization'] = token;
            headers['x-os-auth-type'] = this.authService.authType!;
            headers['x-os-auth-method'] = this.authService.authMethod!;
        }

        const cloned = req.clone({
            setHeaders: headers
        });

        return next.handle(cloned);
    }
}