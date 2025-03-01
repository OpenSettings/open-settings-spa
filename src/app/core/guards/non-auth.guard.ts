import { inject } from "@angular/core";
import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from "@angular/router";
import { of, switchMap } from "rxjs";
import { AuthService } from "../services/auth.service";

export const nonAuthGuard: CanActivateFn = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAuthenticated || !authService.isAuthorizationRequired) {
        const returnUrl = route.queryParams['returnUrl'] || '/';
        router.navigate([returnUrl]);
        return of(false);
    }

    return authService.checkAuthorization().pipe(
        switchMap((isAuthenticated: boolean) => {

            if (isAuthenticated) {
                const returnUrl = route.queryParams['returnUrl'] || '/';
                router.navigate([returnUrl]);
                return of(false);
            }

            return of(true);
        }));
};