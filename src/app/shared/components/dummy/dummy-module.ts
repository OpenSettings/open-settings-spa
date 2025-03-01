import { NgModule } from "@angular/core";
import { DummyComponent } from "./dummy.component";
import { DummyChildComponent } from "./dummy-child.component";
import { RouterModule, Routes } from "@angular/router";

const routes: Routes = [];

@NgModule({
    declarations: [DummyComponent, DummyChildComponent],
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DummyModule { }