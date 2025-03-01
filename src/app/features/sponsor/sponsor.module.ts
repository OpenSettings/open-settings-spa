import { NgModule } from '@angular/core';
import { SponsorListComponent } from './components/sponsor-list/sponsor-list.component';
import { SponsorRoutingModule } from './sponsor-routing.module';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [
    SponsorListComponent
  ],
  imports: [
    CommonModule,
    SponsorRoutingModule,
    FormsModule,
    MatSelectModule,
    MatIconModule,
    MatExpansionModule,
    MatCardModule,
    MatMenuModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatButtonModule
  ]
})
export class SponsorModule { }