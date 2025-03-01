import { NgModule } from '@angular/core';
import { SettingHistoryListComponent } from './components/setting-history-list/setting-history-list.component';
import { JsonEditorModule } from '../../shared/components/json-editor/json-editor.module';
import { JsonDiffEditorModule } from '../../shared/components/json-diff-editor/json-diff-editor.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { SettingHistoryRoutingModule } from './setting-history-routing.module';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [
    SettingHistoryListComponent
  ],
  imports: [
    CommonModule,
    SettingHistoryRoutingModule,
    FormsModule,
    JsonEditorModule,
    JsonDiffEditorModule,
    MatCardModule,
    MatIconModule,
    MatTooltipModule,
    MatSelectModule,
    MatExpansionModule,
    MatButtonModule,
    MatDialogModule
  ]
})
export class SettingHistoryModule { }