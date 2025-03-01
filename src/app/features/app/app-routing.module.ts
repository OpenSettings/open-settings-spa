import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AppListComponent } from "./components/app-list/app-list.component";
import { APP_ROUTES, APP_VIEW_ROUTES } from "./app-routes";
import { DummyComponent } from "../../shared/components/dummy/dummy.component";
import { DummyChildComponent } from "../../shared/components/dummy/dummy-child.component";

const routes: Routes = [
    {
        path: APP_ROUTES.base, component: AppListComponent, children: [
            {
                path: APP_ROUTES.create,
                pathMatch: 'full',
                component: DummyComponent,
                data: {
                    path: APP_ROUTES.create,
                }
            },
            {
                path: APP_ROUTES.update,
                pathMatch: 'full',
                component: DummyComponent,
                data: {
                    path: APP_ROUTES.update
                }
            },
            {
                path: APP_ROUTES.view,
                component: DummyComponent,
                data: {
                    path: APP_ROUTES.view,
                    data: APP_ROUTES.view
                },
                children: [
                    {
                        path: APP_VIEW_ROUTES.viewNewIdentifierMapping,
                        component: DummyChildComponent,
                        data: {
                            path: APP_VIEW_ROUTES.viewNewIdentifierMapping
                        }
                    },
                    {
                        path: APP_VIEW_ROUTES.viewSettings,
                        component: DummyChildComponent,
                        data: {
                            path: APP_VIEW_ROUTES.viewSettings
                        }
                    },
                    {
                        path: APP_VIEW_ROUTES.viewSettings2,
                        component: DummyChildComponent,
                        data: {
                            path: APP_VIEW_ROUTES.viewSettings2
                        }
                    },
                    {
                        path: APP_VIEW_ROUTES.viewCreateSetting,
                        component: DummyChildComponent,
                        data: {
                            path: APP_VIEW_ROUTES.viewCreateSetting
                        }
                    },
                    {
                        path: APP_VIEW_ROUTES.viewSetting,
                        component: DummyChildComponent,
                        data: {
                            path: APP_VIEW_ROUTES.viewSetting
                        }
                    },
                    {
                        path: APP_VIEW_ROUTES.viewUpdateSetting,
                        component: DummyChildComponent,
                        data: {
                            path: APP_VIEW_ROUTES.viewUpdateSetting
                        }
                    },
                    {
                        path: APP_VIEW_ROUTES.viewCopySettingTo,
                        component: DummyChildComponent,
                        data: {
                            path: APP_VIEW_ROUTES.viewCopySettingTo
                        }
                    },
                    {
                        path: APP_VIEW_ROUTES.viewSettingHistories,
                        component: DummyChildComponent,
                        data: {
                            path: APP_VIEW_ROUTES.viewSettingHistories
                        }
                    },
                    {
                        path: APP_VIEW_ROUTES.viewSettingHistory,
                        component: DummyChildComponent,
                        data: {
                            path: APP_VIEW_ROUTES.viewSettingHistory
                        }
                    },
                    {
                        path: APP_VIEW_ROUTES.viewInstances,
                        component: DummyChildComponent,
                        data: {
                            path: APP_VIEW_ROUTES.viewInstances
                        }
                    },
                    {
                        path: APP_VIEW_ROUTES.viewInstances2,
                        component: DummyChildComponent,
                        data: {
                            path: APP_VIEW_ROUTES.viewInstances2
                        }
                    },
                    {
                        path: APP_VIEW_ROUTES.viewInstance,
                        component: DummyChildComponent,
                        data: {
                            path: APP_VIEW_ROUTES.viewInstance
                        }
                    },
                    {
                        path: APP_VIEW_ROUTES.viewConfiguration,
                        component: DummyChildComponent,
                        data: {
                            path: APP_VIEW_ROUTES.viewConfiguration
                        }
                    },
                    {
                        path: '**', redirectTo: APP_VIEW_ROUTES.viewSettings2
                    }
                ]
            }
        ]
    },
    { path: '**', redirectTo: APP_ROUTES.base }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }