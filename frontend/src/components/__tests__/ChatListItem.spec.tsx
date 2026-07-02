import { render, screen, fireEvent } from "@testing-library/react";
import ChatListItem from "../ChatListItem";
import { IUser } from "../../types/IUser";

const defaultProps = {
  id: "chat-1",
  isSelected: false,
  isOnline: false,
  typingUsers: [] as IUser[],
  hasUnseenMessage: false,
  chatName: "Test Chat",
  lastMessage: null as string | null,
  lastMessageTimestamp: null as number | null,
  onSelectChat: vi.fn(),
};

describe("ChatListItem", () => {
  describe("rendering", () => {
    it("should render a list item element", () => {
      render(<ChatListItem {...defaultProps} />);

      expect(screen.getByRole("listitem")).toBeInTheDocument();
    });

    it("should render a button role anchor", () => {
      render(<ChatListItem {...defaultProps} />);

      expect(screen.getByRole("button")).toBeInTheDocument();
    });
  });

  describe("props", () => {
    describe("chatName", () => {
      it("should render the chat name", () => {
        render(<ChatListItem {...defaultProps} />);

        expect(screen.getByText("Test Chat")).toBeInTheDocument();
      });

      it("should render the chat avatar with correct alt text", () => {
        render(<ChatListItem {...defaultProps} chatName="My Chat" />);

        const avatar = screen.getByAltText("My Chat");
        expect(avatar).toBeInTheDocument();
        expect(avatar).toHaveAttribute(
          "src",
          "/images/user_default_avatar.png",
        );
      });
    });

    describe("lastMessage", () => {
      it("should show last message text when provided", () => {
        render(<ChatListItem {...defaultProps} lastMessage="Hello there!" />);

        expect(screen.getByText("Hello there!")).toBeInTheDocument();
      });

      it("should show placeholder when no last message", () => {
        render(<ChatListItem {...defaultProps} lastMessage={null} />);

        expect(
          screen.getByText("No messages in this chat yet..."),
        ).toBeInTheDocument();
      });

      it("should show placeholder when lastMessage is empty string", () => {
        render(<ChatListItem {...defaultProps} lastMessage="" />);

        expect(
          screen.getByText("No messages in this chat yet..."),
        ).toBeInTheDocument();
      });
    });

    describe("lastMessageTimestamp", () => {
      it("should show formatted timestamp when provided", () => {
        const timestamp = new Date("2025-06-15T14:30:00").getTime();
        render(
          <ChatListItem {...defaultProps} lastMessageTimestamp={timestamp} />,
        );

        const timestampEl = screen.getByText(/06\/15\/2025/);
        expect(timestampEl).toBeInTheDocument();
      });

      it("should not show timestamp when lastMessageTimestamp is null", () => {
        const { container } = render(
          <ChatListItem {...defaultProps} lastMessageTimestamp={null} />,
        );

        const timestampEl = container.querySelector(".last-message-timestamp");
        expect(timestampEl).not.toBeInTheDocument();
      });
    });

    describe("typingUsers", () => {
      it("should show typing indicator for single user", () => {
        const typingUsers: IUser[] = [
          { chatId: "c1", username: "Alice", createdTimestamp: "" },
        ];
        render(<ChatListItem {...defaultProps} typingUsers={typingUsers} />);

        expect(screen.getByText("Alice is typing")).toBeInTheDocument();
      });

      it("should show typing indicator for multiple users", () => {
        const typingUsers: IUser[] = [
          { chatId: "c1", username: "Alice", createdTimestamp: "" },
          { chatId: "c2", username: "Bob", createdTimestamp: "" },
        ];
        render(<ChatListItem {...defaultProps} typingUsers={typingUsers} />);

        expect(screen.getByText("Alice,Bob are typing...")).toBeInTheDocument();
      });

      it("should hide last message when users are typing", () => {
        const typingUsers: IUser[] = [
          { chatId: "c1", username: "Alice", createdTimestamp: "" },
        ];
        render(
          <ChatListItem
            {...defaultProps}
            lastMessage="Hello"
            typingUsers={typingUsers}
          />,
        );

        expect(screen.queryByText("Hello")).not.toBeInTheDocument();
        expect(screen.getByText("Alice is typing")).toBeInTheDocument();
      });
    });

    describe("isSelected", () => {
      it("should apply 'selected' class when isSelected is true", () => {
        const { container } = render(
          <ChatListItem {...defaultProps} isSelected={true} />,
        );

        const listItem = container.querySelector(".chat-list-item.selected");
        expect(listItem).toBeInTheDocument();
      });

      it("should not apply 'selected' class when isSelected is false", () => {
        const { container } = render(
          <ChatListItem {...defaultProps} isSelected={false} />,
        );

        const listItem = container.querySelector(".chat-list-item");
        expect(listItem).not.toHaveClass("selected");
      });
    });

    describe("isOnline", () => {
      it("should apply 'online' class when isOnline is true", () => {
        const { container } = render(
          <ChatListItem {...defaultProps} isOnline={true} />,
        );

        const listItem = container.querySelector(".chat-list-item.online");
        expect(listItem).toBeInTheDocument();
      });

      it("should not apply 'online' class when isOnline is false", () => {
        const { container } = render(
          <ChatListItem {...defaultProps} isOnline={false} />,
        );

        const listItem = container.querySelector(".chat-list-item");
        expect(listItem).not.toHaveClass("online");
      });
    });

    describe("hasUnseenMessage", () => {
      it("should show unread indicator when hasUnseenMessage is true", () => {
        const { container } = render(
          <ChatListItem {...defaultProps} hasUnseenMessage={true} />,
        );

        const indicator = container.querySelector(".unread-indicator");
        expect(indicator).toBeInTheDocument();
      });

      it("should not show unread indicator when hasUnseenMessage is false", () => {
        const { container } = render(
          <ChatListItem {...defaultProps} hasUnseenMessage={false} />,
        );

        const indicator = container.querySelector(".unread-indicator");
        expect(indicator).not.toBeInTheDocument();
      });
    });
  });

  describe("handlers", () => {
    describe("onSelectChat", () => {
      it("should call onSelectChat when clicked", () => {
        const onSelectChat = vi.fn();
        render(<ChatListItem {...defaultProps} onSelectChat={onSelectChat} />);

        fireEvent.click(screen.getByRole("listitem"));
        expect(onSelectChat).toHaveBeenCalledTimes(1);
      });
    });
  });
});
