import { Component, inject, signal, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { GroupService } from '../../../core/services/group-service';
import { GroupHubService } from '../../../core/services/group-hub-service';
import { TokenService } from '../../../core/services/tokenService';
import { Group, GroupMember, GroupMessage, MessageReaction } from '../../../core/models/group/group.model';

interface Toast {
  id: number;
  type: 'success' | 'error';
  message: string;
}

interface ConfirmState {
  message: string;
  action: () => void;
}

interface ReactorsModalState {
  reactions: MessageReaction[];
  activeEmoji: string;
}

const LONG_PRESS_MS = 420;
const NEAR_BOTTOM_THRESHOLD = 90;

@Component({
  selector: 'app-group-chat',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './group-chat.html',
  styleUrl: './group-chat.scss'
})
export class GroupChatComponent implements OnInit, OnDestroy {
  @ViewChild('messagesEnd') messagesEnd!: ElementRef<HTMLDivElement>;
  @ViewChild('messagesContainer') messagesContainer!: ElementRef<HTMLDivElement>;

  private readonly groupService = inject(GroupService);
  private readonly hubService = inject(GroupHubService);
  private readonly tokenService = inject(TokenService);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private subs = new Subscription();
  private toastIdCounter = 0;
  private longPressTimer: any = null;
  private longPressTriggered = false;

  group = signal<Group | null>(null);
  messages = signal<GroupMessage[]>([]);
  mutuals = signal<GroupMember[]>([]);
  isLoading = signal(true);
  isSending = signal(false);
  showMembers = signal(false);
  showAddMember = signal(false);
  isLocked = signal(false);
  activeReactionPicker = signal<number | null>(null);
  reactorsModal = signal<ReactorsModalState | null>(null);
  toasts = signal<Toast[]>([]);
  confirmDialog = signal<ConfirmState | null>(null);
  isNearBottom = signal(true);
  newMessagesCount = signal(0);

  private pendingReactionMessageId: number | null = null;
  pendingReactionSignal = signal<number | null>(null);

  reactionEmojis = ['❤️', '😂', '👍', '😮', '😢', '😡'];

  groupId = 0;
  currentUserId = this.tokenService.getUser()?.id ?? '';

  form = this.fb.group({
    content: ['', [Validators.required, Validators.maxLength(2000)]]
  });

  async ngOnInit(): Promise<void> {
    this.groupId = Number(
      this.route.snapshot.paramMap.get('groupId')
    );

    const token = this.tokenService.getToken();

    if (token) {
      await this.hubService.connect(token);
      await this.hubService.joinGroup(this.groupId);
    }

    this.hubService.joinGroup(this.groupId);

    this.groupService.getGroup(this.groupId).subscribe({
      next: group => {
        this.group.set(group);
        this.isLocked.set(group.isLocked);
        this.isLoading.set(false);
      },
      error: err => {
        this.isLoading.set(false);
        this.toastError(this.getErrorMessage(err));
      }
    });

    this.groupService.getMessages(this.groupId).subscribe({
      next: messages => {
        this.messages.set(messages);
        this.scrollToBottom(false);
      }
    });

    this.subs.add(this.hubService.newMessage$.subscribe(msg => {
      if (msg.groupId !== this.groupId) return;
      const isMine = msg.senderId === this.currentUserId;
      this.appendOrUpdateMessage(msg);

      if (isMine || this.isNearBottom()) {
        this.scrollToBottom(true);
        this.newMessagesCount.set(0);
      } else {
        this.newMessagesCount.update(n => n + 1);
      }
    }));

    this.subs.add(this.hubService.messageReacted$.subscribe(msg => {
      if (msg.groupId === this.groupId) this.appendOrUpdateMessage(msg);
    }));

    this.subs.add(this.hubService.messageDeleted$.subscribe(msg => {
      if (msg.groupId === this.groupId) this.appendOrUpdateMessage(msg);
    }));

    this.subs.add(this.hubService.groupUpdated$.subscribe(g => {
      if (g.id === this.groupId) {
        this.group.set(g);
        this.isLocked.set(g.isLocked);
      }
    }));
  }

  ngOnDestroy(): void {
    this.hubService.leaveGroup(this.groupId);
    this.subs.unsubscribe();
    this.clearLongPressTimer();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.activeReactionPicker() === null) return;
    const target = event.target as HTMLElement;
    if (!target.closest('.chat-bubble__tool-btn') && !target.closest('.reaction-picker') && !target.closest('.chat-bubble')) {
      this.activeReactionPicker.set(null);
    }
  }

  onMessagesScroll(): void {
    const el = this.messagesContainer?.nativeElement;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const nearBottom = distanceFromBottom < NEAR_BOTTOM_THRESHOLD;
    this.isNearBottom.set(nearBottom);
    if (nearBottom) this.newMessagesCount.set(0);
  }

  jumpToBottom(): void {
    this.scrollToBottom(true);
    this.newMessagesCount.set(0);
  }

  sendMessage(): void {
    if (this.form.invalid || this.isSending()) return;
    this.isSending.set(true);

    this.groupService.sendMessage(this.groupId, {
      content: this.form.value.content!
    }).subscribe({
      next: msg => {
        this.appendOrUpdateMessage(msg);
        this.form.reset();
        this.isSending.set(false);
        this.scrollToBottom(true);
        this.newMessagesCount.set(0);
      },
      error: err => {
        this.toastError(this.getErrorMessage(err));
        this.isSending.set(false);
      }
    });
  }

  loadMutuals(): void {
    this.groupService.getMutuals(this.groupId).subscribe({
      next: mutuals => {
        this.mutuals.set(mutuals);
        this.showAddMember.set(true);
      },
      error: err => this.toastError(this.getErrorMessage(err))
    });
  }

  addMember(userId: string): void {
    this.groupService.addMember(this.groupId, userId).subscribe({
      next: dto => {
        this.group.set(dto);
        this.mutuals.update(list => list.filter(m => m.userId !== userId));
        this.toastSuccess('تم إضافة العضو بنجاح');
      },
      error: err => this.toastError(this.getErrorMessage(err))
    });
  }

  removeMember(member: GroupMember): void {
    this.openConfirm(`هل تريد إزالة "${member.displayName}" من الجروب؟`, () => {
      this.groupService.removeMember(this.groupId, member.userId).subscribe({
        next: dto => {
          this.group.set(dto);
          this.toastSuccess('تم إزالة العضو من الجروب');
        },
        error: err => this.toastError(this.getErrorMessage(err))
      });
    });
  }

  promoteToAdmin(member: GroupMember): void {
    this.openConfirm(`هل تريد تعيين "${member.displayName}" كأدمن؟`, () => {
      this.groupService.promoteToAdmin(this.groupId, member.userId).subscribe({
        next: dto => {
          this.group.set(dto);
          this.toastSuccess('تم تعيينه أدمن بنجاح');
        },
        error: err => this.toastError(this.getErrorMessage(err))
      });
    });
  }

  demoteFromAdmin(member: GroupMember): void {
    this.openConfirm(`هل تريد إلغاء صلاحية الأدمن عن "${member.displayName}"؟`, () => {
      this.groupService.demoteFromAdmin(this.groupId, member.userId).subscribe({
        next: dto => {
          this.group.set(dto);
          this.toastSuccess('تم إلغاء صلاحية الأدمن');
        },
        error: err => this.toastError(this.getErrorMessage(err))
      });
    });
  }

  toggleLock(): void {
    this.groupService.toggleLock(this.groupId).subscribe({
      next: dto => {
        this.group.set(dto);
        this.isLocked.set(dto.isLocked);
        this.toastSuccess(dto.isLocked ? 'تم قفل الجروب' : 'تم فتح الجروب');
      },
      error: err => this.toastError(this.getErrorMessage(err))
    });
  }

  toggleReactionPicker(messageId: number, event: Event): void {
    event.stopPropagation();
    this.activeReactionPicker.update(id => id === messageId ? null : messageId);
  }

  onBubblePressStart(messageId: number, event: TouchEvent | MouseEvent): void {
    if (event.type === 'mousedown' && (event as MouseEvent).button !== 0) return;
    this.longPressTriggered = false;
    this.clearLongPressTimer();
    this.longPressTimer = setTimeout(() => {
      this.longPressTriggered = true;
      this.activeReactionPicker.set(messageId);
      if (navigator.vibrate) navigator.vibrate(15);
    }, LONG_PRESS_MS);
  }

  onBubblePressEnd(): void {
    this.clearLongPressTimer();
  }

  private clearLongPressTimer(): void {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  isReactionPending(messageId: number): boolean {
    return this.pendingReactionMessageId === messageId;
  }

  reactToMessage(messageId: number, emoji: string, event: Event): void {
    event.preventDefault();
    event.stopPropagation();


    if (this.pendingReactionMessageId !== null) {
      return;
    }

    this.pendingReactionMessageId = messageId;
    this.pendingReactionSignal.set(messageId);
    this.activeReactionPicker.set(null);

    this.groupService
      .reactToMessage(this.groupId, messageId, emoji)
      .subscribe({
        next: (updatedMessage: GroupMessage) => {


          this.appendOrUpdateMessage(updatedMessage);

          this.clearPendingReaction();
        },

        error: err => {
          this.clearPendingReaction();
          this.toastError(this.getErrorMessage(err));
        }
      });
  }
  openReactorsModal(reactions: MessageReaction[], emoji: string, event: Event): void {
    event.stopPropagation();
    this.reactorsModal.set({ reactions, activeEmoji: emoji });
  }

  setReactorsTab(emoji: string): void {
    this.reactorsModal.update(state => state ? { ...state, activeEmoji: emoji } : state);
  }

  closeReactorsModal(): void {
    this.reactorsModal.set(null);
  }

  canDeleteMessage(msg: GroupMessage): boolean {
    return !msg.isDeleted && (this.isMyMessage(msg) || this.isAdmin());
  }

  deleteMessage(messageId: number): void {
    this.openConfirm('هل تريد حذف هذه الرسالة؟', () => {
      this.groupService.deleteMessage(this.groupId, messageId).subscribe({
        next: dto => this.appendOrUpdateMessage(dto),
        error: err => this.toastError(this.getErrorMessage(err))
      });
    });
  }

  isMyMessage(msg: GroupMessage): boolean {
    return msg.senderId === this.currentUserId;
  }

  isAdmin(): boolean {
    return this.group()?.members?.find(m => m.userId === this.currentUserId)?.role === 'Admin';
  }

  isCreator(): boolean {
    return this.group()?.creatorId === this.currentUserId;
  }

  isOwnerOf(member: GroupMember): boolean {
    return this.group()?.creatorId === member.userId;
  }

  canPromote(member: GroupMember): boolean {
    return this.isCreator() && !this.isOwnerOf(member) && member.role !== 'Admin';
  }

  canDemote(member: GroupMember): boolean {
    return this.isCreator() && !this.isOwnerOf(member) && member.role === 'Admin';
  }

  canRemove(member: GroupMember): boolean {
    return this.isAdmin() && !this.isOwnerOf(member) && member.userId !== this.currentUserId;
  }

  getInitial(name: string): string { return name ? name.charAt(0) : '؟'; }

  formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString('ar-EG', {
      timeZone: 'Africa/Cairo',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  reactorsListForActiveTab(): string[] {
    const state = this.reactorsModal();
    if (!state) return [];
    return state.reactions.find(r => r.emoji === state.activeEmoji)?.reactorNames ?? [];
  }

  confirmYes(): void {
    const dialog = this.confirmDialog();
    if (dialog) dialog.action();
    this.confirmDialog.set(null);
  }

  confirmNo(): void {
    this.confirmDialog.set(null);
  }

  dismissToast(id: number): void {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }

  private clearPendingReaction(): void {
    this.pendingReactionMessageId = null;
    this.pendingReactionSignal.set(null);
  }

  private openConfirm(message: string, action: () => void): void {
    this.confirmDialog.set({ message, action });
  }

  private toastSuccess(message: string): void { this.pushToast('success', message); }
  private toastError(message: string): void { this.pushToast('error', message); }

  private pushToast(type: 'success' | 'error', message: string): void {
    const id = ++this.toastIdCounter;
    this.toasts.update(list => [...list, { id, type, message }]);
    setTimeout(() => this.dismissToast(id), 3500);
  }

  private getErrorMessage(err: any): string {
    const e = err?.error;
    if (typeof e === 'string' && e.trim()) return e;
    if (e?.message && typeof e.message === 'string') return e.message;
    if (e?.title && typeof e.title === 'string') return e.title;
    if (typeof err?.message === 'string') return err.message;
    return 'حدث خطأ غير متوقع، حاول مرة أخرى';
  }

  appendOrUpdateMessage(msg: GroupMessage): void {
    this.messages.update(list => {
      const index = list.findIndex(x => x.id === msg.id);

      if (index === -1) {
        return [...list, msg];
      }

      const copy = [...list];
      copy[index] = msg;

      return copy;
    });
  }

  private scrollToBottom(smooth: boolean): void {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.messagesEnd?.nativeElement?.scrollIntoView({
          behavior: smooth ? 'smooth' : 'auto',
          block: 'end'
        });
      });
    });
  }
}