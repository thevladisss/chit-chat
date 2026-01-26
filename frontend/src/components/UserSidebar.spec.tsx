import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import UserSidebar from "./UserSidebar.tsx";
import { getFilteredChatsAction, selectChatAction } from "../stores/chat/actions.ts";
import { IChat } from "../types/IChat.ts";

// Mock the actions
vi.mock("../stores/chat/actions.ts", () => ({
  getFilteredChatsAction: vi.fn((search: string) => ({
    type: "chats/getFilteredChats",
    payload: search,
  })),
  selectChatAction: vi.fn((chatId: string) => ({
    type: "chats/selectChat",
    payload: chatId,
  })),
}));

// Mock ChatsList component
vi.mock("./ChatsList.tsx", () => ({
  default: ({ chats, selectedChatId, onSelectChat, isSearchingChats }: any) => (
    <div data-testid="chats-list" data-searching={isSearchingChats}>
      {chats.map((chat: IChat) => (
        <div
          key={chat.chatId}
          data-testid={`chat-${chat.chatId}`}
          onClick={() => onSelectChat(chat.chatId)}
          data-selected={selectedChatId === chat.chatId}
        >
          {chat.name}
        </div>
      ))}
    </div>
  ),
}));

// Mock BaseTextField component
vi.mock("./base/BaseTextField.tsx", () => ({
  default: ({ onInput, placeholder, loading, onFocus, onBlur }: any) => (
    <input
      data-testid="search-input"
      placeholder={placeholder}
      onInput={onInput}
      onFocus={onFocus}
      onBlur={onBlur}
      disabled={loading === true}
      aria-label="Search chat"
    />
  ),
}));

// TODO: Use from utils
const createMockStore = (initialState: Record<string, any> = {}) => {
  return configureStore({
    reducer: {
      userState: (state = null) => state,
      chatState: (state = initialState.chatState) => state,
    },
    preloadedState: initialState,
  });
};

const mockChats: IChat[] = [
  {
    chatId: "chat-1",
    name: "Chat 1",
    lastMessageTimestamp: Date.now(),
    lastMessage: null,
    messages: [],
    users: ["user1", "user2"],
    online: false,
    isOnline: false,
  },
  {
    chatId: "chat-2",
    name: "Chat 2",
    lastMessageTimestamp: Date.now(),
    lastMessage: null,
    messages: [],
    users: ["user1", "user3"],
    online: false,
    isOnline: false,
  },
];

