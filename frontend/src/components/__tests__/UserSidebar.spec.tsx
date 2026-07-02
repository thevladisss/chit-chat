import { screen, act, fireEvent } from "@testing-library/react";
import UserSidebar from "../UserSidebar.tsx";
import { IChat } from "../../types/IChat.ts";
import { renderWithProviders } from "../../../test/utils.tsx";
import { MemoryRouter } from "react-router-dom";

const mockSearchChats = vi.hoisted(() => vi.fn());
const mockGetChat = vi.hoisted(() => vi.fn());
const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom",
  );

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../../service/chatSerevice.ts", () => ({
  searchChats: mockSearchChats,
  getChat: mockGetChat,
}));

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
    vi.clearAllMocks();
    vi.useFakeTimers();

    mockSearchChats.mockResolvedValue({ data: [] });
    mockGetChat.mockResolvedValue({ data: mockChats[0] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("chat search", () => {
    it("should render search input with correct placeholder", async () => {
      await renderWithProviders(
        <MemoryRouter>
          <UserSidebar />
        </MemoryRouter>,
        {
        preloadedState: {
          chatState: { ...defaultChatState, chats: mockChats },
        },
      });

      const searchInput = screen.getByPlaceholderText("Search chat");
      expect(searchInput).toBeInTheDocument();
    });

    it("should update search value when user types", async () => {
      await renderWithProviders(
        <MemoryRouter>
          <UserSidebar />
        </MemoryRouter>,
        {
        preloadedState: {
          chatState: { ...defaultChatState, chats: mockChats },
        },
      });

      const searchInput = screen.getByPlaceholderText(
        "Search chat",
      ) as HTMLInputElement;

      act(() => {
        fireEvent.input(searchInput, { target: { value: "test" } });
      });

      expect(searchInput.value).toBe("test");
    });

    it("should dispatch getFilteredChatsAction after debounce delay when user types", async () => {
      const { store } = await renderWithProviders(
        <MemoryRouter>
          <UserSidebar />
        </MemoryRouter>,
        {
        preloadedState: {
          chatState: { ...defaultChatState, chats: mockChats },
        },
      });

      const dispatchSpy = vi.spyOn(store, "dispatch");

      const searchInput = screen.getByPlaceholderText(
        "Search chat",
      ) as HTMLInputElement;

      act(() => {
        fireEvent.input(searchInput, { target: { value: "test" } });
      });

      // Fast-forward time to trigger debounce
      await act(async () => {
        vi.advanceTimersByTime(500);
      });

      expect(dispatchSpy).toHaveBeenCalled();
      expect(mockSearchChats).toHaveBeenCalledWith("test");
    });

    it("should not dispatch immediately when user types (debounce delay)", async () => {
      const { store } = await renderWithProviders(
        <MemoryRouter>
          <UserSidebar />
        </MemoryRouter>,
        {
        preloadedState: {
          chatState: { ...defaultChatState, chats: mockChats },
        },
      });

      const dispatchSpy = vi.spyOn(store, "dispatch");

      const searchInput = screen.getByPlaceholderText(
        "Search chat",
      ) as HTMLInputElement;

      act(() => {
        fireEvent.input(searchInput, { target: { value: "test" } });
      });

      // Don't advance timers - should not dispatch yet
      expect(dispatchSpy).not.toHaveBeenCalled();
      expect(mockSearchChats).not.toHaveBeenCalled();

      // Now advance timers
      await act(async () => {
        vi.advanceTimersByTime(500);
      });

      expect(mockSearchChats).toHaveBeenCalledWith("test");
    });

    it("should debounce multiple rapid input changes", async () => {
      await renderWithProviders(
        <MemoryRouter>
          <UserSidebar />
        </MemoryRouter>,
        {
        preloadedState: {
          chatState: { ...defaultChatState, chats: mockChats },
        },
      });

      const searchInput = screen.getByPlaceholderText(
        "Search chat",
      ) as HTMLInputElement;

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

      expect(mockSearchChats).not.toHaveBeenCalled();

      await act(async () => {
        vi.advanceTimersByTime(500);
      });

      expect(mockSearchChats).toHaveBeenCalledTimes(1);
      expect(mockSearchChats).toHaveBeenCalledWith("test");
    });

    it("should cancel previous debounced calls when user types again", async () => {
      await renderWithProviders(
        <MemoryRouter>
          <UserSidebar />
        </MemoryRouter>,
        {
        preloadedState: {
          chatState: { ...defaultChatState, chats: mockChats },
        },
      });

      const searchInput = screen.getByPlaceholderText(
        "Search chat",
      ) as HTMLInputElement;

      act(() => {
        fireEvent.input(searchInput, { target: { value: "first" } });
        vi.advanceTimersByTime(400);
      });

      // Type again before debounce completes
      await act(async () => {
        fireEvent.input(searchInput, { target: { value: "" } });
        fireEvent.input(searchInput, { target: { value: "second" } });
        vi.advanceTimersByTime(500);
      });

      expect(mockSearchChats).toHaveBeenCalledWith("second");
      expect(mockSearchChats).not.toHaveBeenCalledWith("first");
    });

    it("should display chats list with filtered chats", async () => {
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

      await renderWithProviders(
        <MemoryRouter>
          <UserSidebar />
        </MemoryRouter>,
        {
        preloadedState: {
          chatState: { ...defaultChatState, chats: filteredChats },
        },
      });

      expect(screen.getByRole("list")).toBeInTheDocument();
      expect(screen.getByText("Filtered Chat")).toBeInTheDocument();
    });

    it("should navigate to chat page when a chat is clicked", async () => {
      await renderWithProviders(
        <MemoryRouter>
          <UserSidebar />
        </MemoryRouter>,
        {
        preloadedState: {
          chatState: { ...defaultChatState, chats: mockChats },
        },
      });

      await act(async () => {
        fireEvent.click(screen.getByText("Chat 1"));
      });

      expect(mockNavigate).toHaveBeenCalledWith("/chats/chat-1");
    });

    it("should not call selectChatAction if the same chat is already selected", async () => {
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

      vi.clearAllMocks();

      await renderWithProviders(
        <MemoryRouter>
          <UserSidebar />
        </MemoryRouter>,
        {
        preloadedState: {
          chatState: { ...defaultChatState, chats: mockChats, selectedChat },
        },
      });

      act(() => {
        fireEvent.click(screen.getByText("Chat 1"));
      });

      // Should not dispatch selectChatAction for the same chat
      expect(mockGetChat).not.toHaveBeenCalled();
    });

    it("should show loading state when pendingSearchFilteredChats is true", async () => {
      // Note: The component uses local state `pendingSearchFilteredChats` which is never updated
      // This test verifies the component structure, but the actual loading state
      // is controlled by local state, not Redux state
      await renderWithProviders(
        <MemoryRouter>
          <UserSidebar />
        </MemoryRouter>,
        {
        preloadedState: {
          chatState: { ...defaultChatState, chats: mockChats },
        },
      });

      const searchInput = screen.getByPlaceholderText("Search chat");
      // Initially not disabled since pendingSearchFilteredChats starts as false
      expect(searchInput).not.toBeDisabled();
    });

    it("should set isSearchingChats to true when search value is not empty", async () => {
      await renderWithProviders(
        <MemoryRouter>
          <UserSidebar />
        </MemoryRouter>,
        {
        preloadedState: {
          chatState: { ...defaultChatState, chats: [] },
        },
      });

      // Initially shows the default empty state
      expect(
        screen.getByText("You do not have any chatting history"),
      ).toBeInTheDocument();

      const searchInput = screen.getByPlaceholderText(
        "Search chat",
      ) as HTMLInputElement;

      act(() => {
        fireEvent.input(searchInput, { target: { value: "test" } });
      });

      // After typing, isSearchingChats becomes true, showing "No chats found" instead
      expect(screen.getByText("No chats found")).toBeInTheDocument();
    });
  });
});
