import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoChatRoutingModule } from './video-chat-routing.module';
import { VideoChatComponent } from './video-chat.component';
import { VideoCallComponent } from './video-call/video-call.component';
import { ChatComponent } from './chat/chat.component';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@NgModule({
  declarations: [
    VideoChatComponent,
    VideoCallComponent,
    ChatComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatSnackBarModule,
    MatButtonModule,
    MatIconModule,
    VideoChatRoutingModule,
  ]
})
export class VideoChatModule { }
