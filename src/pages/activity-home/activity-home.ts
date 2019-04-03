import {Component} from '@angular/core';
import {AlertController, IonicPage, MenuController, NavController, Platform} from 'ionic-angular';
import {MessageboxPage} from "../messagebox/messagebox";
import {AngularFireDatabase} from "angularfire2/database";
import * as firebase from "firebase";
import {Media, MediaObject} from "@ionic-native/media";
import {File} from "@ionic-native/file";
import {UserPost} from "../../models/userPost";
import {AngularFireAuth} from "angularfire2/auth";
import {ProfilePage} from "../profile/profile";


@IonicPage()
@Component({
  selector: 'page-activity-home',
  templateUrl: 'activity-home.html',
})
export class ActivityHomePage {

  recording: boolean = false;
  recordingDone: boolean = false;
  fileName: string;
  filePath: string;
  audio: MediaObject;
  postList = [];
  uidsList = [];
  data: any;

  downloadURL: string;
  newPost = {} as UserPost;
  timestamp: number;
  uid: string;
  username: string;
  profPicURL: string;
  firstname: string;
  lastname: string;

  isLiked: boolean = false;

  constructor(public navCtrl: NavController, private FireDB: AngularFireDatabase, private media: Media, private file: File,
              private platform: Platform, public menuCtrl: MenuController, private fire: AngularFireAuth, private alertCtrl: AlertController) {
    this.uid = this.FireDB.app.auth().currentUser.uid;
    this.FireDB.object(`profile/${this.fire.auth.currentUser.uid}`).valueChanges().subscribe(data => {
      this.username = data['username'];
      this.profPicURL = data['profilePicURL'];
      this.firstname = data['firstName'];
      this.lastname = data['lastName'];

    });
    this.getFollowingsPosts()

  }

  ionViewWillEnter() {
  }

  startRecord() {

    this.fileName = 'record' + new Date().getDate() + new Date().getMonth() + new Date().getFullYear() + new Date().getHours() + new Date().getMinutes() + new Date().getSeconds() + '.mp3';
    this.filePath = this.file.externalDataDirectory.replace(/file:\/\//g, '') + this.fileName;
    this.audio = this.media.create(this.filePath);

    this.audio.startRecord();
    this.recording = true;
    this.recordingDone = false;
  }

  stopRecord() {
    this.audio.stopRecord();
    this.data = {filename: this.fileName};
    this.recording = false;
    this.recordingDone = true;
    //this.postList.push(this.data);
  }

  playAudio() {
    if (this.platform.is('ios')) {
      this.filePath = this.file.documentsDirectory.replace(/file:\/\//g, '') + this.fileName;
      this.audio = this.media.create(this.filePath);
    } else if (this.platform.is('android')) {
      this.filePath = this.file.externalDataDirectory.replace(/file:\/\//g, '') + this.fileName;
      this.audio = this.media.create(this.filePath);
    }
    this.audio.play();
    this.audio.setVolume(1);
  }

  uploadNewPost() {

    this.timestamp = Date.now();
    let storageRef = firebase.storage().ref(`${this.fire.auth.currentUser.uid}/post${this.timestamp}/`);
    let metadata = {
      contentType: 'audio/mpeg',
    };
    this.newPost.postID = 'post'+JSON.stringify(this.timestamp);
    const audioFile = { name: this.fileName };
    this.file.readAsDataURL(this.file.externalDataDirectory, audioFile.name).then((data) => {
      if (data) {
        const uploadAudio = storageRef.child(`${this.fileName}`).putString(data,firebase.storage.StringFormat.DATA_URL,metadata);
        uploadAudio.on(firebase.storage.TaskEvent.STATE_CHANGED,
          (snapshot) => {
            //var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            //console.dir(progress);
          }, (error) => {
            console.dir(error);
          }, () => {
            this.downloadURL = uploadAudio.snapshot.downloadURL;
          });
        uploadAudio.then((savedAudio) => {
          this.FireDB.object(`profile/${this.fire.auth.currentUser.uid}/posts/${this.newPost.postID}`).set(
            {
              uid : this.fire.auth.currentUser.uid,
              username: this.username,
              audioFileURL: this.downloadURL,
              timestamp: this.timestamp,
              profilePicURL: this.profPicURL,
              likes_count : 0,
              firstname: this.firstname,
              lastname: this.lastname
            }).then(ok =>{

          }).catch(error =>{

          });
        });
      }
    });
    this.recordingDone = false;
  }

  getFollowingsPosts(){
    this.FireDB.list(`profile/${this.uid}/follows/followings`).query.on('child_added',snapshot=>{

    });
    this.FireDB.list(`profile/${this.uid}/follows/followings`).valueChanges().take(1).subscribe(data=>{
      data.push(this.uid);
      this.postList = [];
      for (var i = 0; i < data.length; i++){
        this.FireDB.list(`profile/${data[i]}/posts`).query.on('child_added',post=>{
          this.postList.push(post.val());
          this.postList.sort(function (a, b) {
            return b.timestamp - a.timestamp;
          });
        });
      }
    });
  }

  goToProfile(uid){
    this.navCtrl.push(ProfilePage,{
      searchedUID: uid});
  }

  deletePost(post) {

    let confirm = this.alertCtrl.create({
      title: 'Do you really want to sign out?',
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            let postname = 'post'+post['timestamp'].toString();
            let postRef = this.FireDB.object(`profile/${this.uid}/posts/${postname}`);
            postRef.remove();
            this.getFollowingsPosts();

          }
        },
        {
          text: 'No',
          handler: () => {
          }

        }
      ]
    });
    confirm.present();
  }
  likePost(post){
    let timestamp = Date.now();
    let notificationId = 'notification'+timestamp.toString();
    let postname = 'post'+post['timestamp'].toString();
    let postRef = this.FireDB.object(`profile/${post['uid']}/posts/${postname}`);
    let profileRef = this.FireDB.list(`profile/${this.uid}/likes/${post['uid']}/${postname}`);
    // let notificationRef = this.FireDB.object(`profile/${post['uid']}/notifications/like/${postname}`);
    let notificationRef = this.FireDB.object(`profile/${post['uid']}/notifications/${notificationId}`);
    let likes_count = post['likes_count'];

    if(post['likes'] === undefined){
      post['likes'] = {
        [this.uid] : false
      };
    }
    this.isLiked = post['likes'][this.uid];
    if (this.isLiked == true){
      likes_count--;
      postRef.update({
        likes_count: likes_count,
        likes : {
          [this.uid] :false
        }
      });
    }
    else if((this.isLiked === undefined) || (this.isLiked == false)){
      likes_count++;
      postRef.update({
        likes_count: likes_count,
        likes : {
          [this.uid] : true
        }
      });
      profileRef.push(postname);
      notificationRef.set({
        type: "like",
        uid: this.uid,
        post_id: postname,
        timestamp: timestamp
      })
    }
    this.getFollowingsPosts();
  }
  goMessage(){
    this.navCtrl.push(MessageboxPage);
  }
  doRefresh(refresher) {
    this.getFollowingsPosts();

    setTimeout(() => {
      refresher.complete();
    }, 2000);
  }

}



