import { render, screen, fireEvent } from "@testing-library/react";
import ChatComposer from "../ChatComposer";

const defaultProps = {
  message: "",
  isPendingMessageSend: false,
  voiceMessageRecordingTimeElapsed: "00:00",
  isRecordingVoiceMessage: false,
  handleInputMessage: vi.fn(),
  handleSubmitMessage: vi.fn(),
  handleVoiceMessageRecordingStart: vi.fn(),
  handleVoiceMessageRecordingCompleted: vi.fn(),
};

describe("ChatComposer", () => {
  describe("rendering", () => {
    it("should render the text input with correct placeholder", () => {
      render(<ChatComposer {...defaultProps} />);

      const input = screen.getByPlaceholderText("Text here...");
      expect(input).toBeInTheDocument();
    });

    it("should render the send button", () => {
      render(<ChatComposer {...defaultProps} />);

      expect(screen.getByRole("button", { name: "Send" })).toBeInTheDocument();
    });

    it("should render the input with the provided message value", () => {
      render(<ChatComposer {...defaultProps} message="Hello world" />);

      const input = screen.getByPlaceholderText(
        "Text here...",
      ) as HTMLInputElement;
      expect(input.value).toBe("Hello world");
    });

    it("should render the input with autoFocus", () => {
      render(<ChatComposer {...defaultProps} />);

      const input = screen.getByPlaceholderText("Text here...");
      expect(document.activeElement).toBe(input);
    });
  });

  describe("text message mode", () => {
    it("should show text input when not recording voice message", () => {
      render(
        <ChatComposer {...defaultProps} isRecordingVoiceMessage={false} />,
      );

      expect(screen.getByPlaceholderText("Text here...")).toBeInTheDocument();
      expect(screen.queryByText("00:00")).not.toBeInTheDocument();
    });

    it("should call handleInputMessage when user types", () => {
      const handleInputMessage = vi.fn();
      render(
        <ChatComposer
          {...defaultProps}
          handleInputMessage={handleInputMessage}
        />,
      );

      const input = screen.getByPlaceholderText("Text here...");
      fireEvent.input(input, { target: { value: "hello" } });

      expect(handleInputMessage).toHaveBeenCalled();
    });

    it("should call handleSubmitMessage when form is submitted", () => {
      const handleSubmitMessage = vi.fn();
      render(
        <ChatComposer
          {...defaultProps}
          message="hello"
          handleSubmitMessage={handleSubmitMessage}
        />,
      );

      const form = screen
        .getByRole("button", { name: "Send" })
        .closest("form")!;
      fireEvent.submit(form);

      expect(handleSubmitMessage).toHaveBeenCalledTimes(1);
    });

    it("should prevent default form submission behavior", () => {
      const handleSubmitMessage = vi.fn();
      render(
        <ChatComposer
          {...defaultProps}
          handleSubmitMessage={handleSubmitMessage}
        />,
      );

      const form = screen
        .getByRole("button", { name: "Send" })
        .closest("form")!;
      const submitEvent = new Event("submit", {
        bubbles: true,
        cancelable: true,
      });
      const preventDefaultSpy = vi.spyOn(submitEvent, "preventDefault");

      form.dispatchEvent(submitEvent);
      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe("voice recording mode", () => {
    it("should show recording time when recording voice message", () => {
      render(
        <ChatComposer
          {...defaultProps}
          isRecordingVoiceMessage={true}
          voiceMessageRecordingTimeElapsed="01:23"
        />,
      );

      expect(screen.getByText("01:23")).toBeInTheDocument();
      expect(
        screen.queryByPlaceholderText("Text here..."),
      ).not.toBeInTheDocument();
    });

    it("should hide text input when recording voice message", () => {
      render(<ChatComposer {...defaultProps} isRecordingVoiceMessage={true} />);

      expect(
        screen.queryByPlaceholderText("Text here..."),
      ).not.toBeInTheDocument();
    });

    it("should display the recording time element with correct class", () => {
      const { container } = render(
        <ChatComposer
          {...defaultProps}
          isRecordingVoiceMessage={true}
          voiceMessageRecordingTimeElapsed="02:30"
        />,
      );

      const recordingTime = container.querySelector(".recording-time");
      expect(recordingTime).toBeInTheDocument();
      expect(recordingTime).toHaveTextContent("02:30");
    });
  });
});
