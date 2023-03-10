import { Component } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import {LocalStorageService} from "../services/local-storage.service";
import {UserDetailsService} from "../services/user-details.service";

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {

  details:any = {
    firebaseId: '',
    fullName: '',
    username: '',
    password: '',
    memberNumber: '',
    confirmPassword: '',
    physicalAddress: '',
    postalAddress: '',
    emailAddress: '',
    contactNumber: '',
    idNumber: '',
    vatNumber: '',
    companyNumber: '',
    companyRepresentative: '',
    representativeDesignation: '',
    accountName: '',
    bankName: '',
    accountType: '',
    accountNumber: '',
  };

  dbTable = 'users';

  loggedInUser;

  constructor(
    public userDetails: UserDetailsService,
    private firebase: FirebaseService,
    private localStorage: LocalStorageService,
  ) {
  }

  ionViewWillEnter() {
    this.getAccountDetails();
  }

  updateAccountDetails = () => {
    return this.firebase.updateNote(this.userDetails, this.dbTable);
  };

  getAccountDetails = () => {
    this.loggedInUser = this.localStorage.getData('loggedInUser');
    this.firebase.getNotes(this.dbTable).subscribe(res => {
      let userDetails = res.filter((item) => {
        return item.username === this.loggedInUser;
      });
      if (userDetails && userDetails.length && userDetails.length > 0) {
        this.details = userDetails[0];
      }
    });

  };

}
