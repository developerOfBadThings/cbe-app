import { Component } from '@angular/core';
import {Router} from '@angular/router';
import { LocalStorageService } from '../services/local-storage.service';
import {FirebaseService} from "../services/firebase.service";
import * as moment from 'moment';
import {UserDetailsService} from "../services/user-details.service";

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  userLoggedIn = false;
  loggedInUser;

  calfPrices;
  calfShareDate;
  calfShareAmount;
  currentCalfPrice;

  calfPrice;
  cattleUnit;
  myCattleUnits;
  myCattleUnitValue;

  isPayout = true;

  constructor(
    private router: Router,
    public userDetails: UserDetailsService,
    private firebase: FirebaseService,
    private localStorage: LocalStorageService,
  ) {

  }

  ionViewWillEnter() {
    this.checkLoggedIn();
  }

  checkLoggedIn = () =>  {
    this.userLoggedIn = this.localStorage.getData('loggedIn');
    this.loggedInUser = this.localStorage.getData('loggedInUser');
    if (!this.userLoggedIn) {
      return this.router.navigateByUrl('login');
    } else {
      this.getPageData();
    }
  };

  getPageData = () => {
    this.firebase.getNotes('kalfprys').subscribe((response) => {
      this.calfPrices = response;
      this.currentCalfPrice = this.calfPrices.sort((a, b) => {
        let am = moment(a.Maand, 'dd/mm/yyyy');
        let bm = moment(b.Maand, 'dd/mm/yyyy');
        let condition = am.isAfter(bm);
        let answer = condition ? -1 : 1;
        return answer;
      });
      if (this.currentCalfPrice[0]) {
        this.calfPrice = this.currentCalfPrice[0].Kalfprys;
        this.cattleUnit = this.currentCalfPrice[0].CBE;
      }
    });

    this.firebase.getNotes('updatedUserData').subscribe((response) => {
      if (response && response.length && response.length > 0) {
        let currentUserDatalist = response.filter((item) => {
          return item.username === this.loggedInUser;
        });

        if (currentUserDatalist &&
          currentUserDatalist.length &&
          currentUserDatalist.length > 0) {
          let currentUserData = JSON.parse(currentUserDatalist[0].userData);

          let userData = currentUserData.sort((a, b) => {
            let am = moment(a.Maand, 'dd/mm/yyyy');
            let bm = moment(b.Maand, 'dd/mm/yyyy');
            let condition = am.isAfter(bm);
            let answer = condition ? -1 : 1;
            return answer;
          });

          this.calfShareDate = userData[0] &&
                              userData[0]['Maand'] ?
                              userData[0]['Maand'] : undefined;

          this.calfShareAmount = userData[0] &&
                                userData[0]['Deeloes'] ?
                                userData[0]['Deeloes'] : 0;

          this.myCattleUnits = userData[0] &&
                              userData[0]['Getal CBE'] ?
                              userData[0]['Getal CBE'] : 0;

          this.myCattleUnitValue = (Number(this.cattleUnit) * this.myCattleUnits).toFixed(2);
        }
      }
    });
  };

}
