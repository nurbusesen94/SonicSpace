import { Component } from '@angular/core';
import {AlertController, IonicPage, NavController, NavParams} from 'ionic-angular';
import {Profile} from "../../models/profile";
import {AngularFireDatabase} from "angularfire2/database";
import * as firebase from "firebase";
import {AngularFireAuth} from "angularfire2/auth";
import {Camera} from "@ionic-native/camera";

@IonicPage()
@Component({
  selector: 'page-editprofile',
  templateUrl: 'editprofile.html',
})
export class EditprofilePage {

  uid: string;
  profile = {} as Profile;
  error: string;

  public myPhotosRef: any;
  public myPhoto: any;
  public myPhotoURL: any;
  public firstname: string;
  public lastname: string;
  public bio: string;

  test: string;

  constructor(public navCtrl: NavController,  private FireDB: AngularFireDatabase,
              private alertCtrl: AlertController, private fire: AngularFireAuth,
              private camera: Camera, public navParams: NavParams) {

    this.uid = this.fire.auth.currentUser.uid;
    this.myPhotosRef = firebase.storage().ref(`${this.uid}`);
    this.firstname = this.navParams.get('firstName');
    this.lastname = this.navParams.get('lastName');
    this.bio = this.navParams.get('bio');
    //this.myPhotoURL = this.navParams.get('profilePicURL');

    this.FireDB.list(`profile/${this.uid}`).query.on('value',photo=>{
      this.myPhotoURL = photo.val().profilePicURL;
    })

  }
  updateProfile(firstname: string,lastname: string, bio: string){
    if(firstname != "" && lastname != "" && bio != ""){
      this.FireDB.object(`profile/${this.uid}`).update({
        'firstName': firstname,
        'lastName': lastname,
        'bio': bio
      }).then(data =>{
        this.navCtrl.pop();
      })
        .catch(error => {
        });
    }
    else {
      this.presentAlert();
    }
  }
  presentAlert(){
    this.alertCtrl.create({
      title: 'Error!',
      message: 'Fields cannot be null character!',
      buttons: ['OK']
    }).present();
  }
  takePhoto() {
    this.camera.getPicture({
      quality: 10,
      destinationType: this.camera.DestinationType.DATA_URL,
      sourceType: this.camera.PictureSourceType.CAMERA,
      encodingType: this.camera.EncodingType.PNG,
      saveToPhotoAlbum: true,
      targetWidth: 300,
      targetHeight: 300
    }).then(imageData => {
      this.myPhoto = imageData;
      this.uploadPhoto();
    }, error => {
      console.log("ERROR -> " + JSON.stringify(error));
    });
  }
  private uploadPhoto(): void {
    this.myPhotosRef.child('profilePic').child('myPhoto.png')
      .putString(this.myPhoto, 'base64', { contentType: 'image/png' })
      .then((savedPicture) => {
        this.myPhotoURL = savedPicture.downloadURL;
        this.FireDB.object(`profile/${this.uid}`).update({
          'profilePicURL': this.myPhotoURL
        });
        this.FireDB.list(`profile/${this.uid}/posts`).query.on('child_added',post=> {
          post.ref.update({
            'profilePicURL': this.myPhotoURL
          });
        });
      });
  }
  selectPhoto(): void {
    this.camera.getPicture({
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      destinationType: this.camera.DestinationType.DATA_URL,
      quality: 5,
      encodingType: this.camera.EncodingType.PNG,
      targetWidth: 300,
      targetHeight: 300
    }).then(imageData => {
      this.myPhoto = imageData;
      this.uploadPhoto();
    }, error => {
      console.log("ERROR -> " + JSON.stringify(error));
    });
  }
  dismiss(){
    this.navCtrl.pop();
  }
}
