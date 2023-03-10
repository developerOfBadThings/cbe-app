import {Component, OnInit, ViewChild} from '@angular/core';
import * as XLSX from 'xlsx';
import {Router} from '@angular/router';
import {LocalStorageService} from '../services/local-storage.service';
import {UserDetailsService} from '../services/user-details.service';
import {FirebaseService} from "../services/firebase.service";
import {ModalController} from "@ionic/angular";

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  segment = 'login';
  sheetUsers;
  cells;
  tableData;
  message;
  username;
  password;
  confirmPassword;
  fullName;
  physicalAddress;
  postalAddress;
  emailAddress;
  contactNumber;
  idNumber;
  vatNumber;
  companyNumber;
  companyRepresentative;
  representativeDesignation;
  accountName;
  bankName;
  accountType;
  accountNumber;
  memberNumber;
  userList;
  showAdminPopup;
  @ViewChild('confirmModal') confirmModal: ModalController;

  constructor(
    private router: Router,
    private localStorage: LocalStorageService,
    private userDetail: UserDetailsService,
    private firebase: FirebaseService,
  ) { }

  ngOnInit() {
    this.firebase.getNotes('users').subscribe((users) => {
      this.userList = users;
    });
  }

  readExcel = async (file: any) => {
    const fileReader = await new FileReader();
    fileReader.readAsArrayBuffer(file);

    fileReader.onload = (e: any) => {
      const bufferArray = e?.target.result;
      const wb = XLSX.read(bufferArray, {type: 'buffer', cellDates: true,
        dateNF: 'dd/mm/yyyy'});
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];

      this.tableData = XLSX.utils.sheet_to_json(ws, {raw: false});
      const fileName = file.name.split('.')[0];

      console.log(this.tableData);
    };
  };

  fileSelected = (e) => {
    const file = e.target.files[0];
    return this.readExcel(file);
  };

  login = () => {
    if (this.username && this.password) {
      if (this.userList && this.userList.length && this.userList.length > 0) {
        for (let i = 0; i < this.userList.length; i++) {
          if (this.userList[i].username === this.username) {
            if (this.userList[i].canLogin) {
              if (this.userList[i].password === this.password) {
                this.localStorage.setData('loggedIn', true);
                this.userDetail.setCurrentUser(this.username);
                if (this.username === 'consortiumBeef') {
                  this.showAdminPopup = true;
                } else {
                  return this.router.navigateByUrl('tabs');
                }
              } else {
                this.message = 'Incorrect username or password';
              }
            } else {
              this.message = 'You are not allowed to log in to the app. Contact an admin on beef@consortiumgroup.co.za';
            }
          }
        }
        if (!this.message) {
          this.message = 'User not found';
        }
      } else {
        if (this.message !== 'Incorrect username or password' &&
          this.message !== 'User not found') {
          this.message = 'User details not loaded into database';
        }
      }
    } else {
      this.message = 'username and password is required';
      return this.router.navigateByUrl('tabs');
    }
  };

  async dismissModal(type) {
    this.showAdminPopup = false;
    await this.confirmModal.dismiss();
    if (type === 'user') {
      return this.router.navigateByUrl('tabs');
    } else {
      return this.router.navigateByUrl('admin-settings');
    }
  }

  register = () => {
    let note = {
      // login info
      username: this.username,
      password: this.password,
      confirmPassword: this.confirmPassword,
      memberNumber: this.memberNumber,
      // personal info
      fullName: this.fullName ? this.fullName : '-',
      physicalAddress: this.physicalAddress ? this.physicalAddress : '-',
      postalAddress: this.postalAddress ? this.postalAddress : '-',
      emailAddress: this.emailAddress ? this.emailAddress : '-',
      contactNumber: this.contactNumber ? this.contactNumber : '-',
      idNumber: this.idNumber ? this.idNumber : '-',
      // company info
      vatNumber: this.vatNumber ? this.vatNumber : '-',
      companyNumber: this.companyNumber ? this.companyNumber : '-',
      companyRepresentative: this.companyRepresentative ? this.companyRepresentative : '-',
      representativeDesignation: this.representativeDesignation ? this.representativeDesignation : '-',
      // bank info
      accountName: this.accountName ? this.accountName : '-',
      bankName: this.bankName ? this.bankName : '-',
      accountType: this.accountType ? this.accountType : '-',
      accountNumber: this.accountNumber ? this.accountNumber : '-'
    };
    console.log(this.username + ' created');
    return this.firebase.addNote(note, 'users');
  };

  segmentChanged = (event) => {
    if (event.detail.value) {
      this.segment = event.detail.value;
    }
  };

}
