/** User API response (e.g. sign-in, current user) */
export interface UserResponse {
  id: string;
  userId: string;
  username: string;
  createdAt: string;
  updatedAt: string;
}

/** Text message in API response */
export interface TextMessageResponse {
  id: string;
  messageId: string;
  chatId: string;
  userId: string;
  text: string;
  sentAt: number;
  isSeen: boolean;
  isPersonal: boolean;
}

/** Audio message in API response */
export interface AudioMessageResponse {
  id: string;
  audioMessageId: string;
  messageId: string;
  chatId: string;
  userId: string;
  audioUrl: string;
  audioDuration: number;
  audioFormat: 'webm' | 'mp4' | 'wav' | 'ogg' | 'm4a';
  fileSize: number;
  originalFileName: string;
  sentAt: number;
  isSeen: boolean;
  createdAt: string;
  formattedFileSize?: string;
  formattedDuration?: string;
  isPersonal: boolean;
}

export type MessageResponse = TextMessageResponse | AudioMessageResponse;

export interface ChatResponse {
  id: string;
  chatId: string;
  users: unknown[];
  createdTimestamp: number;
  isGroupChat?: boolean;
  lastMessage: string | null;
  lastMessageTimestamp: number | null;
  name: string;
  messages: MessageResponse[];
}

export interface ChatListItemResponse {
  id: string;
  chatId: string;
  users: unknown[];
  createdTimestamp: number;
  isGroupChat?: boolean;
  online: boolean;
  messages: MessageResponse[];
  name: string;
}
