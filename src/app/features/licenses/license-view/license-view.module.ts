import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { LicenseViewComponent } from "./license-view.component";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogModule } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatTooltipModule } from "@angular/material/tooltip";
import { LicenseUpgradeModule } from "../license-upgrade/license-upgrade.module";

@NgModule({
    declarations: [
        LicenseViewComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        MatFormFieldModule,
        MatInputModule,
        LicenseUpgradeModule
    ]
})
export class LicenseViewModule { }