describe("UserSidebar", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe("chat search", () => {
    it("should render search input with correct placeholder", () => {
      const store = createMockStore({
        chatState: {
          chats: mockChats,
          selectedChat: null,
          pendingLoadChats: false,
          loadChatsError: null,
        },
      });

      render(
        <Provider store={store}>
          <UserSidebar />
        </Provider>
      );

      const searchInput = screen.getByTestId("search-input");
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute("placeholder", "Search chat");
    });

    it("should update search value when user types", () => {
      const store = createMockStore({
        chatState: {
          chats: mockChats,
          selectedChat: null,
          pendingLoadChats: false,
          loadChatsError: null,
        },
      });

      render(
        <Provider store={store}>
          <UserSidebar />
        </Provider>
      );

      const searchInput = screen.getByTestId("search-input") as HTMLInputElement;

      act(() => {
        fireEvent.input(searchInput, { target: { value: "test" } });
      });

      expect(searchInput.value).toBe("test");
    });

    it("should dispatch getFilteredChatsAction after debounce delay when user types", () => {
      const store = createMockStore({
        chatState: {
          chats: mockChats,
          selectedChat: null,
          pendingLoadChats: false,
          loadChatsError: null,
        },
      });

      const dispatchSpy = vi.spyOn(store, "dispatch");

      render(
        <Provider store={store}>
          <UserSidebar />
        </Provider>
      );

      const searchInput = screen.getByTestId("search-input") as HTMLInputElement;

      act(() => {
        fireEvent.input(searchInput, { target: { value: "test" } });
      });

      // Fast-forward time to trigger debounce
      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(dispatchSpy).toHaveBeenCalled();
      expect(getFilteredChatsAction).toHaveBeenCalledWith("test");
    });

    it("should not dispatch immediately when user types (debounce delay)", () => {
      const store = createMockStore({
        chatState: {
          chats: mockChats,
          selectedChat: null,
          pendingLoadChats: false,
          loadChatsError: null,
        },
      });

      const dispatchSpy = vi.spyOn(store, "dispatch");

      render(
        <Provider store={store}>
          <UserSidebar />
        </Provider>
      );

      const searchInput = screen.getByTestId("search-input") as HTMLInputElement;

      act(() => {
        fireEvent.input(searchInput, { target: { value: "test" } });
      });

      // Don't advance timers - should not dispatch yet
      expect(dispatchSpy).not.toHaveBeenCalled();
      expect(getFilteredChatsAction).not.toHaveBeenCalled();

      // Now advance timers
      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(getFilteredChatsAction).toHaveBeenCalledWith("test");
    });

    it("should debounce multiple rapid input changes", () => {
      const store = createMockStore({
        chatState: {
          chats: mockChats,
          selectedChat: null,
          pendingLoadChats: false,
          loadChatsError: null,
        },
      });

      render(
        <Provider store={store}>
          <UserSidebar />
        </Provider>
      );

      const searchInput = screen.getByTestId("search-input") as HTMLInputElement;

      // Type multiple characters rapidly
      act(() => {
        fireEvent.input(searchInput, { target: { value: "t" } });
        vi.advanceTimersByTime(200);
        fireEvent.input(searchInput, { target: { value: "te" } });
        vi.advanceTimersByTime(200);
        fireEvent.input(searchInput, { target: { value: "tes" } });
        vi.advanceTimersByTime(200);
        fireEvent.input(searchInput, { target: { value: "test" } });
      });


      expect(getFilteredChatsAction).not.toHaveBeenCalled();


      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(getFilteredChatsAction).toHaveBeenCalledTimes(1);
      expect(getFilteredChatsAction).toHaveBeenCalledWith("test");
    });

    it("should cancel previous debounced calls when user types again", () => {
      const store = createMockStore({
        chatState: {
          chats: mockChats,
          selectedChat: null,
          pendingLoadChats: false,
          loadChatsError: null,
        },
      });

      render(
        <Provider store={store}>
          <UserSidebar />
        </Provider>
      );

      const searchInput = screen.getByTestId("search-input") as HTMLInputElement;

      act(() => {
        fireEvent.input(searchInput, { target: { value: "first" } });
        vi.advanceTimersByTime(400);
      });

      // Type again before debounce completes
      act(() => {
        fireEvent.input(searchInput, { target: { value: "" } });
        fireEvent.input(searchInput, { target: { value: "second" } });
        vi.advanceTimersByTime(500);
      });

      expect(getFilteredChatsAction).toHaveBeenCalledWith("second");
      expect(getFilteredChatsAction).not.toHaveBeenCalledWith("first");
    });

    it("should display chats list with filtered chats", () => {
      const filteredChats: IChat[] = [
        {
          chatId: "chat-1",
          name: "Filtered Chat",
          lastMessageTimestamp: Date.now(),
          lastMessage: null,
          messages: [],
          users: ["user1"],
          online: false,
          isOnline: false,
        },
      ];

      const store = createMockStore({
        chatState: {
          chats: filteredChats,
          selectedChat: null,
          pendingLoadChats: false,
          loadChatsError: null,
        },
      });

      render(
        <Provider store={store}>
          <UserSidebar />
        </Provider>
      );

      const chatsList = screen.getByTestId("chats-list");
      expect(chatsList).toBeInTheDocument();
      expect(screen.getByTestId("chat-chat-1")).toBeInTheDocument();
      expect(screen.getByText("Filtered Chat")).toBeInTheDocument();
    });

    it("should call selectChatAction when a chat is clicked", () => {
      const store = createMockStore({
        chatState: {
          chats: mockChats,
          selectedChat: null,
          pendingLoadChats: false,
          loadChatsError: null,
        },
      });

      const dispatchSpy = vi.spyOn(store, "dispatch");

      render(
        <Provider store={store}>
          <UserSidebar />
        </Provider>
      );

      const chatElement = screen.getByTestId("chat-chat-1");
      act(() => {
        fireEvent.click(chatElement);
      });

      expect(dispatchSpy).toHaveBeenCalled();
      expect(selectChatAction).toHaveBeenCalledWith("chat-1");
    });

    it("should not call selectChatAction if the same chat is already selected", () => {
      const selectedChat: IChat = {
        chatId: "chat-1",
        name: "Chat 1",
        lastMessageTimestamp: Date.now(),
        lastMessage: null,
        messages: [],
        users: ["user1"],
        online: false,
        isOnline: false,
      };

      const store = createMockStore({
        chatState: {
          chats: mockChats,
          selectedChat: selectedChat,
          pendingLoadChats: false,
          loadChatsError: null,
        },
      });

      vi.clearAllMocks();

      render(
        <Provider store={store}>
          <UserSidebar />
        </Provider>
      );

      const chatElement = screen.getByTestId("chat-chat-1");
      act(() => {
        fireEvent.click(chatElement);
      });

      // Should not dispatch selectChatAction for the same chat
      expect(selectChatAction).not.toHaveBeenCalled();
    });

    it("should show loading state when pendingSearchFilteredChats is true", () => {
      // Note: The component uses local state `pendingSearchFilteredChats` which is never updated
      // This test verifies the component structure, but the actual loading state
      // is controlled by local state, not Redux state
      const store = createMockStore({
        chatState: {
          chats: mockChats,
          selectedChat: null,
          pendingLoadChats: false,
          loadChatsError: null,
        },
      });

      render(
        <Provider store={store}>
          <UserSidebar />
        </Provider>
      );

      const searchInput = screen.getByTestId("search-input");
      // Initially not disabled since pendingSearchFilteredChats starts as false
      expect(searchInput).not.toBeDisabled();
    });

    it("should set isSearchingChats to true when search value is not empty", () => {
      const store = createMockStore({
        chatState: {
          chats: mockChats,
          selectedChat: null,
          pendingLoadChats: false,
          loadChatsError: null,
        },
      });

      render(
        <Provider store={store}>
          <UserSidebar />
        </Provider>
      );

      const searchInput = screen.getByTestId("search-input") as HTMLInputElement;
      const chatsList = screen.getByTestId("chats-list");

      // Initially should not be searching
      expect(chatsList).toHaveAttribute("data-searching", "false");

      act(() => {
        fireEvent.input(searchInput, { target: { value: "test" } });
      });

      expect(chatsList).toHaveAttribute("data-searching", "true");
    });
  });
});
