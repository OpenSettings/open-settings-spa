import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { TagListComponent } from "./components/tag-list/tag-list.component";
import { TAG_ROUTES } from "./tag-routes";
import { DummyComponent } from "../../shared/components/dummy/dummy.component";

const routes: Routes = [
    {
        path: TAG_ROUTES.base, component: TagListComponent, children: [
            {
                path: TAG_ROUTES.create,
                component: DummyComponent,
                data: {
                    path: TAG_ROUTES.create
                }
            },
            {
                path: TAG_ROUTES.update,
                component: DummyComponent,
                data: {
                    path: TAG_ROUTES.update
                }
            }
        ]
    },
    { path: '**', redirectTo: TAG_ROUTES.base }
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class TagRoutingModule { }