import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ConflictResolverDialogComponent } from "./conflict-resolver-dialog.component";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogModule } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatTooltip } from "@angular/material/tooltip";

@NgModule({
    declarations: [
        ConflictResolverDialogComponent
    ],
    imports:[
        CommonModule,
        FormsModule,
        MatDialogModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatTooltip
    ]
})
export class ConflictResolverDialogModule { }