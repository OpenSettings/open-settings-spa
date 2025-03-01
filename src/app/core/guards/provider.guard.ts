import { inject } from "@angular/core";
import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from "@angular/router";
import { WindowService } from "../services/window.service";

export const providerGuard: CanActivateFn = (route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
) => {
    const windowService = inject(WindowService);
    const router = inject(Router);

    if (!windowService.isProvider) {
        router.navigate(['/']);
    }

    return windowService.isProvider;
};