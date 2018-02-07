import { Component, Inject } from "@angular/core";
import {
  AngularFirestore,
  AngularFirestoreCollection,
  AngularFirestoreDocument
} from "angularfire2/firestore";
import { Observable } from "rxjs/Observable";
import { catchError, map } from "rxjs/operators";

import { AuthService } from "../../auth/auth.service";
import { Comment } from "./../comment";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA
} from "@angular/material/dialog";

@Component({
  selector: "app-comments",
  templateUrl: "./comments.component.html",
  styleUrls: ["./comments.component.css"]
})
export class CommentsComponent {
  private _commentsCollection: AngularFirestoreCollection<Comment>;
  comments$: Observable<Comment[]>;
  loading = true;
  error: boolean;

  constructor(
    private afs: AngularFirestore,
    public auth: AuthService,
    public dialog: MatDialog
  ) {
    // Get latest 15 comments from Firestore, ordered by timestamp
    this._commentsCollection = afs.collection<Comment>("comments", ref =>
      ref.orderBy("timestamp").limit(15)
    );
    // Set up observable of comments
    this.comments$ = this._commentsCollection
      .snapshotChanges()
      .pipe(
        map(res => this._onNext(res)),
        catchError((err, caught) => this._onError(err, caught))
      );
  }

  private _onNext(res) {
    this.loading = false;
    this.error = false;
    // Add Firestore ID to comments
    // The ID is necessary to delete specific comments
    return res.map(action => {
      const data = action.payload.doc.data() as Comment;
      const id = action.payload.doc.id;
      return { id, ...data };
    });
  }

  private _onError(err, caught): Observable<any> {
    this.loading = false;
    this.error = true;
    return Observable.throw("An error occurred while retrieving comments.");
  }

  onPostComment(comment: Comment) {
    // Unwrap the Comment instance to an object for Firestore
    // See https://github.com/firebase/firebase-js-sdk/issues/311
    const commentObj = <Comment>comment.getObj;
    this._commentsCollection.add(commentObj);
  }

  canDeleteComment(uid: string): boolean {
    if (!this.auth.loggedInFirebase || !this.auth.userProfile) {
      return false;
    }
    return uid === this.auth.userProfile.sub;
  }
  deleteComment(id: string): void {
    const dialogRef = this.dialog.open(DialogConfirmation, {
      width: "300px"
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const thisDoc: AngularFirestoreDocument<Comment> = this.afs.doc<
          Comment
        >(`comments/${id}`);
        thisDoc.delete();
      }
    });
  }
}

@Component({
  selector: "dialog-confirm",
  template: `<h1 mat-dialog-title>Warning</h1>
  <div mat-dialog-content>
    <p>Are you sure you want to delete your comment?</p>
  </div>
  <div mat-dialog-actions fxLayout="row" fxLayoutAlign="space-around center">
    <button mat-button [mat-dialog-close]="false" cdkFocusInitial>No</button>
    <button mat-button color="warn" [mat-dialog-close]="true">Yes</button>
  </div>`
})
export class DialogConfirmation {
  constructor(public dialogRef: MatDialogRef<DialogConfirmation>) {}
}
