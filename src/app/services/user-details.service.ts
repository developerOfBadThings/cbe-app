import { Injectable } from '@angular/core';
import { LocalStorageService } from './local-storage.service';
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class UserDetailsService {

  allUserData;

  constructor(
    private localStorage: LocalStorageService,
    private router: Router,
  ) { }

  setCurrentUser = (username) => {
    this.localStorage.setData('loggedInUser', username);
    this.allUserData = this.localStorage.getData(username + 'statement');
  };

  getLoggedInUser() {
    return this.localStorage.getData('loggedInUser');
  }

  logout() {
    this.localStorage.removeData('loggedIn');
    this.localStorage.removeData('loggedInUser');
    return this.router.navigateByUrl('login');
  }


}
