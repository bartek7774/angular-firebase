import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';

import { CoreModule } from '../core/core.module';
import { environment } from './../../environments/environment';
import { CommentFormComponent } from './comments/comment-form/comment-form.component';
import { CommentsComponent, DialogConfirmation } from './comments/comments.component';
import { MdComponentsModule } from '../md-components.module';

@NgModule({
  imports: [
    CommonModule,
    CoreModule, // Access FormsModule, Loading, and Error components
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    MdComponentsModule
  ],
  declarations: [
    CommentsComponent,
    CommentFormComponent,
    DialogConfirmation
  ],
  entryComponents: [DialogConfirmation],
  exports: [
    CommentsComponent
  ]
})
export class CommentsModule { }
