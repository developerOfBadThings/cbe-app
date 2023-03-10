import { Component, OnInit } from '@angular/core';
import * as XLSX from 'xlsx';
import {FirebaseService} from "../services/firebase.service";
import * as moment from "moment";
import { format, parseISO } from 'date-fns';
import {LocalStorageService} from "../services/local-storage.service";
import {Router} from "@angular/router";
import {UserDetailsService} from "../services/user-details.service";
import {filter} from "rxjs/operators";

@Component({
  selector: 'app-admin-settings',
  templateUrl: './admin-settings.page.html',
  styleUrls: ['./admin-settings.page.scss'],
})
export class AdminSettingsPage implements OnInit {

  segment = 'setVariables';
  today = new Date().toISOString();
  tableData = [];
  sheetUsers = [];
  selectedUser;
  currentPage = {
    name: '',
    value: ''
  };
  newCalfPrice = 0.00;
  newCalfPriceDate = format(new Date().setDate(21), 'yyyy-MM-dd') + 'T09:00:00.000Z';
  newUserDataEntryDate = format(new Date().setDate(21), 'yyyy-MM-dd') + 'T09:00:00.000Z';
  newMemberFeeDate = format(new Date(), 'yyyy-MM-dd') + 'T09:00:00.000Z';
  newMemberFee = 0.00;
  calfPriceList;
  optionToggles = {
    showVariableOptions: false,
    showMemberOptions: false,
    showTransactionalOptions: false
  };
  windowToggles = {
    showCalfPriceWindow: false,
    showMemberFeeWindow: false,
    showNewsfeedWindow: false,
    showMemberLoginWindow: false,
    showDistinguishMemberWindow: false,
    showNonMemberUserWindow: false,
    showRegisteredNonUserWindow: false,
    showMemberTnCAcceptWindow: false,
    showMemberDataCaptureWindow: false,
    showMemberTotalCaptureWindow: false,
    showMemberPayoutWindow: false,
    showSellCattleUnitWindow: false,
    showSellRequestWindow: false,
    showTransactionListWindow: false,
    showPayoutRequestWindow: false,
    showMemberCalfshareWindow: false,
  };
  cells: any = [
    'A1',
    'B1',
    'C1',
    'D1',
    'E1',
  ];
  userList = [];
  pages: any = [
    {value: 'All user balances', name: 'allUserBalances'},
    {value: 'Single user statement', name: 'singleUserBalances'},
    {value: 'Monthly calf shares', name: 'monthlyCalfShare'},
  ];
  minDate;
  formattedDate = '';
  showPicker = false;
  loggedInUser = this.localStorage.getData('loggedInUser');
  memberFeeList = [];
  sellOrderList = [];
  hasAcceptedOrders = false;
  hasOpenOrders = false;
  showAllUserBalances = false;
  selectedUserDataList = [];
  newGetalCBE;
  newKalfprys;
  newDeeloes;
  newOmskepNaCBE;
  newTotaal;
  updatedUserDataList = [];
  newsfeedList = [];
  newNewsfeedMessage;
  runningTotal;
  newTotalChange;
  selectedChangeOperator;
  userDataList;
  totalsList;
  lastId = 0;
  calfShareTypeSelection;

  constructor(
    public firebase: FirebaseService,
    public localStorage: LocalStorageService,
    public userDetails: UserDetailsService,
    public router: Router,
  ) { }

  segmentChanged = (event) => {
    if (event.detail.value) {
      this.segment = event.detail.value;
    }
  };

  datePicked(date) {
    this.formattedDate = format(parseISO(date), 'dd/MM/yyyy');
    // this.togglePicker(false);
    this.newKalfprys = this.getCalfPriceForDate();
  }

  datePickedAndGenerate(date) {
    this.formattedDate = format(parseISO(date), 'dd/MM/yyyy');
    // this.togglePicker(false);
    this.newKalfprys = this.getCalfPriceForDate();
    this.calculateUserTotal();
  }

