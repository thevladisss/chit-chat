import { render, screen } from "@testing-library/react";
import ChatMessage from "../ChatMessage";

const defaultProps = {
  messageId: "msg-1",
  chatId: "chat-1",
  text: "Hello world",
  isPersonal: false,
  isSeen: false,
  isDelivered: true,
  sentTimestamp: new Date("2025-06-15T14:30:00").getTime(),
};

describe("ChatMessage", () => {
  describe("rendering", () => {
    it("should render the message text", () => {
      render(<ChatMessage {...defaultProps} />);

      expect(screen.getByText("Hello world")).toBeInTheDocument();
    });

    it("should render the formatted sent timestamp", () => {
      render(<ChatMessage {...defaultProps} />);

      const timestampEl = screen.getByText(/02:30 PM/);
      expect(timestampEl).toBeInTheDocument();
    });
  });

  describe("props", () => {
    describe("text", () => {
      it("should render different message text", () => {
        render(<ChatMessage {...defaultProps} text="Goodbye world" />);

        expect(screen.getByText("Goodbye world")).toBeInTheDocument();
      });
    });

    describe("isPersonal", () => {
      it("should apply 'personal' class when isPersonal is true", () => {
        const { container } = render(
          <ChatMessage {...defaultProps} isPersonal={true} />,
        );

        const messageEl = container.querySelector(".chat-message.personal");
        expect(messageEl).toBeInTheDocument();
      });

      it("should not apply 'personal' class when isPersonal is false", () => {
        const { container } = render(
          <ChatMessage {...defaultProps} isPersonal={false} />,
        );

        const messageEl = container.querySelector(".chat-message");
        expect(messageEl).not.toHaveClass("personal");
      });
    });

    describe("isSeen", () => {
      it("should show seen indicator when isSeen is true", () => {
        render(<ChatMessage {...defaultProps} isSeen={true} />);

        const seenIndicators = screen.getAllByText("*");
        expect(seenIndicators.length).toBeGreaterThan(0);
      });

      it("should not show seen indicator when isSeen is false", () => {
        const { container } = render(
          <ChatMessage {...defaultProps} isSeen={false} />,
        );

        const messageText = container.querySelector(".chat-message");
        expect(messageText).toBeInTheDocument();
        // The span should be empty when not seen
        const spans = container.querySelectorAll(".sent-timestamp + span");
        spans.forEach((span) => {
          expect(span.textContent).toBe("");
        });
      });
    });
  });
});
