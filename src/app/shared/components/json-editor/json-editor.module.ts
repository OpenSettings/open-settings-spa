import { NgModule } from "@angular/core";
import { JsonEditorComponent } from "./json-editor.component";
import { CommonModule } from "@angular/common";

@NgModule({
    declarations: [
        JsonEditorComponent
    ],
    imports: [CommonModule],
    exports: [JsonEditorComponent]
})
export class JsonEditorModule { }