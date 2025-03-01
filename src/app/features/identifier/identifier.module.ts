import { NgModule } from '@angular/core';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConflictResolverDialogModule } from '../../shared/components/conflict-resolver-dialog/conflict-resolver-dalog.module';
import { IdentifierRoutingModule } from './identifier-routing.module';
import { IdentifierListComponent } from './components/identifier-list/identifier-list.component';
import { IdentifierUpsertComponent } from './components/identifier-upsert/identifier-upsert.component';

@NgModule({
  declarations: [
    IdentifierListComponent,
    IdentifierUpsertComponent
  ],
  imports: [
    CommonModule,
    IdentifierRoutingModule,
    ConflictResolverDialogModule,
    DragDropModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatProgressBarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatCardModule,
    MatFormFieldModule,
    MatPaginatorModule,
    MatTableModule,
    MatDialogModule,
    MatSelectModule,
    MatInputModule,
    MatSortModule,
    MatTooltipModule
  ]
})
export class IdentifierModule { }