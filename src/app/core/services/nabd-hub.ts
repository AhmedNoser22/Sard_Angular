import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Post, Reply } from '../models/nabd/post.model';
import { AppNotification } from '../models/nabd/notification.model';

@Injectable({ providedIn: 'root' })
export class NabdHubService {
  private connection: signalR.HubConnection | null = null;
  private startPromise: Promise<void> | null = null;
  private joinedPosts = new Set<number>();

  newPost$ = new Subject<Post>();
  newReply$ = new Subject<{ postId: number; reply: Reply }>();
  likeUpdated$ = new Subject<{ postId: number; likesCount: number }>();
  postDeleted$ = new Subject<number>();
  notification$ = new Subject<AppNotification>();
  replyDeleted$ = new Subject<{ postId: number; replyId: number }>();

  connect(token: string): void {
    if (this.connection?.state === signalR.HubConnectionState.Connected) return;

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.hubUrl}/hubs/nabd`, {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .build();

    this.connection.on('NewPost', (post: Post) => this.newPost$.next(post));
    this.connection.on('NewReply', (data: { postId: number; reply: Reply }) => this.newReply$.next(data));
    this.connection.on('LikeUpdated', (data: { postId: number; likesCount: number }) => this.likeUpdated$.next(data));
    this.connection.on('PostDeleted', (postId: number) => this.postDeleted$.next(postId));
    this.connection.on('ReplyDeleted', (data: { postId: number; replyId: number }) => this.replyDeleted$.next(data));
    this.connection.on('ReceiveNotification', (n: AppNotification) => this.notification$.next({ ...n, isRead: false }));

    this.connection.onreconnected(() => this.rejoinAllGroups());

    this.startPromise = this.connection
      .start()
      .then(() => this.rejoinAllGroups())
      .catch(err => {
        console.error('SignalR error:', err);
        throw err;
      });
  }

  private async rejoinAllGroups(): Promise<void> {
    if (!this.connection) return;
    const state: signalR.HubConnectionState = this.connection.state;
    if (state !== signalR.HubConnectionState.Connected) return;

    for (const postId of this.joinedPosts) {
      try {
        await this.connection.invoke('JoinPost', postId);
      } catch (err) {
        console.error(`Failed to rejoin post-${postId}:`, err);
      }
    }
  }

  async joinPost(postId: number): Promise<void> {
    this.joinedPosts.add(postId);

    if (!this.connection) return;

    const initialState: signalR.HubConnectionState = this.connection.state;
    if (initialState === signalR.HubConnectionState.Connected) {
      await this.connection.invoke('JoinPost', postId);
      return;
    }

    
    if (this.startPromise) {
      try {
        await this.startPromise;
        if (!this.connection) return;
        const stateAfterStart: signalR.HubConnectionState = this.connection.state;
        if (stateAfterStart === signalR.HubConnectionState.Connected) {
          await this.connection.invoke('JoinPost', postId);
        }
      } catch {
     
      }
    }
  }

  leavePost(postId: number): void {
    this.joinedPosts.delete(postId);
    this.connection?.invoke('LeavePost', postId);
  }

  disconnect(): void {
    this.joinedPosts.clear();
    this.connection?.stop();
    this.connection = null;
    this.startPromise = null;
  }
}