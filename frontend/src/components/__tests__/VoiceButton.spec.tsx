import { render, screen, fireEvent } from "@testing-library/react";
import VoiceButton from "../VoiceButton";

const defaultProps = {
  recordingElapsedTime: "00:00",
};

describe("VoiceButton", () => {
  describe("rendering", () => {
    it("should render a button", () => {
      render(<VoiceButton {...defaultProps} />);

      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("should render button with type='button'", () => {
      render(<VoiceButton {...defaultProps} />);

      expect(screen.getByRole("button")).toHaveAttribute("type", "button");
    });
  });

  describe("recording state", () => {
    it("should apply 'recording' class when isRecording is true", () => {
      const { container } = render(
        <VoiceButton {...defaultProps} isRecording={true} />,
      );

      const button = container.querySelector(".recording-button.recording");
      expect(button).toBeInTheDocument();
    });

    it("should not apply 'recording' class when isRecording is false", () => {
      const { container } = render(
        <VoiceButton {...defaultProps} isRecording={false} />,
      );

      const button = container.querySelector(".recording-button");
      expect(button).toBeInTheDocument();
      expect(button).not.toHaveClass("recording");
    });

    it("should not apply 'recording' class when isRecording is undefined", () => {
      const { container } = render(<VoiceButton {...defaultProps} />);

      const button = container.querySelector(".recording-button");
      expect(button).toBeInTheDocument();
      expect(button).not.toHaveClass("recording");
    });
  });

  describe("interaction", () => {
    it("should call onClick when button is clicked", () => {
      const onClick = vi.fn();
      render(<VoiceButton {...defaultProps} onClick={onClick} />);

      fireEvent.click(screen.getByRole("button"));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("should not throw when onClick is not provided", () => {
      render(<VoiceButton {...defaultProps} />);

      expect(() => {
        fireEvent.click(screen.getByRole("button"));
      }).not.toThrow();
    });
  });
});
