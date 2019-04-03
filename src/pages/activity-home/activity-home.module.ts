import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ActivityHomePage } from './activity-home';

@NgModule({
  declarations: [
    ActivityHomePage,
  ],
  imports: [
    IonicPageModule.forChild(ActivityHomePage),
  ],
})
export class ActivityHomePageModule {}
