import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { authGuard } from "../../../core/guards/auth.guard";
import { DefaultLayoutComponent } from "./default-layout.component";
import { DEFAULT_ROUTES } from "./default-layout-routes";

const routes: Routes = [
    {
        path: '',
        component: DefaultLayoutComponent,
        canActivateChild: [authGuard],
        children: [
            { path: DEFAULT_ROUTES.base, loadChildren: () => import('../../../features/app/app.module').then(m => m.AppModule) },
            { path: DEFAULT_ROUTES.about, loadChildren: () => import('../../../features/about/about.module').then(m => m.AboutModule) },
            { path: DEFAULT_ROUTES.groups, loadChildren: () => import('../../../features/group/app-group.module').then(m => m.GroupModule) },
            { path: DEFAULT_ROUTES.identifiers, loadChildren: () => import('../../../features/identifier/identifier.module').then(m => m.IdentifierModule) },
            { path: DEFAULT_ROUTES.tags, loadChildren: () => import('../../../features/tag/tag.module').then(m => m.TagModule) },
            { path: DEFAULT_ROUTES.sponsors, loadChildren: () => import('../../../features/sponsor/sponsor.module').then(m => m.SponsorModule) },
            { path: '**', redirectTo: DEFAULT_ROUTES.redirectTo }
        ]
    }
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DefaultLayoutRoutingModule { }