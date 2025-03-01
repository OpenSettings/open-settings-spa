import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { IdentifierListComponent } from "./components/identifier-list/identifier-list.component";
import { SETTING_IDENTIFIER_ROUTES } from "./identifier-routes";
import { DummyComponent } from "../../shared/components/dummy/dummy.component";

const routes: Routes = [
    {
        path: SETTING_IDENTIFIER_ROUTES.base, component: IdentifierListComponent, children: [
            {
                path: SETTING_IDENTIFIER_ROUTES.create,
                component: DummyComponent,
                data: {
                    path: SETTING_IDENTIFIER_ROUTES.create
                }
            },
            {
                path: SETTING_IDENTIFIER_ROUTES.update,
                component: DummyComponent,
                data: {
                    path: SETTING_IDENTIFIER_ROUTES.update
                }
            }
        ]
    },
    { path: '**', redirectTo: SETTING_IDENTIFIER_ROUTES.base }
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class IdentifierRoutingModule { }