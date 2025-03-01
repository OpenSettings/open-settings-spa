import { NgModule } from "@angular/core";
import { JsonDiffEditorComponent } from "./json-diff-editor.component";
import { CommonModule } from "@angular/common";
import { MatCheckboxModule } from "@angular/material/checkbox";

@NgModule({
    declarations: [
        JsonDiffEditorComponent
    ],
    imports: [
        CommonModule,
        MatCheckboxModule
    ],
    exports: [JsonDiffEditorComponent]
})
export class JsonDiffEditorModule { }