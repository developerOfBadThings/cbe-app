import { Component, ViewChild } from '@angular/core';
import {FirebaseService} from "../services/firebase.service";
import {LocalStorageService} from "../services/local-storage.service";
import {ModalController} from "@ionic/angular";
import {UserDetailsService} from "../services/user-details.service";
import * as moment from "moment";

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  currentPage: any = '';
  sellAmount;
  sellPrice;
  searchText: any = '';
  displayedUsers: any[] = [];
  transferAmount: any = 0;
  selectedUser: any = '';
  userSellAmount;
  currentCalfPrice;
  calfPrices = [];
  cattleUnit = 0;
  myCattleUnits;
  myCattleUnitValue;
  unitPriceToggle;
  sellOrderList: any = [];
  mySellOrderList: any = [];
  loggedInUser = this.localStorage.getData('loggedInUser');
  sellSegment = 'sell';
  hasAcceptedOrders = false;
  hasOpenOrders = false;
  showConfirmModal = false;
  modalDetails;
  userCBEList;
  transactionList = [];
  currentUserCBEList;
  errorMessage = '';
  mySellOrderTotalPrice;
  mySellOrderTotalAmount;

  @ViewChild('confirmModal') confirmModal: ModalController;

  constructor(
    public firebase: FirebaseService,
    public userDetails: UserDetailsService,
    public localStorage: LocalStorageService,
    public modalController: ModalController,
  ) {}

  setPage = (page) => {
    this.currentPage = page;
    this.errorMessage = '';
  };

  calculatePrice = () => {
    if (this.sellOrderList && this.sellOrderList.length && this.sellOrderList.length > 0) {
      for (let i = 0; i < this.sellOrderList.length; i++) {
        this.sellOrderList[i].price = this.cattleUnit * this.sellOrderList[i].amount;
      }
    }
  };

  subPageToggle() {
    this.errorMessage = '';
  }

  calculateSellAmount = () => {
    if (Number(this.sellAmount) > this.myCattleUnits) {
      this.sellAmount = this.myCattleUnits
    }
    this.sellPrice = (this.sellAmount * this.cattleUnit).toFixed(2);
  };

  calculateSellUnits = () => {
    this.sellAmount = (this.sellPrice / this.cattleUnit).toFixed(2);
  };

  calculateTransferAmount = () => {
    this.sellPrice = (this.sellAmount * this.cattleUnit).toFixed(2);
  };

  selectUser = (user) => {
    this.selectedUser = user;
  };

  // searchUsers = () => {
  //   this.displayedUsers = this.sellOrderList.filter((user) => {
  //     return user.sellUser.toLowerCase().includes(this.searchText) ||
  //       user.acceptedUser.includes(this.searchText);
  //   });
  // };

  segmentChanged(event) {
    this.sellSegment = event.detail.value;
    this.errorMessage = '';
  }

  countMySellOrderAmounts() {
    this.mySellOrderTotalAmount = 0;
    this.mySellOrderTotalPrice = 0;
    if (this.mySellOrderList &&
    this.mySellOrderList.length &&
    this.mySellOrderList.length > 0) {
      for (let i = 0; i < this.mySellOrderList.length; i++) {
        this.mySellOrderTotalAmount += Number(this.mySellOrderList[i].sellAmount);
        this.mySellOrderTotalPrice += this.mySellOrderList[i].sellPrice;
      }
    }
  }

  ionViewWillEnter() {
    this.loggedInUser = this.localStorage.getData('loggedInUser');
    // get sell orders
    this.firebase.getNotes('sellOrders').subscribe((response) => {
      this.sellOrderList = response;
      this.mySellOrderList = this.sellOrderList.filter((item) => {
        return item.sellUser === this.loggedInUser;
      });
      this.countMySellOrderAmounts();
      this.sellOrderList = this.sellOrderList.filter((item) => {
        return item.sellUser !== this.loggedInUser;
      });
      this.checkHasAccepted();
    });
    // get calf price
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
        this.currentCalfPrice = this.currentCalfPrice[0].Kalfprys;
        this.cattleUnit = this.currentCalfPrice * 450.34;
      }
    });
    // get user CBE amounts
    this.firebase.getNotes('updatedUserData').subscribe((response) => {
      this.userCBEList = response;
      this.currentUserCBEList = this.userCBEList.filter((item) => {
        return item.username === this.loggedInUser;
      });
      this.currentUserCBEList = this.currentUserCBEList[0];
      if (this.currentUserCBEList && this.currentUserCBEList.userData) {
        this.currentUserCBEList.data = JSON.parse(this.currentUserCBEList.userData);
      }
      this.myCattleUnitValue = this.cattleUnit * Number(this.currentUserCBEList.currentCBE);
    });
    // get transactions
    this.firebase.getNotes('transactions').subscribe((response) => {
      this.transactionList = response;
    });

  }

  checkHasAccepted() {
    if (this.sellOrderList &&
      this.sellOrderList.length &&
      this.sellOrderList.length > 0) {
      this.hasAcceptedOrders = false;
      this.hasOpenOrders = false;
      debugger;
      for (let item of this.sellOrderList) {
        if (item.accepted && this.loggedInUser === item.acceptedUser) {
          this.hasAcceptedOrders = true;
        } else if (!item.accepted) {
          this.hasOpenOrders = true;
        }
      }
    }
  }

  setBuyerPaid(event, item) {
    item.buyerPaid = event.detail.checked;
    return this.firebase.updateNote(item, 'sellOrders');
  }

  async setSellerReceived(event, item) {
    item.sellerReceived = event.detail.checked;
    if (item.sellerReceived) {
      await this.generateTransaction(item);
      item.completed = true;
    }
    return this.firebase.updateNote(item, 'sellOrders');
  }

  async generateTransaction(item) {
    let transactionNumberList = this.transactionList.map((item) => {
      return item.transactionNumber;
    });
    let sortedTransactionNumberList;
    if (transactionNumberList &&
      transactionNumberList.length &&
      transactionNumberList.length > 0) {
      sortedTransactionNumberList = transactionNumberList.sort((a, b) => {
        let am = a.transactionNumber;
        let bm = b.transactionNumber;
        let condition = am < bm;
        let answer = condition ? -1 : 1;
        return answer;
      });
    }
    let lastTransactionNumber = sortedTransactionNumberList &&
                                sortedTransactionNumberList[0] ?
                                sortedTransactionNumberList[0] : 0;
    let transaction = {
      sellerName: item.sellUser,
      sellerMemberNumber: item.sellUserMemberNumber ? item.sellUserMemberNumber : 0,
      buyerName: item.acceptedUser,
      buyerMemberNumber: item.acceptedUserMemberNumber ? item.acceptedUserMemberNumber : 0,
      sellAmount: item.sellAmount,
      sellPrice: item.sellPrice,
      sellDate: item.sellDate,
      transactionDate: new Date(),
      transactionNumber: lastTransactionNumber + 1,
      transactionCost: item.sellAmount * 0.1
    };
    await this.firebase.addNote(transaction, 'transactions');
    return this.doCalculations(item);
  }

  doCalculations(item) {
    for (let user of this.userCBEList) {
      debugger;
      user.totalCBE = Number(user.currentCBE) + Number(user.calfShare);
      if (user.memberNumber === item.sellUserMemberNumber) {
        user.totalCBE = Number(user.totalCBE) - Number(item.sellAmount);
      }
      if (user.memberNumber === item.acceptedUserMemberNumber) {
        user.totalCBE = Number(user.totalCBE) - (Number(item.sellAmount) * 0.1);
        user.totalCBE = Number(user.totalCBE) + item.sellAmount;
      }
    }
    debugger;
    this.userCBEList = {
      data: this.userCBEList.stringify()
    };
    return this.firebase.updateNote(this.userCBEList, 'userCBE');
  }

  openConfirmModal(event, item) {
    this.showConfirmModal = true;
    this.modalDetails = {
      event,
      item
    };
  }

  async dismissModal(type) {
    if (type === 'cancel') {
      this.modalDetails.event.detail.checked = false;
      await this.setSellerReceived(this.modalDetails.event, this.modalDetails.item);
    } else {
      await this.setSellerReceived(this.modalDetails.event, this.modalDetails.item);
    }
    this.showConfirmModal = false;
    return this.confirmModal.dismiss();
  }

  ionViewDidEnter() {
    this.calculatePrice();
    this.calculateSellAmount();
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

  removeSellOrder(sellOrder) {
    this.checkHasAccepted();
    sellOrder.accepted = false;
    sellOrder.acceptedUser = '-';
    sellOrder.acceptedAmount = '-';
    sellOrder.acceptedPrice = '-';
    sellOrder.buyerPaid = false;
    sellOrder.sellerReceived = false;
    return this.firebase.removeNote(sellOrder, 'sellOrders');
  }

  submitSellOrder() {
    if (this.sellPrice > 0 && Number(this.sellAmount) > 0) {
      if (this.sellPrice < this.myCattleUnitValue &&
        this.sellPrice < (this.myCattleUnitValue - this.mySellOrderTotalPrice) &&
        Number(this.sellAmount) < Number(this.currentUserCBEList.currentCBE) &&
        Number(this.sellAmount) < (Number(this.currentUserCBEList.currentCBE) - this.mySellOrderTotalAmount)) {
        this.errorMessage = '';
        let note = {
          sellPrice: this.sellPrice,
          sellAmount: this.sellAmount,
          sellUser: this.loggedInUser,
          sellDate: new Date()
        };
        return this.firebase.addNote(note, 'sellOrders');
      } else {
        this.errorMessage = 'You do not have enough CBE';
      }
    } else {
      this.errorMessage = 'Please enter a valid amount';
    }
  }

}
