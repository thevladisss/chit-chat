import { screen, fireEvent } from "@testing-library/react";
import ChatsList from "../ChatsList";
import { IChat } from "../../types/IChat";
import { renderWithProviders } from "../../../test/utils";

const defaultChatState = {
  selectedChat: null,
  selectedChatId: null,
  pendingLoadChats: false,
  loadChatsError: null,
  pendingSelectChat: false,
  selectChatError: null,
  chats: [] as IChat[],
  typingChats: {},
};

const mockChats: IChat[] = [
  {
    chatId: "chat-1",
    name: "Alpha Chat",
    lastMessageTimestamp: 1000,
    lastMessage: {
      messageId: "m1",
      chatId: "chat-1",
      text: "Hey!",
      sentBy: "user1",
      sentAt: 1000,
      isSeen: false,
      isDelivered: true,
      isPersonal: false,
    },
    messages: [],
    users: ["user1", "user2"],
    online: false,
    isOnline: false,
  },
  {
    chatId: "chat-2",
    name: "Beta Chat",
    lastMessageTimestamp: 2000,
    lastMessage: {
      messageId: "m2",
      chatId: "chat-2",
      text: "Hello!",
      sentBy: "user3",
      sentAt: 2000,
      isSeen: false,
      isDelivered: true,
      isPersonal: false,
    },
    messages: [],
    users: ["user1", "user3"],
    online: true,
    isOnline: true,
  },
];

const defaultProps = {
  chats: mockChats,
  selectedChatId: null as string | null,
  onSelectChat: vi.fn(),
};

describe("ChatsList", () => {
  describe("rendering", () => {
    it("should render a list when chats are provided", async () => {
      await renderWithProviders(<ChatsList {...defaultProps} />, {
        preloadedState: { chatState: defaultChatState },
      });

      expect(screen.getByRole("list")).toBeInTheDocument();
    });

    it("should render all chat items", async () => {
      await renderWithProviders(<ChatsList {...defaultProps} />, {
        preloadedState: { chatState: defaultChatState },
      });

      expect(screen.getByText("Alpha Chat")).toBeInTheDocument();
      expect(screen.getByText("Beta Chat")).toBeInTheDocument();
    });

    it("should render chat items as list items", async () => {
      await renderWithProviders(<ChatsList {...defaultProps} />, {
        preloadedState: { chatState: defaultChatState },
      });

      const listItems = screen.getAllByRole("listitem");
      expect(listItems).toHaveLength(2);
    });
  });

  describe("props", () => {
    describe("chats", () => {
      it("should show 'no chatting history' when chats array is empty and not searching", async () => {
        await renderWithProviders(
          <ChatsList {...defaultProps} chats={[]} isSearchingChats={false} />,
          { preloadedState: { chatState: defaultChatState } },
        );

        expect(
          screen.getByText("You do not have any chatting history"),
        ).toBeInTheDocument();
      });

      it("should not show list when there are no chats", async () => {
        await renderWithProviders(<ChatsList {...defaultProps} chats={[]} />, {
          preloadedState: { chatState: defaultChatState },
        });

        expect(screen.queryByRole("list")).not.toBeInTheDocument();
      });
    });

    describe("isSearchingChats", () => {
      it("should show 'No chats found' when chats array is empty and searching", async () => {
        await renderWithProviders(
          <ChatsList {...defaultProps} chats={[]} isSearchingChats={true} />,
          { preloadedState: { chatState: defaultChatState } },
        );

        expect(screen.getByText("No chats found")).toBeInTheDocument();
      });
    });

    describe("selectedChatId", () => {
      it("should mark the selected chat", async () => {
        const { container } = await renderWithProviders(
          <ChatsList {...defaultProps} selectedChatId="chat-1" />,
          { preloadedState: { chatState: defaultChatState } },
        );

        const selectedItem = container.querySelector(
          ".chat-list-item.selected",
        );
        expect(selectedItem).toBeInTheDocument();
      });
    });

    describe("className", () => {
      it("should apply custom className", async () => {
        const { container } = await renderWithProviders(
          <ChatsList {...defaultProps} className="custom-class" />,
          { preloadedState: { chatState: defaultChatState } },
        );

        const chatList = container.querySelector(".chat-list.custom-class");
        expect(chatList).toBeInTheDocument();
      });
    });

    describe("style", () => {
      it("should apply custom style", async () => {
        const { container } = await renderWithProviders(
          <ChatsList {...defaultProps} style={{ maxHeight: "300px" }} />,
          { preloadedState: { chatState: defaultChatState } },
        );

        const chatList = container.querySelector(".chat-list");
        expect(chatList).toHaveStyle({ maxHeight: "300px" });
      });
    });
  });

  describe("handlers", () => {
    describe("onSelectChat", () => {
      it("should call onSelectChat with chat id when a chat is clicked", async () => {
        const onSelectChat = vi.fn();
        await renderWithProviders(
          <ChatsList {...defaultProps} onSelectChat={onSelectChat} />,
          { preloadedState: { chatState: defaultChatState } },
        );

        fireEvent.click(screen.getByText("Alpha Chat"));
        expect(onSelectChat).toHaveBeenCalledWith("chat-1");
      });
    });
  });

  describe("sorting", () => {
    it("should sort chats by lastMessageTimestamp ascending", async () => {
      await renderWithProviders(<ChatsList {...defaultProps} />, {
        preloadedState: { chatState: defaultChatState },
      });

      const listItems = screen.getAllByRole("listitem");
      expect(listItems[0]).toHaveTextContent("Alpha Chat");
      expect(listItems[1]).toHaveTextContent("Beta Chat");
    });
  });

  describe("typing indicators", () => {
    it("should show typing indicator when users are typing in a chat", async () => {
      const typingChats = {
        "chat-1": [{ chatId: "c1", username: "Alice", createdTimestamp: "" }],
      };

      await renderWithProviders(<ChatsList {...defaultProps} />, {
        preloadedState: {
          chatState: { ...defaultChatState, typingChats },
        },
      });

      expect(screen.getByText("Alice is typing")).toBeInTheDocument();
    });

    it("should not show typing indicator when no one is typing", async () => {
      await renderWithProviders(<ChatsList {...defaultProps} />, {
        preloadedState: {
          chatState: { ...defaultChatState, typingChats: {} },
        },
      });

      expect(screen.queryByText(/is typing/)).not.toBeInTheDocument();
    });
  });
});
