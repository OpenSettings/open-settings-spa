import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { SponsorListComponent } from "./components/sponsor-list/sponsor-list.component";
import { sponsorGuard } from "./sponsor.guard";

const routes: Routes = [
    { path: '', canActivate: [sponsorGuard], component: SponsorListComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: []
})
export class SponsorRoutingModule { }