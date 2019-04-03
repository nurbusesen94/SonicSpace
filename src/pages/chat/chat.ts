import { Component } from '@angular/core';
import {AlertController, IonicPage, NavController, NavParams} from 'ionic-angular';
import {AngularFireAuth} from "angularfire2/auth";
import {Message} from "../../models/message";
import {AngularFireDatabase} from "angularfire2/database";

@IonicPage()
@Component({
  selector: 'page-chat',
  templateUrl: 'chat.html',
})
export class ChatPage {

  messagesList: Array<Message> = [];
  message: string;

  senderUsername: any = "";
  receiverUsername: any = "";

  ownUid: string;
  toUid: string;
  photoURL: string;
  constructor(public alertCtrl: AlertController, public navCtrl: NavController, private Fire: AngularFireAuth, private FireDB: AngularFireDatabase, private navParams: NavParams) {

    this.ownUid = this.Fire.auth.currentUser.uid;
    this.toUid = this.navParams.get('searchedUid');
    this.photoURL = this.navParams.get('imageURL');
  }
  ionViewWillEnter(){
    this.FireDB.list(`/profile/${this.toUid}`).valueChanges().subscribe(data=>{
      this.receiverUsername = data[data.length-1];
    });
    this.FireDB.list(`/profile/${this.ownUid}`).valueChanges().subscribe(data=>{
      this.senderUsername = data[data.length-1];
    });
    this.FireDB.list(`/profile/${this.ownUid}/messages/${this.toUid}`).query.limitToLast(12)
      .on('child_added',snap=>{
        let message = snap.val().message;
        let timestamp = snap.val().timestamp;
        let sendername = snap.val().sendername;
        let receivername = snap.val().receivername;


        this.messagesList.push({message:message,timestamp:timestamp,sendername:sendername,receivername:receivername});
      });
    this.FireDB.list(`/profile/${this.ownUid}/messages/${this.toUid}`).query.limitToLast(12)
      .on('child_removed',snap=>{
        //console.log(snap.val());
        let message = snap.val().message;

        let index = this.messagesList.findIndex(i => i.message === message);
        this.messagesList.splice(index,1);


      });
  }
  sendMessage(post){
    if(post){
      this.message = post;

      this.FireDB.list(`profile/${this.ownUid}/messages/${this.toUid}`).push({
        'message' : this.message,
        'timestamp' : Date.now(),
        'sendername': this.senderUsername,
        'receivername': this.receiverUsername
      });
      this.FireDB.list(`profile/${this.toUid}/messages/${this.ownUid}`).push({
        'message' : this.message,
        'timestamp' : Date.now(),
        'sendername': this.senderUsername,
        'receivername': this.receiverUsername
      });
    }
    this.message = "";
  }

  deleteMessage(message){
    this.FireDB.list(`/profile/${this.ownUid}/messages/${this.toUid}`).query.orderByChild('message').equalTo(message)
      .on('child_added',snapshot=>{
        snapshot.ref.remove();
      })
  }

}
