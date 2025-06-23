
export type IChat = {
    chatId: string | null;
    participants: any[];
    name: string;
    messages: any[]
}

export type IRootState = {
  user: any;
  chats: {
    chats: IChat[],
    selectedChatId: string | null
  };
};
