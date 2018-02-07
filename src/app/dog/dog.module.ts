import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DogComponent } from './dog/dog.component';
import { CoreModule } from '../core/core.module';
import { RouterModule, Routes } from '@angular/router';
import { MdComponentsModule } from '../md-components.module';
import {Subscription} from "rxjs/Subscription";

const DOG_ROUTES: Routes = [
  {
    path: ':rank',
    component: DogComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    CoreModule,
    RouterModule.forChild(DOG_ROUTES),
    MdComponentsModule
  ],
  declarations: [DogComponent]
})
export class DogModule { }
