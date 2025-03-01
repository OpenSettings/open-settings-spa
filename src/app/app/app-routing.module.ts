import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { authGuard } from '../core/guards/auth.guard';
import { nonAuthGuard } from '../core/guards/non-auth.guard';

const routes: Routes = [
    { path: 'login', canActivateChild: [nonAuthGuard], loadChildren: () => import('../features/login/login.module').then(m => m.LoginModule) },
    { path: '', canActivateChild: [authGuard], loadChildren: () => import('../shared/layouts/default-layout/default-layout.module').then(m => m.DefaultLayoutModule) },
    { path: '**', redirectTo: '' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
    providers: [{ provide: LocationStrategy, useClass: HashLocationStrategy }]
})
export class AppRoutingModule { }