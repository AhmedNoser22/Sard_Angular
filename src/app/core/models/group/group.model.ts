export interface Group {
  id: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  isLocked: boolean;
  creatorId: string;
  creatorName: string;
  membersCount: number;
  myMembership: GroupMember | null;
  createdAt: string;
  members: GroupMember[];
}

export interface GroupMember {
  id: number;
  userId: string;
  displayName: string;
  profileImageUrl: string | null;
  role: 'Admin' | 'Member';
  joinedAt: string;
}

export interface MessageReaction {
  emoji: string;
  count: number;
  reactedByMe: boolean;
  reactorNames: string[];
}

export interface GroupMessage {
  id: number;
  content: string;
  senderId: string;
  senderName: string;
  senderImageUrl: string | null;
  groupId: number;
  createdAt: string;
  isDeleted: boolean;
  reactions: MessageReaction[];
  myReaction: string | null;
}

export interface CreateGroupRequest {
  name: string;
  description: string | null;
}

export interface SendMessageRequest {
  content: string;
}

export interface ReactToMessageRequest {
  emoji: string;
}