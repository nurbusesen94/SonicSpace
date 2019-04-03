import { Component } from '@angular/core';
import {AlertController, IonicPage, NavController} from 'ionic-angular';
import {AngularFireAuth} from "angularfire2/auth";
import {AngularFireDatabase} from "angularfire2/database";
import {ChatPage} from "../chat/chat";
import {SearchPage} from "../search/search";
import * as firebase from "firebase";

@IonicPage()
@Component({
  selector: 'page-messagebox',
  templateUrl: 'messagebox.html',
})
export class MessageboxPage {

  ownUid: string;

  lastMessageList: Array<any> = [];
  uidArray: Array<string> = [];
  avatarList = [];
  isOpened: boolean = false;
  ownUsername: string;
  constructor(public navCtrl: NavController, private Fire: AngularFireAuth, private FireDB: AngularFireDatabase,private alertCtrl: AlertController) {
    this.ownUid = this.Fire.auth.currentUser.uid;
    this.FireDB.object(`/profile/${this.ownUid}`).valueChanges().subscribe(data=>{
      this.ownUsername = data['username'];
    });
    this.getLastMessages();
  }

  ionViewDidLoad() {

  }
  goSearch(){
    this.navCtrl.push(SearchPage);
  }
  getLastMessages(){
    this.uidArray = [];
    this.lastMessageList = [];
    this.FireDB.list(`/profile/${this.ownUid}/messages/`).query.orderByChild('timestamp').on('child_added',data=>{
      let searchedUid = data.key;
      firebase.database().ref(`profile/${searchedUid}`).once('value',snapshot=>{
        let profilePicURL = snapshot.val().profilePicURL;
        let uid = snapshot.key;

        this.FireDB.list(`/profile/${this.ownUid}/messages/${data.key}`).query.limitToLast(1).on('child_added',data=>{

          let message = data.val().message;
          let timestamp = data.val().timestamp;
          let sendername = data.val().sendername;
          let receivername = data.val().receivername;

          this.lastMessageList.push({uid:uid,message:message,timestamp:timestamp,sendername:sendername,receivername:receivername,profilePicURL:profilePicURL});

        });
      });
    });
    this.lastMessageList = this.lastMessageList.sort(function (a,b) {
      return a['timestamp'] - b['timestamp'];
    }).reverse();

  }
  startChat(uid,imageURL){
    this.isOpened = true;
    this.navCtrl.push(ChatPage,{
      searchedUid: uid,
      imageURL: imageURL
    });
  }
  clearAllMessages(){
    this.FireDB.list(`profile/${this.ownUid}/messages`).remove();
    this.uidArray = [];
    this.lastMessageList = [];
  }
  deleteMessage(uid){
    this.FireDB.list(`/profile/${this.ownUid}/messages/${uid}`).remove();
    this.getLastMessages();
  }
  presentConfirm(uid){
    let alert = this.alertCtrl.create({
      title: 'Clear Messages',
      message: 'Do you really want to delete all messages?',
      buttons: [
        {
          text: 'Confirm',
          role: 'confirm',
          handler: ()=>{
            this.deleteMessage(uid);
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
        }
      ]
    });
    alert.present();
  }
  doRefresh(refresher) {
    this.getLastMessages();

    setTimeout(() => {
      refresher.complete();
    }, 1500);
  }
}
