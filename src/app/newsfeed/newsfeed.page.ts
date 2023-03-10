import { Component, OnInit } from '@angular/core';
import {FirebaseService} from "../services/firebase.service";
import {Router} from "@angular/router";
import {UserDetailsService} from "../services/user-details.service";

@Component({
  selector: 'app-newsfeed',
  templateUrl: './newsfeed.page.html',
  styleUrls: ['./newsfeed.page.scss'],
})
export class NewsfeedPage implements OnInit {

  newsFeed;

  constructor(
    public firebase: FirebaseService,
    public userDetails: UserDetailsService,
    public router: Router,
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.firebase.getNotes('newsFeed').subscribe((response) => {
      this.newsFeed = response;
    });
  }

}