  calculateUserTotal() {
    let dateOneMonthAgo = moment(this.formattedDate, 'DD/MM/YYYY').subtract(1, 'month');
    debugger;
    let filteredData = this.selectedUserDataList[0].newData.filter((item) => {
      return moment(item.date, 'DD/MM/YYYY').isAfter(dateOneMonthAgo);
    });
    let sortedFilteredData = filteredData.sort((a, b) => {
      let am = moment(a.date, 'DD/MM/YYYY');
      let bm = moment(b.date, 'DD/MM/YYYY');
      let condition = am.isAfter(bm);
      let answer = condition ? -1 : 1;
      return answer;
    });
    let lastCalfShare = this.selectedUserDataList[0].calfShares.filter((item) => {
      return moment(item.Maand, 'DD/MM/YYYY').isAfter(dateOneMonthAgo);
    });
  }

  getCalfPriceForDate() {
    let calfPrice = 0;
    if (this.calfPriceList &&
    this.calfPriceList.length &&
    this.calfPriceList.length > 0) {
      for (let item of this.calfPriceList) {
        if (item.Maand === this.formattedDate) {
          calfPrice = item.Kalfprys;
        }
      }
    }
    return calfPrice;
  }

  ionViewWillEnter() {
    // get calf price
    this.firebase.getNotes('kalfprys').subscribe((response) => {
      this.calfPriceList = response;
      this.calfPriceList = this.calfPriceList.sort((a, b) => {
        let am = moment(a.Maand, 'DD/MM/YYYY');
        let bm = moment(b.Maand, 'DD/MM/YYYY');
        let condition = am.isAfter(bm);
        let answer = condition ? -1 : 1;
        return answer;
      });
      this.minDate = moment(this.calfPriceList[0].Maand).format('DD/MM/YYYY');
    });
    // get member fees
    this.firebase.getNotes('memberFee').subscribe((response) => {
      this.memberFeeList = response;
      this.memberFeeList = this.memberFeeList.sort((a, b) => {
        let am = moment(a.Date, 'DD/MM/YYYY');
        let bm = moment(b.Date, 'DD/MM/YYYY');
        let condition = am.isAfter(bm);
        let answer = condition ? -1 : 1;
        return answer;
      });
      if (this.memberFeeList && this.memberFeeList.length && this.memberFeeList.length > 0) {
        this.minDate = moment(this.memberFeeList[0].Date).format('DD/MM/YYYY');
      }
    });
    // get user list
    this.firebase.getNotes('users').subscribe((response) => {
      this.userList = response;
      this.userList = this.userList.sort((a, b) => {
        let am = a.username;
        let bm = b.username;
        let condition = am < bm;
        let answer = condition ? -1 : 1;
        return answer;
      });
    });
    // get sell orders
    this.firebase.getNotes('sellOrders').subscribe((response) => {
      this.sellOrderList = response;
      this.checkHasAccepted();
    });
    // get newsfeed list
    this.firebase.getNotes('newsfeed').subscribe((response) => {
      this.newsfeedList = response;
      this.newsfeedList = this.newsfeedList.sort((a, b) => {
        let am = moment(a.Date, 'DD/MM/YYYY');
        let bm = moment(b.Date, 'DD/MM/YYYY');
        let condition = am.isAfter(bm);
        let answer = condition ? -1 : 1;
        return answer;
      });
    });
  }

  selectedUserChanged() {
    if (this.selectedUser &&
      this.updatedUserDataList &&
      this.updatedUserDataList.length &&
      this.updatedUserDataList.length > 0) {
      this.selectedUserDataList = this.updatedUserDataList.filter((item) => {
        return item.username === this.selectedUser;
      });
    }
    if (!this.selectedUserDataList[0]) {
      this.selectedUserDataList = [{
        username: this.selectedUser,
        parsedData : [],
        parsedTotals : [],
      }];
    }
    this.datePicked(this.newUserDataEntryDate);
  }

