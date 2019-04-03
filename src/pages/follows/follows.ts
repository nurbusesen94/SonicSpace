import { Component } from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';
import {AngularFireDatabase} from "angularfire2/database";
import {ProfilePage} from "../profile/profile";
import {Observable} from "rxjs/Observable";
import {AngularFireAuth} from "angularfire2/auth";


@IonicPage()
@Component({
  selector: 'page-follows',
  templateUrl: 'follows.html',
})
export class FollowsPage {

  uid: string;
  title: number;
  followData: Observable<any>;
  userlist: Array<any> = [];
  avatarlist = [];
  data: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, private FireDB: AngularFireDatabase, private Fire: AngularFireAuth) {

    this.uid = this.navParams.get('uid');
    if(this.uid == undefined){
      this.uid = this.Fire.auth.currentUser.uid;
    }

    this.title = this.navParams.get('title');
    this.getFollowers();
  }

  getFollowers(){

    if(this.title == 1) {
      this.followData = this.FireDB.list(`profile/${this.uid}/follows/followings`).valueChanges();
    }
    else if(this.title == 2) {
      this.followData = this.FireDB.list(`profile/${this.uid}/follows/followers`).valueChanges();
    }

    this.followData.subscribe(data=>
    {
      this.userlist = [];
      this.avatarlist = [];
      this.data = data;
      for (let k = 0; k < data.length; k++) {
        this.FireDB.object(`/profile/${data[k]}`).valueChanges().subscribe(data => {
          let index = this.userlist.indexOf(data['username']);
          if(index > -1){
            this.userlist.splice(index,1);
          }
          else {
            this.userlist.push(data['username']);
            this.avatarlist.push(data['profilePicURL']);
          }
        });
      }
    });
  }

  goToProfile(uid) {
    this.navCtrl.push(ProfilePage, {
      "searchedUID": uid
    });
  }
}

