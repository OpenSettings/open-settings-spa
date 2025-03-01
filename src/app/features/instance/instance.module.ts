import { NgModule } from '@angular/core';
import { InstanceListComponent } from './components/instance-list/instance-list.component';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [
    InstanceListComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatExpansionModule,
    MatCardModule,
    MatIconModule,
    MatListModule,
    MatCheckboxModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatTooltipModule
  ],
  exports: [
    InstanceListComponent
  ]
})
export class InstanceModule { }