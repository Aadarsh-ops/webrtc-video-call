import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { io } from 'socket.io-client';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SocketService } from 'src/app/shared/services/SocketService';

@Component({
  selector: 'app-video-call',
  templateUrl: './video-call.component.html',
  styleUrls: ['./video-call.component.scss']
})
export class VideoCallComponent implements OnInit {
  @ViewChild('localVideo', { static: true }) localVideo!: ElementRef;

  isAudioEnabled: boolean = true; 
  isVideoEnabled: boolean = true; 

  localStream!: MediaStream;
  peerConnections: { [userId: string]: RTCPeerConnection } = {};
  socket: any;
  remoteStreams: MediaStream[] = [];
  iceCandidatesQueue: { [userId: string]: RTCIceCandidateInit[] } = {};

  constructor(private snackBar: MatSnackBar, private socketService: SocketService) {}

  iceConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
    ],
  };

  async ngOnInit() {
    this.socket = this.socketService.getSocket();
    await this.initLocalStream();
    this.listenForSignalingEvents();
  }

  async initLocalStream() {
    this.localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    this.localVideo.nativeElement.srcObject = this.localStream;
  }

  async startCall() {
    const userId = this.socket.id;
    if (this.peerConnections[userId]) {
      console.log("Already in a call, please disconnect before starting a new one.");
      return;
    }

    this.peerConnections[userId] = this.createPeerConnection(userId);
    this.localStream.getTracks().forEach((track) => {
      this.peerConnections[userId].addTrack(track, this.localStream);
    });

    const offer = await this.peerConnections[userId].createOffer();
    await this.peerConnections[userId].setLocalDescription(offer);
    this.socket.emit('webrtc-offer', { offer, userId });
  }

  createPeerConnection(userId: string) {
    const peerConnection = new RTCPeerConnection(this.iceConfig);

    peerConnection.ontrack = (event) => {
      const remoteStream = event.streams[0];
      if (remoteStream && !this.remoteStreams.includes(remoteStream)) {
        this.remoteStreams.push(remoteStream);
      }
    };

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit('webrtc-ice-candidate', { candidate: event.candidate, userId });
      }
    };

    return peerConnection;
  }

  listenForSignalingEvents() {
    this.socket.on('webrtc-offer', async ({ offer, userId }: { offer: RTCSessionDescriptionInit, userId: string }) => {
      if (!this.peerConnections[userId]) {
        this.peerConnections[userId] = this.createPeerConnection(userId);
        this.localStream.getTracks().forEach((track) => {
          this.peerConnections[userId].addTrack(track, this.localStream);
        });
      }
      await this.peerConnections[userId].setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await this.peerConnections[userId].createAnswer();
      await this.peerConnections[userId].setLocalDescription(answer);
      this.socket.emit('webrtc-answer', { answer, userId });
    });

    this.socket.on('webrtc-answer', async ({ answer, userId }: { answer: RTCSessionDescriptionInit, userId: string }) => {
      await this.peerConnections[userId].setRemoteDescription(new RTCSessionDescription(answer));
      const candidates = this.iceCandidatesQueue[userId] || [];
      candidates.forEach(async (candidate) => {
        await this.peerConnections[userId].addIceCandidate(new RTCIceCandidate(candidate));
      });
      this.iceCandidatesQueue[userId] = [];
    });

    this.socket.on('webrtc-ice-candidate', async ({ candidate, userId }: { candidate: RTCIceCandidateInit, userId: string }) => {
      if (this.peerConnections[userId]) {
        await this.peerConnections[userId].addIceCandidate(new RTCIceCandidate(candidate));
      } else {
        if (!this.iceCandidatesQueue[userId]) {
          this.iceCandidatesQueue[userId] = [];
        }
        this.iceCandidatesQueue[userId].push(candidate);
      }
    });
  }

  toggleVideo() {
    this.isVideoEnabled = !this.isVideoEnabled;
    this.localStream.getVideoTracks().forEach(track => {
      track.enabled = this.isVideoEnabled;
    });
    this.snackBar.open(this.isVideoEnabled ? 'Video Enabled' : 'Video Off', 'Close', {
      duration: 2000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

  toggleAudio() {
    this.isAudioEnabled = !this.isAudioEnabled;
    this.localStream.getAudioTracks().forEach(track => {
      track.enabled = this.isAudioEnabled;
    });
    this.snackBar.open(this.isAudioEnabled ? 'Audio Enabled' : 'Audio Muted', 'Close', {
      duration: 2000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

  async disconnectCall() {
    for (const userId in this.peerConnections) {
      if (this.peerConnections[userId]) {
        this.peerConnections[userId].close();
        delete this.peerConnections[userId];
      }
    }
    this.remoteStreams = [];
    this.localVideo.nativeElement.srcObject = null;
  }
}