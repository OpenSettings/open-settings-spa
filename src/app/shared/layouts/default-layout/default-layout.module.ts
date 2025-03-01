import { NgModule } from "@angular/core";
import { DefaultLayoutComponent } from "./default-layout.component";
import { DefaultLayoutRoutingModule } from "./default-layout-routing.module";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatListModule } from "@angular/material/list";
import { MatIconModule } from "@angular/material/icon";
import { MatDividerModule } from "@angular/material/divider";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatButtonModule } from "@angular/material/button";
import { ConfirmationDialogModule } from "../../components/confirmation-dialog/confirmation-dialog.module";
import { CommonModule } from "@angular/common";
import { AccountMenuModule } from "../../components/account-menu/account-menu.module";
import { LicenseViewModule } from "../../../features/licenses/license-view/license-view.module";

@NgModule({
    declarations: [DefaultLayoutComponent],
    imports: [
        CommonModule,
        DefaultLayoutRoutingModule,
        AccountMenuModule,
        ConfirmationDialogModule,
        MatSidenavModule,
        MatListModule,
        MatIconModule,
        MatDividerModule,
        MatTooltipModule,
        MatToolbarModule,
        MatButtonModule,
        LicenseViewModule
    ]
})
export class DefaultLayoutModule { }