import { ActivatedRouteSnapshot, ActivatedRoute } from "@angular/router";

export interface DummyComponentServiceModel {
    path: string;
    data: any;
    activatedSnapshot: ActivatedRouteSnapshot;
    activatedRoute: ActivatedRoute;
}