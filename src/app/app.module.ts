import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import {IonicApp, IonicErrorHandler, IonicModule} from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
import { ProfilePage } from "../pages/profile/profile";
import { AngularFireModule } from "angularfire2";
import { AngularFireAuthModule } from "angularfire2/auth";
import {SearchPage} from "../pages/search/search";
import {AngularFireDatabaseModule} from "angularfire2/database";
import {EditprofilePage} from "../pages/editprofile/editprofile";
import {FollowsPage} from "../pages/follows/follows";
import {LocalNotifications} from "@ionic-native/local-notifications";
import {TabsPage} from "../pages/tabs/tabs";
import {ActivityHomePage} from "../pages/activity-home/activity-home";
import {NotificationPage} from "../pages/notification/notification";
import {ChatPage} from "../pages/chat/chat";
import {MessageboxPage} from "../pages/messagebox/messagebox";
import { AngularFirestoreModule} from "angularfire2/firestore";
import {MediaCapture} from "@ionic-native/media-capture";
import {Media} from "@ionic-native/media";
import {File} from "@ionic-native/file";

import {IonicStorageModule} from "@ionic/storage";
import {Base64} from "@ionic-native/base64";
import {Camera} from "@ionic-native/camera";
import {WelcomePage} from "../pages/welcome/welcome";
import { FcmProvider } from '../providers/fcm/fcm';

const FirebaseAuth = {
  apiKey: "AIzaSyAkeWzYnCbTmacuA3RWzI9kE8Y5ePM9_co",
  authDomain: "myapp-7a226.firebaseapp.com",
  databaseURL: "https://myapp-7a226.firebaseio.com",
  projectId: "myapp-7a226",
  storageBucket: "myapp-7a226.appspot.com",
  messagingSenderId: "832964868329"
};

@NgModule({
  declarations: [
    MyApp,
    ProfilePage,
    SearchPage,
    EditprofilePage,
    FollowsPage,
    TabsPage,
    ActivityHomePage,
    NotificationPage,
    ChatPage,
    MessageboxPage,
    WelcomePage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp,{
      scrollAssist: false
    }),
    AngularFireModule.initializeApp(FirebaseAuth),
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    AngularFirestoreModule,
    IonicStorageModule.forRoot(),


  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    ProfilePage,
    SearchPage,
    EditprofilePage,
    FollowsPage,
    TabsPage,
    ActivityHomePage,
    NotificationPage,
    ChatPage,
    MessageboxPage,
    WelcomePage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    LocalNotifications,
    MediaCapture,
    Media,
    File,
    Base64,
    Camera,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    FcmProvider
  ]
})
export class AppModule {}