  selectedOperatorChanged() {
    if (this.selectedUser &&
      this.updatedUserDataList &&
      this.updatedUserDataList.length &&
      this.updatedUserDataList.length > 0) {
      this.selectedUserDataList = this.updatedUserDataList.filter((item) => {
        return item.username === this.selectedUser;
      });
    }
  }

  // possible shared start
  checkHasAccepted() {
    if (this.sellOrderList &&
      this.sellOrderList.length &&
      this.sellOrderList.length > 0) {
      this.hasAcceptedOrders = false;
      this.hasOpenOrders = false;
      for (let item of this.sellOrderList) {
        if (item.accepted) {
          this.hasAcceptedOrders = true;
        } else {
          this.hasOpenOrders = true;
        }
      }
    }
  }

  acceptSellOrder(sellOrder) {
    this.checkHasAccepted();
    sellOrder.accepted = true;
    sellOrder.acceptedUser = this.loggedInUser;
    sellOrder.acceptedAmount = sellOrder.sellAmount;
    sellOrder.acceptedPrice = sellOrder.sellPrice;
    sellOrder.buyerPaid = false;
    sellOrder.sellerReceived = false;
    return this.firebase.updateNote(sellOrder, 'sellOrders');
  }

  cancelSellOrder(sellOrder) {
    this.checkHasAccepted();
    sellOrder.accepted = false;
    sellOrder.acceptedUser = '-';
    sellOrder.acceptedAmount = '-';
    sellOrder.acceptedPrice = '-';
    sellOrder.buyerPaid = false;
    sellOrder.sellerReceived = false;
    return this.firebase.updateNote(sellOrder, 'sellOrders');
  }

  setBuyerPaid(event, item) {
    item.buyerPaid = event.detail.checked;
    return this.firebase.updateNote(item, 'sellOrders');
  }
  // possible shared end

  ngOnInit() {
  }

  viewStatement = (page) => {
    if (page && page.name === 'singleUserBalances' && this.selectedUser) {
      // this.showSingleUserBalances = true;
    }
    if (page.name === 'allUserBalances' &&
      this.updatedUserDataList &&
      this.updatedUserDataList.length &&
      this.updatedUserDataList.length > 0) {
      this.showAllUserBalances = true;
    }
  };

  setPage = (page) => {
    this.currentPage = page;
  };

  saveToDatabase = async () => {
    if (this.tableData && this.tableData.length && this.tableData.length > 0) {
      for (var i = 0; i < this.tableData.length; i++) {
        if (this.tableData[i] && this.tableData[i].data && this.tableData[i].data.length && this.tableData[i].data.length > 0) {
          for (var j = 0; j < this.tableData[i].data.length; j++) {
            let note = this.tableData[i].data[j];
            await this.firebase.addNote(note, 'kalfprys')
          }
        }
      }
    }
  };

  addLoginBool(event, item) {
    item.canLogin = event.detail.checked;
    return this.firebase.updateNote(item, 'users');
  }

  addPayoutBool(event, item) {
    item.payout = event.detail.checked;
    return this.firebase.updateNote(item, 'users');
  }

  addIsMemberBool(event, item) {
    item.isMember = event.detail.checked;
    return this.firebase.updateNote(item, 'users');
  }

  async setUserTnCReaccept() {
    debugger;
    for (let item of this.userList) {
      if (!item.hasOwnProperty('tncAccepted')) {
        item.tncAccepted = true;
      }
      item.tncAccepted = !item.tncAccepted;
      await this.firebase.updateNote(item, 'users');
    }
  }

  addUserDataEntry() {
    if (this.selectedUserDataList[0].parsedData.length === 0) {
      this.selectedUserDataList[0].username = this.selectedUser;
      this.selectedUserDataList[0].currentCBE = this.newGetalCBE;
      this.selectedUserDataList[0].calfShare = this.newOmskepNaCBE;
    }
    this.selectedUserDataList[0].parsedData.push({
      Maand: this.formattedDate,
      'Getal CBE': this.newGetalCBE,
      'Deeloes CBE': this.newOmskepNaCBE
    });
    this.newGetalCBE = undefined;
    this.newDeeloes = undefined;
    this.newOmskepNaCBE = undefined;
  }

