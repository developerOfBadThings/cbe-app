import { Component } from '@angular/core';
import {FirebaseService} from "../services/firebase.service";
import {LocalStorageService} from "../services/local-storage.service";
import * as moment from 'moment';
import {UserDetailsService} from "../services/user-details.service";

@Component({
  selector: 'app-tab4',
  templateUrl: 'tab4.page.html',
  styleUrls: ['tab4.page.scss']
})
export class Tab4Page {

  today: any = new Date().toISOString();

  fromDate;
  toDate;

  loggedInUser;
  dbTable = 'userData';

  allUserData: any;

  displayedTransactions: any;

  constructor(
    public userDetails: UserDetailsService,
    public firebase: FirebaseService,
    public localStorage: LocalStorageService,
  ) {}

  ionViewWillEnter() {
    this.loggedInUser = this.localStorage.getData('loggedInUser');
    this.firebase.getNotes(this.dbTable).subscribe(res => {
      let userDetails = res.filter((item) => {
        return item.username === this.loggedInUser;
      });
      this.allUserData = userDetails[0];
      this.filterUserData();
    });
  }

  filterUserData() {
    if (this.fromDate || this.toDate) {
      let array = this.allUserData;
      if (this.fromDate) {
        array = array.filter((item) => {
          return moment(item.Maand, 'dd/mm/yyyy').isAfter(moment(this.fromDate))
        });
      }
      if (this.toDate) {
        array = array.filter((item) => {
          return moment(item.Maand, 'dd/mm/yyyy').isBefore(moment(this.toDate))
        });
      }
      this.displayedTransactions = array;
    } else {
      this.displayedTransactions = this.allUserData;
    }
  }

}
