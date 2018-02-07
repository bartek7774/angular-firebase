import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from './auth/auth.guard';
import { CallbackComponent } from './callback.component';

const routes: Routes = [
  {
    path: '',
    loadChildren: './dogs/dogs.module#DogsModule',
    pathMatch: 'full'
  },
  {
    path: 'dog',
    loadChildren: './dog/dog.module#DogModule',
    canActivate: [
      AuthGuard
    ]
  },
  {
    path: 'callback',
    component: CallbackComponent
  }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
