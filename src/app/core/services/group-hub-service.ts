import { Injectable, NgZone, inject } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Group, GroupMessage } from '../models/group/group.model';

@Injectable({ providedIn: 'root' })
export class GroupHubService {
  private connection: signalR.HubConnection | null = null;
  private connectPromise: Promise<void> | null = null;
  private joinedGroupIds = new Set<number>();

  private readonly ngZone = inject(NgZone);

  readonly newMessage$ = new Subject<GroupMessage>();
  readonly messageReacted$ = new Subject<GroupMessage>();
  readonly messageDeleted$ = new Subject<GroupMessage>();
  readonly groupUpdated$ = new Subject<Group>();

  async connect(token: string): Promise<void> {
    if (
      this.connection &&
      this.connection.state === signalR.HubConnectionState.Connected
    ) {
      return;
    }

    if (this.connectPromise) {
      return this.connectPromise;
    }

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.hubUrl}/hubs/group`, {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .build();

    this.connection = connection;

    connection.on('NewGroupMessage', (msg: GroupMessage) => {
      this.ngZone.run(() => this.newMessage$.next(msg));
    });

    connection.on('MessageReacted', (msg: GroupMessage) => {
      this.ngZone.run(() => this.messageReacted$.next(msg));
    });

    connection.on('MessageDeleted', (msg: GroupMessage) => {
      this.ngZone.run(() => this.messageDeleted$.next(msg));
    });

    connection.on('GroupUpdated', (group: Group) => {
      this.ngZone.run(() => this.groupUpdated$.next(group));
    });

    connection.onreconnected(async () => {
      const ids = Array.from(this.joinedGroupIds);
      for (const id of ids) {
        try {
          await connection.invoke('JoinGroup', id);
        } catch {
          // تجاهل: هيحاول تاني في المرة الجاية لو لسه محتاج
        }
      }
    });

    connection.onclose(() => {
      if (this.connection === connection) {
        this.connection = null;
      }
    });

    this.connectPromise = connection.start();

    try {
      await this.connectPromise;
    } catch (err) {
      console.error('GroupHub error:', err);
      if (this.connection === connection) {
        this.connection = null;
      }
      throw err;
    } finally {
      this.connectPromise = null;
    }
  }

  async joinGroup(groupId: number): Promise<void> {
    if (this.connectPromise) {
      try {
        await this.connectPromise;
      } catch {
        return;
      }
    }

    const connection = this.connection;
    if (!connection || connection.state !== signalR.HubConnectionState.Connected) {
      return;
    }

    await connection.invoke('JoinGroup', groupId);
    this.joinedGroupIds.add(groupId);
  }

  async leaveGroup(groupId: number): Promise<void> {
    this.joinedGroupIds.delete(groupId);

    const connection = this.connection;
    if (!connection || connection.state !== signalR.HubConnectionState.Connected) {
      return;
    }

    await connection.invoke('LeaveGroup', groupId);
  }

  async disconnect(): Promise<void> {
    const connection = this.connection;
    this.connection = null;
    this.connectPromise = null;
    this.joinedGroupIds.clear();

    if (connection) {
      await connection.stop();
    }
  }
}