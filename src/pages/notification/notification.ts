import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {AngularFireDatabase} from "angularfire2/database";
import {AngularFireAuth} from "angularfire2/auth";

/**
 * Generated class for the NotificationPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-notification',
  templateUrl: 'notification.html',
})
export class NotificationPage {

  ownUid: string;
  notificationsArray = [];
  constructor(public navCtrl: NavController, public navParams: NavParams,private FireDB: AngularFireDatabase, private fire: AngularFireAuth) {
    this.ownUid = this.fire.auth.currentUser.uid;
  }

  ionViewWillEnter() {
    this.getNotifications();
  }
  getNotifications(){
    this.notificationsArray = [];
    this.FireDB.object(`profile/${this.ownUid}/notifications`).query.on('value',snapshot=>{
      if (snapshot.val() !== null){
        let notifications = (Object.keys(snapshot.val()));
        for (var i = 0; i < notifications.length; i++){
          let notification = snapshot.val()[notifications[i]];
          let uid = notification['uid'];
          this.FireDB.list(`profile/${uid}`).query.on('value',user=>{
            if (notification['type'] == 'like'){
              this.notificationsArray.push(
                {
                  type: notification['type'],
                  username: user.val().username,
                  profilePicURL: user.val().profilePicURL,
                  post_id: notification['post_id'],
                  timestamp: notification['timestamp']
                });
            }
            else if (notification['type'] == 'follow'){
              this.notificationsArray.push(
                {
                  type: notification['type'],
                  username: user.val().username,
                  profilePicURL: user.val().profilePicURL,
                  timestamp: notification['timestamp']
                });
            }
          });
        }
        this.notificationsArray = this.notificationsArray.sort(function (a,b) {
          return a.timestamp - b.timestamp;
        }).reverse();
      }
      else {
        console.log('1');
      }
    });
  }
  doRefresh(refresher) {
    this.getNotifications();

    setTimeout(() => {
      refresher.complete();
    }, 1500);
  }

}
