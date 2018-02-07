import { MatDialog } from '@angular/material/dialog';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthModule } from './auth/auth.module';
import { CallbackComponent } from './callback.component';
import { CommentsModule } from './comments/comments.module';
import { CoreModule } from './core/core.module';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MdComponentsModule } from './md-components.module';


@NgModule({
  declarations: [
    AppComponent,
    CallbackComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MdComponentsModule,
    CoreModule.forRoot(),
    AuthModule.forRoot(),
    CommentsModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
