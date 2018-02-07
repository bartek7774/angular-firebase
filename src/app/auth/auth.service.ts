import 'rxjs/add/observable/timer';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from 'angularfire2/auth';
import * as auth0 from 'auth0-js';
import { Observable } from 'rxjs/Observable';
import { mergeMap } from 'rxjs/operators';
import { Subscription } from 'rxjs/Subscription';

import { environment } from './../../environments/environment';

@Injectable()
export class AuthService {

  // Create Auth0 web auth instance
  private _auth0 = new auth0.WebAuth({
    clientID: environment.auth.clientID,
    domain: environment.auth.domain,
    responseType: 'token id_token',
    redirectUri: environment.auth.redirectUri,
    audience: environment.auth.audience,
    scope: environment.auth.scope
  });
  userProfile: any;
  // Track authentication status
  loggedIn: boolean;
  loading: boolean;
  // Track Firebase authentication status
  loggedInFirebase: boolean;
  // Subscribe to the Firebase token stream
  firebaseSub: Subscription;
  // Subscribe to Firebase renewal timer stream
  refreshFirebaseSub: Subscription;

  constructor(
    private router: Router,
    private afAuth: AngularFireAuth,
    private http: HttpClient) {
      // If authenticated, set local profile property and get new Firebase token.
      // If not authenticated but there are still items in localStorage, log out.
      const lsProfile = localStorage.getItem('profile');
      const lsToken = localStorage.getItem('access_token');

      if (this.tokenValid) {
        this.userProfile = JSON.parse(lsProfile);
        this.loggedIn = true;
        this._getFirebaseToken(lsToken);
      } else if (!this.tokenValid && lsProfile) {
        this.logout();
      }
  }

  login(redirect?: string) {
    // Set redirect after login
    const _redirect = redirect ? redirect : this.router.url;
    localStorage.setItem('auth_redirect', _redirect);
    // Auth0 authorize request
    this._auth0.authorize();
  }

  handleAuth() {
    this.loading = true;
    // When Auth0 hash parsed, get profile
    this._auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken) {
        window.location.hash = '';
        // Get Firebase token
        this._getFirebaseToken(authResult.accessToken);
        this._getProfile(authResult);
      } else if (err) {
        this.router.navigate(['/']);
        this.loading = false;
        console.error(`Error authenticating: ${err.error}`);
      }
    });
  }

  private _getProfile(authResult) {
    // Use access token to retrieve user's profile and set session
    this._auth0.client.userInfo(authResult.accessToken, (err, profile) => {
      if (profile) {
        this._setSession(authResult, profile);
      } else if (err) {
        console.warn(`Error retrieving profile: ${err.error}`);
      }
    });
  }

  private _setSession(authResult, profile) {
    // Set tokens and expiration in localStorage
    const expiresAt = JSON.stringify((authResult.expiresIn * 1000) + Date.now());
    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('expires_at', expiresAt);
    // Set profile information
    localStorage.setItem('profile', JSON.stringify(profile));
    this.userProfile = profile;
    // Session set; set loggedIn and loading
    this.loggedIn = true;
    this.loading = false;
    // Redirect to desired route
    this.router.navigate([localStorage.getItem('auth_redirect')]);
  }

  private _getFirebaseToken(accessToken) {
    // Detect if no valid access token passed into this method
    if (!accessToken) {
      this.login();
    }
    const getToken$ = () => {
      return this.http
        .get(`${environment.apiRoot}auth/firebase`, {
          headers: new HttpHeaders().set('Authorization', `Bearer ${accessToken}`)
        });
    };
    this.firebaseSub = getToken$().subscribe(
      res => this._firebaseAuth(res),
      err => console.error(`An error occurred fetching Firebase token: ${err.message}`)
    );
  }

  private _firebaseAuth(tokenObj) {
    this.afAuth.auth.signInWithCustomToken(tokenObj.firebaseToken)
      .then(res => {
        this.loggedInFirebase = true;
        // Schedule token renewal
        this.scheduleFirebaseRenewal();
        console.log('Successfully authenticated with Firebase!');
      })
      .catch(err => {
        const errorCode = err.code;
        const errorMessage = err.message;
        console.error(`${errorCode} Could not log into Firebase: ${errorMessage}`);
        this.loggedInFirebase = false;
      });
  }

  scheduleFirebaseRenewal() {
    // If user isn't authenticated, check for Firebase subscription
    // and unsubscribe, then return (don't schedule renewal)
    if (!this.loggedInFirebase) {
      if (this.firebaseSub) {
        this.firebaseSub.unsubscribe();
      }
      return;
    }
    // Unsubscribe from previous expiration observable
    this.unscheduleFirebaseRenewal();
    // Create and subscribe to expiration observable
    // Custom Firebase tokens minted by Firebase
    // expire after 3600 seconds (1 hour)
    const expiresAt = new Date().getTime() + (3600 * 1000);

    // operator of emits variable amounts of numbers in sequence
    const expiresIn$ = Observable.of(expiresAt)
      .pipe(
        mergeMap(
          expires => {
            const now = Date.now();
            // Use timer to track delay until expiration
            // to run the refresh at the proper time
            return Observable.timer(Math.max(1, expires - now));
          }
        )
      );

    this.refreshFirebaseSub = expiresIn$
      .subscribe(
        () => {
          console.log('Firebase token expired; fetching a new one');
          this._getFirebaseToken(localStorage.getItem('access_token'));
        }
      );
  }

  unscheduleFirebaseRenewal() {
    if (this.refreshFirebaseSub) {
      this.refreshFirebaseSub.unsubscribe();
    }
  }

  logout() {
    // Ensure all auth items removed from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('profile');
    localStorage.removeItem('expires_at');
    localStorage.removeItem('auth_redirect');
    this.userProfile = undefined;
    this.loggedIn = false;
    // Sign out of Firebase
    this.loggedInFirebase = false;
    this.afAuth.auth.signOut();
    // Return to homepage
    this.router.navigate(['/']);
  }

  get tokenValid(): boolean {
    // Check if current time is past access token's expiration
    const expiresAt = JSON.parse(localStorage.getItem('expires_at'));
    const tokenValid = Date.now() < expiresAt;
    return Date.now() < expiresAt;
  }

}
