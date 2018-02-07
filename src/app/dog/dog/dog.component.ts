import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Title } from "@angular/platform-browser";
import { ApiService } from "../../core/api.service";
import { DogDetail } from "./../../core/dog-detail";
import { Subscription } from "rxjs/Subscription";
import { Observable } from "rxjs/Observable";
import { tap, catchError } from "rxjs/operators";
import { MediaChange, ObservableMedia } from "@angular/flex-layout";

@Component({
  selector: "app-dog",
  templateUrl: "./dog.component.html",
  styles: [
    `
    .dog-photo {
      background-repeat: no-repeat;
      background-position: 50% 50%;
      background-size: cover;
      min-height: 250px;
      width: 100%;
    }
    .dog-description{
      min-height: 250px;
    }
  `
  ]
})
export class DogComponent implements OnInit, OnDestroy {
  paramSub: Subscription;
  mediaSub: Subscription;
  dog$: Observable<DogDetail>;
  loading = true;
  error: boolean;
  panelOpenState = true;
  activeMediaQuery = false;
  index: number;
  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private title: Title,
    media: ObservableMedia
  ) {
    this.mediaSub = media
      .asObservable()
      .map((change: MediaChange) => change.mqAlias !== "xs")
      .subscribe(x => (this.activeMediaQuery = x));
  }

  ngOnInit() {
    console.log('ngOnInit');
    this.paramSub = this.route.params.subscribe(params => {
      this.index = +params.rank;
      this.dog$ = this.api
        .getDogByRank$(params.rank)
        .pipe(
          tap(val => this._onNext(val)),
          catchError((err, caught) => this._onError(err, caught))
        );
    });
  }

  private _onNext(val: DogDetail) {
    this.loading = false;
  }

  private _onError(err, caught): Observable<any> {
    this.loading = false;
    this.error = true;
    return Observable.throw(
      "An error occurred fetching detail data for this dog."
    );
  }

  getPageTitle(dog: DogDetail): string {
    const pageTitle = `#${dog.rank}: ${dog.breed}`;
    this.title.setTitle(pageTitle);
    return pageTitle;
  }

  getImgStyle(url: string) {
    return `url(${url})`;
  }

  ngOnDestroy() {
    this.paramSub.unsubscribe();
    this.mediaSub.unsubscribe();
  }
  get next() {
    return this.index + 1;
  }
  get prev() {
    return this.index - 1;
  }
}
