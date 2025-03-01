import { NgModule } from "@angular/core";
import { AccountMenuComponent } from "./account-menu.component";
import { MatMenuModule } from "@angular/material/menu";
import { CommonModule } from "@angular/common";
import { MatBadgeModule } from "@angular/material/badge";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatTooltipModule } from "@angular/material/tooltip";
import { SharedModule } from "../../shared.module";
import { MatCardModule } from "@angular/material/card";
import { LicenseUpgradeModule } from "../../../features/licenses/license-upgrade/license-upgrade.module";

@NgModule({
    declarations: [AccountMenuComponent],
    imports: [
        CommonModule,
        SharedModule,
        MatButtonModule,
        MatMenuModule,
        MatIconModule,
        MatBadgeModule,
        MatTooltipModule,
        MatCardModule
    ],
    exports: [AccountMenuComponent]
})
export class AccountMenuModule { }