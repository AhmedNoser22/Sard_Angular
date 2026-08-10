import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, share } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Group, GroupMember, GroupMessage, CreateGroupRequest, SendMessageRequest, ReactToMessageRequest } from '../models/group/group.model';

@Injectable({ providedIn: 'root' })
export class GroupService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/groups`;

  private inFlightRequests = new Map<string, Observable<any>>();

  private dedupe<T>(key: string, factory: () => Observable<T>): Observable<T> {
    const existing = this.inFlightRequests.get(key);
    if (existing) return existing as Observable<T>;

    const request$ = factory().pipe(
      share(),
    );

    this.inFlightRequests.set(key, request$);

    request$.subscribe({
      complete: () => this.inFlightRequests.delete(key),
      error: () => this.inFlightRequests.delete(key),
    });

    return request$;
  }

  getMyGroups(): Observable<Group[]> {
    return this.http.get<Group[]>(this.baseUrl);
  }

  getGroup(groupId: number): Observable<Group> {
    return this.http.get<Group>(`${this.baseUrl}/${groupId}`);
  }

  createGroup(request: CreateGroupRequest): Observable<Group> {
    return this.http.post<Group>(this.baseUrl, request);
  }

  getMutuals(groupId: number): Observable<GroupMember[]> {
    return this.http.get<GroupMember[]>(`${this.baseUrl}/${groupId}/mutuals`);
  }

  addMember(groupId: number, userId: string): Observable<Group> {
    const key = `addMember:${groupId}:${userId}`;
    return this.dedupe(key, () =>
      this.http.post<Group>(`${this.baseUrl}/${groupId}/members/${userId}`, {})
    );
  }

  removeMember(groupId: number, userId: string): Observable<Group> {
    const key = `removeMember:${groupId}:${userId}`;
    return this.dedupe(key, () =>
      this.http.delete<Group>(`${this.baseUrl}/${groupId}/members/${userId}`)
    );
  }

  promoteToAdmin(groupId: number, userId: string): Observable<Group> {
    const key = `promote:${groupId}:${userId}`;
    return this.dedupe(key, () =>
      this.http.post<Group>(`${this.baseUrl}/${groupId}/members/${userId}/promote`, {})
    );
  }

  demoteFromAdmin(groupId: number, userId: string): Observable<Group> {
    const key = `demote:${groupId}:${userId}`;
    return this.dedupe(key, () =>
      this.http.post<Group>(`${this.baseUrl}/${groupId}/members/${userId}/demote`, {})
    );
  }

  toggleLock(groupId: number): Observable<Group> {
    const key = `toggleLock:${groupId}`;
    return this.dedupe(key, () =>
      this.http.post<Group>(`${this.baseUrl}/${groupId}/toggle-lock`, {})
    );
  }

  getMessages(groupId: number, page = 1): Observable<GroupMessage[]> {
    return this.http.get<GroupMessage[]>(`${this.baseUrl}/${groupId}/messages?page=${page}`);
  }

  sendMessage(groupId: number, request: SendMessageRequest): Observable<GroupMessage> {
    return this.http.post<GroupMessage>(`${this.baseUrl}/${groupId}/messages`, request);
  }

  reactToMessage(groupId: number, messageId: number, emoji: string): Observable<GroupMessage> {
    const key = `react:${groupId}:${messageId}`;
    const request: ReactToMessageRequest = { emoji };
    return this.dedupe(key, () =>
      this.http.post<GroupMessage>(`${this.baseUrl}/${groupId}/messages/${messageId}/react`, request)
    );
  }

  deleteMessage(groupId: number, messageId: number): Observable<GroupMessage> {
    const key = `delete:${groupId}:${messageId}`;
    return this.dedupe(key, () =>
      this.http.delete<GroupMessage>(`${this.baseUrl}/${groupId}/messages/${messageId}`)
    );
  }
}