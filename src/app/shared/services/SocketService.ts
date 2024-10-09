// socket.service.ts
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: Socket;

  constructor() {
    this.socket = io('http://localhost:3000');

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });
  }

  getSocket(): Socket {
    return this.socket;
  }

  sendChatMessage(message: any) {
    this.socket.emit('chat-message', message, (response: any) => {
      if (response.error) {
        console.error('Message sending error:', response.error);
      }
    });
  }

  onChatMessage(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('chat-message', (message) => {
        observer.next(message);
      });
    });
  }

  sendSignalingData(event: string, data: any) {
    this.socket.emit(event, data);
  }

  onSignalingEvent(event: string): Observable<any> {
    return new Observable((observer) => {
      this.socket.on(event, (data) => {
        observer.next(data);
      });
    });
  }

  onDisconnect(callback: (reason: any) => void) {
    this.socket.on('disconnect', callback);
  }
}
