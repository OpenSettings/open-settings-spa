import { NgModule } from '@angular/core';
import { SettingCreateComponent } from './components/setting-create/setting-create.component';
import { SettingListComponent } from './components/setting-list/setting-list.component';
import { SettingUpdateComponent } from './components/setting-update/setting-update.component';
import { SettingHistoryModule } from '../setting-history/setting-history.module';
import { SettingRoutingModule } from './setting-routing.module';
import { JsonEditorModule } from '../../shared/components/json-editor/json-editor.module';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { SettingCopyToComponent } from './components/setting-copy-to/setting-copy-to.component';
import { IdentifierMappingCreateComponent } from './components/identifier-mapping-create/identifier-mapping-create.component';

@NgModule({
  declarations: [
    SettingCreateComponent,
    SettingListComponent,
    SettingUpdateComponent,
    SettingCopyToComponent,
    IdentifierMappingCreateComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SettingRoutingModule,
    SettingHistoryModule,
    JsonEditorModule,
    ReactiveFormsModule,
    MatIconModule,
    MatExpansionModule,
    MatMenuModule,
    MatCardModule,
    MatFormFieldModule,
    MatOptionModule,
    MatButtonModule,
    MatTooltipModule,
    MatButtonToggleModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatSlideToggleModule,
    MatDialogModule,
    MatAutocompleteModule
  ],
  exports: [
    SettingListComponent,
  ]
})
export class SettingModule { }