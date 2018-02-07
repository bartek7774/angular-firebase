import { CommonModule } from '@angular/common';
import { DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

import { ApiService } from './api.service';
import { ErrorComponent } from './error.component';
import { HeaderComponent } from './header/header.component';
import { LoadingComponent } from './loading.component';
import { MdComponentsModule } from '../md-components.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    HttpClientModule, // AuthModule is a sibling and can use this without us exporting it
    FormsModule,
    MdComponentsModule
  ],
  declarations: [
    HeaderComponent,
    LoadingComponent,
    ErrorComponent
  ],
  exports: [
    FormsModule, // Export FormsModule so CommentsModule can use it
    HeaderComponent,
    LoadingComponent,
    ErrorComponent
  ]
})
export class CoreModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: CoreModule,
      providers: [
        Title,
        DatePipe,
        ApiService
      ]
    };
  }
}
