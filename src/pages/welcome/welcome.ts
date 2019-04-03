import { Component } from '@angular/core';
import {AlertController, IonicPage, MenuController, NavController, NavParams, ToastController} from 'ionic-angular';
import {Profile} from "../../models/profile";
import { User } from "../../models/user";
import {TabsPage} from "../tabs/tabs";
import {AngularFireAuth} from "angularfire2/auth";
import {AngularFireDatabase} from "angularfire2/database";
import { Storage } from '@ionic/storage';


@IonicPage()
@Component({
  selector: 'page-welcome',
  templateUrl: 'welcome.html',


})

export class WelcomePage {
  user = {} as User;
  error: string;
  isSignOrReg="sign";
  isSearched: boolean=false;
  profile = {} as Profile;
  constructor(private storage:Storage,public forgotCtrl: AlertController,public toastCtrl: ToastController, private fireDB: AngularFireDatabase,public navCtrl: NavController,private alertCtrl: AlertController,private fire: AngularFireAuth, public navParams: NavParams,public menuCtrl: MenuController) {
    this.menuCtrl.swipeEnable(false);
  }

  alert(message: string){
    this.alertCtrl.create({
      title:'Info',
      subTitle:message,
      buttons:['OK']
    }).present();
  }


  personalHomePage(user: User) {

    if(user['email'] && user['password']){
      this.fire.auth.signInWithEmailAndPassword(user.email,user.password)
        .then(data => {
          //this.fire.authState.subscribe(auth=>{
            this.storage.set('loggedIn','1');
            this.navCtrl.setRoot(TabsPage, {
              isSearched: this.isSearched
            });
        })
        .catch(error => {
          this.presentAlert(error);
        });
    }
    else{
      this.alertCtrl.create({
        title: 'Error!',
        message: 'Null character founded!',
        buttons: ['OK']
      }).present();
    }
  }

  goRegister(){
    this.isSignOrReg="reg"
  }

  goLogin() {

    this.isSignOrReg = "sign"

  }

  signUpUser(user: User, profile: Profile){
    if(this.profile['username']&& this.profile['firstName']&& this.profile['lastName'] && this.user['email'] && this.user['password']){
      this.fireDB.list(`/profile/`).query.orderByChild('username').equalTo(this.profile['username'])
        .once('value',data => {
          if (data.exists()){
            this.alertCtrl.create({
              title: 'Error!',
              message: 'This username is exist in database',
              buttons: ['OK']
            }).present();
          }
          else {
            this.fire.auth.createUserWithEmailAndPassword(this.user.email, this.user.password)
              .then(page => {
                this.fire.authState.subscribe(auth => {
                  profile.profilePicURL = "https://firebasestorage.googleapis.com/v0/b/first-project-35779.appspot.com/o/newProfile%2Fplaceholder-face-big.png?alt=media&token=64f15ad1-373d-4308-b3ba-a50e72af90d1";
                  profile.bio = "About Me";
                  this.fireDB.object(`profile/${auth.uid}`).set(profile).then(() => {

                    this.isSignOrReg = "sign"

                  })
                    .catch(error => {
                      this.presentAlert(error);
                    });
                });
              })
              .catch(error => {
                this.presentAlert(error);
              });
          }
        });
    }

    else{
      this.alertCtrl.create({
        title: 'Error!',
        message: 'Null character founded!',
        buttons: ['OK']
      }).present();
    }


  }

  presentAlert(error){
    this.alertCtrl.create({
      title: 'Error!',
      message: error,
      buttons: ['OK']
    }).present();

  }

  showForgotPassword() {
    let forgot = this.forgotCtrl.create({
      title: 'Forgot Password',
      message: "Please write your email address for reset.",
      inputs: [
        {
          name: 'email',
          placeholder: 'Email',
          type: 'email'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {

          }
        },
        {
          text: 'Send',
          handler: data => {
            this.fire.auth.sendPasswordResetEmail(data.email).then(res=>{
              let toast = this.toastCtrl.create({
                message: 'Successfully sended.',
                duration: 3000,
                position: 'bottom',
                cssClass: 'dark-trans',
                closeButtonText: 'OK',
                showCloseButton: true
              });
              toast.present();
            }).catch( res=>{
              let toast = this.toastCtrl.create({
                message: 'Wrong email address.',
                duration: 3000,
                position: 'bottom',
                cssClass: 'dark-trans',
                closeButtonText: 'OK',
                showCloseButton: true
              });
              toast.present();
            })


          }
        }
      ]
    });
    forgot.present();
  }
}
