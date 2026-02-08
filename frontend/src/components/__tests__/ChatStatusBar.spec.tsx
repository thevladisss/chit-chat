import { render, screen, fireEvent } from "@testing-library/react";
import ChatStatusBar from "../ChatStatusBar";

const mockUseScreen = vi.hoisted(() =>
  vi.fn(() => ({
    xs: false,
    sm: false,
    md: true,
    lg: false,
    xl: false,
    smAndSmaller: false,
    mdAndSmaller: true,
    lgAndSmaller: true,
    width: 800,
    height: 600,
  })),
);

vi.mock("../../hooks/useScreen.ts", () => ({
  useScreen: mockUseScreen,
}));

const defaultProps = {
  chatName: "Test Chat",
  participantsCount: 5,
  onLeaveChat: vi.fn(),
  onVideoCall: vi.fn(),
  onAudioCall: vi.fn(),
};

describe("ChatStatusBar", () => {
  describe("rendering", () => {
    it("should render the chat name", () => {
      render(<ChatStatusBar {...defaultProps} />);

      expect(screen.getByText("Test Chat")).toBeInTheDocument();
    });

    it("should render the participants count", () => {
      render(<ChatStatusBar {...defaultProps} participantsCount={10} />);

      expect(screen.getByText("10 members")).toBeInTheDocument();
    });

    it("should render the chat name in an h2 element", () => {
      render(<ChatStatusBar {...defaultProps} />);

      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading).toHaveTextContent("Test Chat");
    });

    it("should render call action buttons", () => {
      render(<ChatStatusBar {...defaultProps} />);

      // Both audio and video call icons have title "Video Call" in the component
      const callButtons = screen.getAllByTitle("Video Call");
      expect(callButtons).toHaveLength(2);
    });

    it("should render two action buttons", () => {
      render(<ChatStatusBar {...defaultProps} />);

      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(2);
    });
  });

  describe("interaction", () => {
    it("should call onAudioCall when audio call button is clicked", () => {
      const onAudioCall = vi.fn();
      render(<ChatStatusBar {...defaultProps} onAudioCall={onAudioCall} />);

      // There are multiple buttons, get all and click the audio one
      const buttons = screen.getAllByRole("button");
      // Audio call button comes before video call button in the actions div
      fireEvent.click(buttons[0]);
      expect(onAudioCall).toHaveBeenCalledTimes(1);
    });

    it("should call onVideoCall when video call button is clicked", () => {
      const onVideoCall = vi.fn();
      render(<ChatStatusBar {...defaultProps} onVideoCall={onVideoCall} />);

      const buttons = screen.getAllByRole("button");
      fireEvent.click(buttons[1]);
      expect(onVideoCall).toHaveBeenCalledTimes(1);
    });
  });

  describe("responsive behavior", () => {
    it("should show back button on small screens", () => {
      mockUseScreen.mockReturnValue({
        xs: true,
        sm: false,
        md: false,
        lg: false,
        xl: false,
        smAndSmaller: true,
        mdAndSmaller: true,
        lgAndSmaller: true,
        width: 400,
        height: 600,
      });

      render(<ChatStatusBar {...defaultProps} />);

      expect(screen.getByTitle("Leave")).toBeInTheDocument();
    });

    it("should call onLeaveChat when back button is clicked on small screens", () => {
      mockUseScreen.mockReturnValue({
        xs: true,
        sm: false,
        md: false,
        lg: false,
        xl: false,
        smAndSmaller: true,
        mdAndSmaller: true,
        lgAndSmaller: true,
        width: 400,
        height: 600,
      });

      const onLeaveChat = vi.fn();
      render(<ChatStatusBar {...defaultProps} onLeaveChat={onLeaveChat} />);

      fireEvent.click(screen.getByTitle("Leave").closest("button")!);
      expect(onLeaveChat).toHaveBeenCalledTimes(1);
    });

    it("should not show back button on larger screens", () => {
      mockUseScreen.mockReturnValue({
        xs: false,
        sm: false,
        md: true,
        lg: false,
        xl: false,
        smAndSmaller: false,
        mdAndSmaller: true,
        lgAndSmaller: true,
        width: 800,
        height: 600,
      });

      render(<ChatStatusBar {...defaultProps} />);

      expect(screen.queryByTitle("Leave")).not.toBeInTheDocument();
    });
  });
});