  addTotalChangeEntry() {
    if (!this.selectedUserDataList[0].parsedTotals) {
      this.selectedUserDataList[0].parsedTotals = [];
    }
    this.selectedUserDataList[0].parsedTotals.push({
      Date: this.formattedDate,
      Amount: this.newTotalChange,
      Operator: this.selectedChangeOperator,
      idNumber: this.lastId + 1
    });

    if (!this.totalsList) {
      this.totalsList = [];
    }
    this.totalsList.push({
      date: this.formattedDate,
      debit: this.selectedChangeOperator === 'Plus' ? this.newTotalChange : 0,
      credit: this.selectedChangeOperator === 'Minus' ? this.newTotalChange : 0,
      changeRefNumber: this.lastId + 1,
    });
    this.newTotalChange = undefined;
    this.selectedChangeOperator = undefined;
  }

  saveUserEntries() {
    let item;
    item = {
      userTotals: JSON.stringify(this.selectedUserDataList[0].parsedTotals ?
                                    this.selectedUserDataList[0].parsedTotals : []),
      newData: JSON.stringify(this.totalsList ? this.totalsList : []),
      userData: JSON.stringify(this.selectedUserDataList[0].parsedData),
      username: this.selectedUserDataList[0].username
    };
    if (this.selectedUserDataList[0].firebaseId) {
      item.firebaseId = this.selectedUserDataList[0].firebaseId;
      return this.firebase.updateNote(item, 'updatedUserData');
    } else {
      return this.firebase.addNote(item, 'updatedUserData');
    }
  }

  deleteUserTotalItem(item) {
    this.selectedUserDataList[0].parsedTotals.splice(item, 1);
  }

  deleteUserDataItem(item) {
    this.selectedUserDataList[0].parsedData.splice(item, 1);
  }

  deleteCalfPrice(calfItem) {
    return this.firebase.removeNote(calfItem, 'kalfprys');
  }

  deleteMemberFee(feeItem) {
    return this.firebase.removeNote(feeItem, 'memberFee');
  }

  deleteNewsfeedItem(feedItem) {
    return this.firebase.removeNote(feedItem, 'newsfeed');
  }

  // toggles
  toggleOptions(item) {
    for (let key in this.optionToggles) {
      this.optionToggles[key] = false;
    }
    this.optionToggles[item] = !this.optionToggles[item];
  }

  // button displays
  toggleWindows(item) {
    for (let key in this.windowToggles) {
      this.windowToggles[key] = false;
    }
    this.windowToggles[item] = !this.windowToggles[item];
  }

  togglePicker(condition) {
    if (condition === true || condition === false) {
      this.showPicker = condition;
    } else {
      this.showPicker = !this.showPicker;
    }
  }

  // submit logic
  submitCalfPrice() {
    let note = {
      CBE: (this.newCalfPrice * 450.34).toFixed(2),
      Kalfprys: this.newCalfPrice,
      Maand: this.formattedDate,
      UpdatedBy: this.loggedInUser
    };
    return this.firebase.addNote(note, 'kalfprys')
  }

  submitMemberFee() {
    let note = {
      MemberFee: this.newMemberFee,
      Date: this.formattedDate,
      UpdatedBy: this.loggedInUser
    };
    return this.firebase.addNote(note, 'memberFee')
  }

  submitNewsfeedItem() {
    if (this.newNewsfeedMessage) {
      this.datePicked(this.newMemberFeeDate);
      let note = {
        newsfeedItem: this.newNewsfeedMessage,
        Date: this.formattedDate,
        UpdatedBy: this.loggedInUser
      };
      this.newNewsfeedMessage = '';
      return this.firebase.addNote(note, 'newsfeed');
    }
  }

}
