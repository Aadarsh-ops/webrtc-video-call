// chat.component.ts
import { Component, OnInit } from '@angular/core';
import { SocketService } from 'src/app/shared/services/SocketService';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit {
  messages: { user: string; text: string }[] = [];
  messageInput: string = '';
  username: string = `User-${Math.floor(Math.random() * 1000)}`;
  errorMessage: string = '';

  constructor(private socketService: SocketService) {}

  ngOnInit() {
    this.socketService.onChatMessage().subscribe({
      next: (message: any) => {
        this.messages.push(message);
      },
      error: (error: Error) => {
        this.errorMessage = 'Error receiving message: ' + error;
        console.error(this.errorMessage);
      },
    });

    this.socketService.onDisconnect((reason: any) => {
      console.warn('Disconnected from chat server:', reason);
      this.errorMessage = 'Disconnected from chat server. Please check your connection.';
    });
  }

  sendMessage() {
    if (this.messageInput.trim()) {
      const message = {
        user: this.username,
        text: this.messageInput,
      };

      this.socketService.sendChatMessage(message);
      this.messages.push(message);
      this.messageInput = '';
      this.errorMessage = '';
    } else {
      this.errorMessage = 'Message input cannot be empty';
      console.warn(this.errorMessage);
    }
  }
}
