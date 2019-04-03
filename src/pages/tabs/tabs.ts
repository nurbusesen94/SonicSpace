import { Component } from '@angular/core';
import { MenuController } from 'ionic-angular';

import { NotificationPage } from "../notification/notification";
import { SearchPage } from "../search/search";
import {ActivityHomePage} from "../activity-home/activity-home";
import {ProfilePage} from "../profile/profile";


@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = ActivityHomePage;
  tab2Root = NotificationPage;
  tab3Root = SearchPage;
  tab4Root = ProfilePage;



  constructor(public menuCtrl: MenuController) {
    this.menuCtrl.swipeEnable(true);

  }

}
