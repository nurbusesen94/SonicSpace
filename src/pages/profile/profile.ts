import { Component } from '@angular/core';
import {AlertController, App, IonicPage, NavController, NavParams, ToastController} from 'ionic-angular';
import { AngularFireAuth } from "angularfire2/auth";
import { AngularFireDatabase } from "angularfire2/database";
import { Observable } from 'rxjs/Observable';
import { EditprofilePage } from "../editprofile/editprofile";
import {FollowsPage} from "../follows/follows";
import {ChatPage} from "../chat/chat";
import {WelcomePage} from "../welcome/welcome";
import {Storage} from "@ionic/storage";


/**
 * Generated class for the ProfilePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {

  profileData: Observable<any>;
  firstName: string;
  lastName: string;
  profilePicURL: string;
  bio: string;

  followingsData: Observable<any>;
  followingsCount: number;
  isFollowing: boolean = false;

  followersData: Observable<any>;
  followersCount: number;

  searchedUid: string;

  ownFollowingsData: Observable<any>;
  ownProfile: boolean;
  ownUid: string;
  currentUid: string;

  postList = [];
  likeList = [];
  likedPostList = [];
  isLiked: boolean;
  postCount: number;
  profile_segment = "";

  constructor(private Fire: AngularFireAuth, private FireDB: AngularFireDatabase, public navParams: NavParams,
              public navCtrl: NavController, private toastCtrl: ToastController, private storage: Storage, private alertCtrl: AlertController, private app:App)
  {

  }
  ionViewWillEnter(){
    this.profile_segment = "grid";
    this.ownUid = this.Fire.auth.currentUser.uid;
    this.searchedUid = this.navParams.get('searchedUID');

    this.Fire.authState.take(1).subscribe(data => {
      if( (this.searchedUid !== undefined) && (this.searchedUid !== data.uid) ){
        this.ownProfile = false;
        this.goToProfile(this.searchedUid);
      }
      else if(this.Fire.auth.currentUser === null){
        this.ownUid = "";
        this.navCtrl.setRoot(WelcomePage);
      }
      else{
        this.ownProfile = true;
        this.goToProfile(data.uid);
      }
    })
  }
  goToProfile(uid){
    this.currentUid = uid;
    this.profileData = this.FireDB.object(`profile/${uid}`).valueChanges();
    this.profileData.subscribe(user=>{
      this.firstName = user['firstName'];
      this.lastName = user['lastName'];
      this.profilePicURL = user['profilePicURL'];
      this.bio = user['bio'];
    });

    this.followingsData = this.FireDB.list(`profile/${uid}/follows/followings`).valueChanges();
    this.followingsData.subscribe(data=>{
      this.followingsCount = data.length;

    });
    this.followersData = this.FireDB.list(`profile/${uid}/follows/followers`).valueChanges();
    this.followersData.subscribe(data=>{
      this.followersCount = data.length;

    });

    this.ownFollowingsData = this.FireDB.list(`profile/${this.ownUid}/follows/followings`).valueChanges();
    this.ownFollowingsData.subscribe(data=>{
      this.ownFollowingsData = data;
      if(data.includes(uid)){
        this.isFollowing = true;
      }
    });
    this.getOwnPost(uid);
    this.getLikedPosts();
  }
  getOwnPost(uid){
    this.FireDB.list(`profile/${uid}/posts`).valueChanges().subscribe(data=> {
      this.postList = [];
      if(data.length !== 0){
        this.postList.push(data.reverse());
      }
      this.postList = this.postList.sort(function (a,b) {
        return a.timestamp - b.timestamp;
      }).reverse();
      if(this.postList[0] === undefined){
        this.postCount = 0;
      }
      else {
        this.postCount = this.postList[0].length;
      }
    });
  }
  deletePost(post){
    let postname = 'post'+post['timestamp'].toString();
    let postRef = this.FireDB.object(`profile/${this.ownUid}/posts/${postname}`);
    postRef.remove();
    this.getOwnPost(this.ownUid);
  }
  likePost(post){
    let postname = 'post'+post['timestamp'].toString();
    let postRef = this.FireDB.object(`profile/${post['uid']}/posts/${postname}`);
    let likes_count = post['likes_count'];

    if(post['likes'] === undefined){
      post['likes'] = {
        [this.ownUid] : false
      };
    }
    this.isLiked = post['likes'][this.ownUid];
    if (this.isLiked == true){
      this.isLiked = post['likes'][this.ownUid];
      likes_count--;
      postRef.update({
        likes_count: likes_count,
        likes : {
          [this.ownUid] : false
        }
      })
    }
    else if((this.isLiked === undefined) || (this.isLiked == false)){
      this.isLiked = post['likes'][this.ownUid];
      likes_count++;
      postRef.update({
        likes_count: likes_count,
        likes : {
          [this.ownUid] : true
        }
      });
    }
  }
  updateProfile(){
    this.navCtrl.push(EditprofilePage,{
      uid: this.ownUid,
      firstName: this.firstName,
      lastName: this.lastName,
      profilePicURL: this.profilePicURL,
      bio: this.bio
    });
  }
  followUser(){
    let timestamp = Date.now();
    let notificationId = 'notification'+timestamp.toString();
    let notificationRef = this.FireDB.object(`profile/${this.searchedUid}/notifications/${notificationId}`);
    if(this.isFollowing != true){
      this.FireDB.object(`profile/${this.ownUid}/follows/followings/${this.searchedUid}`).set(this.searchedUid);
      this.FireDB.object(`profile/${this.searchedUid}/follows/followers/${this.ownUid}`).set(this.ownUid);
      this.isFollowing = true;
      notificationRef.set({
        type: "follow",
        uid: this.ownUid,
        timestamp: timestamp
      });
    }
    this.toastCtrl.create({
      message: 'Followed !',
      duration: 1500,
      position: 'bottom'
    }).present();
  }
  unfollowUser(){
    this.FireDB.object(`profile/${this.ownUid}/follows/followings/${this.searchedUid}`).remove();
    this.FireDB.list(`profile/${this.searchedUid}/follows/followers/${this.ownUid}`).remove();
    this.isFollowing = false;
    this.toastCtrl.create({
      message: 'Unfollowed !',
      duration: 1500,
      position: 'bottom'
    }).present();
  }
  followsPage(follows,uid){
    let follow = follows;
    if(follow == "followings"){
      this.navCtrl.push(FollowsPage,{
        "title": 1,
        "uid" : uid
      });
    }
    else if(follow == "followers"){
      this.navCtrl.push(FollowsPage,{
        "title": 2,
        "uid" : uid
      });
    }
    else{
      console.log("W00t?");
    }
  }
  startChat(uid){
    this.navCtrl.push(ChatPage,{
      "searchedUid" : uid
    })
  }
  doLogout(){
    let confirm = this.alertCtrl.create({
      title: 'Do you really want to sign out?',
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            this.app.getRootNavs()[0].setRoot(WelcomePage);
            this.Fire.auth.signOut();
            this.storage.set('loggedIn','0');

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
  getLikedPosts() {
    this.likeList = [];
    this.likedPostList = [];
    this.FireDB.list(`profile/${this.currentUid}/likes`).query.orderByValue().on('value', posts => {
      if ((posts.val() !== null) &&(posts.val() !== undefined)){
        let post = posts.val();
        let uid = Object.keys(post);
        for (let i = 0; i < uid.length;  i++){
          let postlist = Object.keys(post[uid[i]]);
          for (let j = 0; j < postlist.length; j++){
            let post = postlist[j];
            this.likeList.push([uid[i],post]);
          }
        }
        for (let k = 0; k < this.likeList.length; k++){
          if (this.likeList[k] != undefined){
            this.FireDB.list(`profile/${this.likeList[k][0]}/posts/${this.likeList[k][1]}`).query.orderByChild('timestamp').on('value',post=>{
              this.likedPostList.push(post.val());
            });
          }
          this.likedPostList = this.likedPostList.reverse();
        }
      }
    });
  }
  navigateToProfile(uid){
    this.navCtrl.push(ProfilePage,{
      searchedUID: uid});
  }
  doRefresh(refresher) {
    this.goToProfile(this.currentUid);

    setTimeout(() => {
      refresher.complete();
    }, 1500);
  }
}
