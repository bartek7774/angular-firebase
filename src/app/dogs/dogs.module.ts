import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CommentsModule } from '../comments/comments.module';
import { CoreModule } from '../core/core.module';
import { DogsComponent } from './dogs/dogs.component';
import { MdComponentsModule } from '../md-components.module';

const DOGS_ROUTES: Routes = [
  {
    path: '',
    component: DogsComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    CoreModule,
    RouterModule.forChild(DOGS_ROUTES),
    CommentsModule,
    MdComponentsModule
  ],
  declarations: [DogsComponent]
})
export class DogsModule { }
