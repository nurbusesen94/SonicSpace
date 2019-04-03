import { Component } from '@angular/core';
import {IonicPage, NavController} from 'ionic-angular';
import * as firebase from "firebase";
import {ProfilePage} from "../profile/profile";

@IonicPage()
@Component({
  selector: 'page-search',
  templateUrl: 'search.html',
})
export class SearchPage {

  usersList: any = [];
  avatarList: any = [];
  loadedUsersList:any = [];
  constructor(public navCtrl: NavController) {
  }

  ionViewWillEnter(){
    this.initializeDB();
  }
  initializeDB(){

    this.usersList = [];
    this.avatarList = [];
    firebase.database().ref('profile').orderByChild('username')
      .once('value')
      .then(snapshot => snapshot.val())
      .then(users => {

        let key = Object.keys(users);
        for(let i = 0;i < key.length; i++){
          this.usersList.push(users[key[i]]['username']);
        }
      });
  }
  goToProfile(param: string){

    firebase.database().ref('profile').orderByChild('username').equalTo(param['username'])
      .once('value')
      .then(snapshot => snapshot.val())
      .then(uid => {
        let key = Object.keys(uid);
        let u_id = key[0];
        this.navCtrl.push(ProfilePage,{
          searchedUID: u_id});
      });
  }
  filterItems(event: any){

    this.avatarList = [];
    let search = event.target.value;
    if (search !== null && search !== ''){
      this.loadedUsersList = this.usersList;
      this.loadedUsersList = this.loadedUsersList.filter(function (item) {
        return item.toLocaleString().includes(search);
      });
    }
    else{
      this.loadedUsersList = [];
      this.avatarList = [];
    }
    for (var i=0; i < this.loadedUsersList.length; i++){
      firebase.database().ref('profile').orderByChild('username').equalTo(this.loadedUsersList[i])
        .once('value')
        .then(snapshot => snapshot.val())
        .then(avatars => {
          let uid = Object.keys(avatars).toString();
          this.avatarList.push(avatars[uid]);
        });
    }
  }
}
