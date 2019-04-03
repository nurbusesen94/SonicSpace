import { Component, ViewChild } from '@angular/core';
import {Platform, Nav, MenuController} from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Storage } from '@ionic/storage';

import {AngularFireAuth} from "angularfire2/auth";
import {TabsPage} from "../pages/tabs/tabs";
import {WelcomePage} from "../pages/welcome/welcome";
import {Observable} from "rxjs/Observable";
import {AngularFireDatabase} from "angularfire2/database";




@Component({
  templateUrl: 'app.html'
})

export class MyApp {
  rootPage:any = WelcomePage;
  @ViewChild(Nav) nav: Nav;

  profileData: Observable<any>;

  constructor(private storage:Storage,public platform: Platform, public statusBar: StatusBar,
              public splashScreen: SplashScreen, private fire: AngularFireAuth,
              private FireDB: AngularFireDatabase,private menuCtrl: MenuController) {

    this.initializeApp();
  }

  initializeApp() {

    this.menuCtrl.enable(false);
    this.storage.get('loggedIn').then((res)=>{
      if(res === '1'){
        this.fire.auth.onAuthStateChanged(user=>{
          if(user){
            this.profileData = this.FireDB.object(`profile/${user.uid}`).valueChanges();
            this.profileData.subscribe();
            this.rootPage = TabsPage;
            this.splashScreen.hide();
          }
          else{

          }
        });
      }
      else{
        this.rootPage = WelcomePage;
        this.splashScreen.hide();
      }

      this.platform.ready().then(() => {

        this.statusBar.styleDefault();

      });

    })
  }
}
