import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppGroupListComponent } from './components/app-group-list/app-group-list.component';
import { GROUP_ROUTES } from './app-group-routes';
import { DummyComponent } from '../../shared/components/dummy/dummy.component';

const routes: Routes = [
    {
        path: GROUP_ROUTES.base, component: AppGroupListComponent, children: [
            {
                path: GROUP_ROUTES.create,
                component: DummyComponent,
                data: {
                    path: GROUP_ROUTES.create
                }
            },
            {
                path: GROUP_ROUTES.update,
                component: DummyComponent,
                data: {
                    path: GROUP_ROUTES.update
                }
            }
        ]
    },
    { path: '**', redirectTo: GROUP_ROUTES.base }
]


@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class GroupRoutingModule { }