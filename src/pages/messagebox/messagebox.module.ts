import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MessageboxPage } from './messagebox';

@NgModule({
  declarations: [
    MessageboxPage,
  ],
  imports: [
    IonicPageModule.forChild(MessageboxPage),
  ],
})
export class MessageboxPageModule {}
