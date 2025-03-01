import { NgModule } from '@angular/core';
import { ConfigurationUpdateComponent } from './components/configuration-update/configuration-update.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { ConfigurationRoutingModule } from './configuration-routing.module';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatBadgeModule } from '@angular/material/badge';
import { MatExpansionModule } from '@angular/material/expansion';

@NgModule({
  declarations: [
    ConfigurationUpdateComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ConfigurationRoutingModule,
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatOptionModule,
    MatButtonModule,
    MatTooltipModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatBadgeModule,
    MatExpansionModule
  ],
  exports: [
    ConfigurationUpdateComponent
  ]
})
export class ConfigurationModule { }
