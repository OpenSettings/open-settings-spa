import { NgModule } from '@angular/core';
import { AppListComponent } from './components/app-list/app-list.component';
import { AppCreateComponent } from './components/app-create/app-create.component';
import { AppUpdateComponent } from './components/app-update/app-update.component';
import { AppViewComponent } from './components/app-view/app-view.component';
import { SettingModule } from '../setting/setting.module';
import { InstanceModule } from '../instance/instance.module';
import { AppRoutingModule } from './app-routing.module';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { DummyModule } from '../../shared/components/dummy/dummy-module';
import { SharedModule } from '../../shared/shared.module';
import { ConfigurationModule } from "../configuration/configuration.module";

@NgModule({
  declarations: [
    AppCreateComponent,
    AppListComponent,
    AppUpdateComponent,
    AppViewComponent
  ],
  imports: [
    CommonModule,
    AppRoutingModule,
    SharedModule,
    DummyModule,
    SettingModule,
    InstanceModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatExpansionModule,
    MatCardModule,
    MatOptionModule,
    MatButtonModule,
    MatMenuModule,
    MatChipsModule,
    MatProgressBarModule,
    MatDialogModule,
    MatTabsModule,
    MatSelectModule,
    MatTooltipModule,
    MatAutocompleteModule,
    MatDialogModule,
    MatInputModule,
    ConfigurationModule
]
})
export class AppModule { }