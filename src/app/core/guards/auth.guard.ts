import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateFn } from '@angular/router';
import { of, switchMap } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAuthenticated || !authService.isAuthorizationRequired) {
        return true;
    }

    return authService.checkAuthorization().pipe(
        switchMap((isAuthenticated: boolean) => {

            if (!isAuthenticated) {
                router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
            }

            return of(isAuthenticated)
        }));
};