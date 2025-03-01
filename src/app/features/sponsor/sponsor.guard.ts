import { inject } from "@angular/core";
import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from "@angular/router";
import { WindowService } from "../../core/services/window.service";

export const sponsorGuard: CanActivateFn = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
) => {
    const windowService = inject(WindowService);
    const router = inject(Router);

    if (windowService.license.edition === 100) {
        return true;
    }

    router.navigate(['/']);

    return false;
};