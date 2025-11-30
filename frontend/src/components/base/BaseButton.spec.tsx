import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BaseButton from "./BaseButton";

describe("BaseButton", () => {
  it("should render button with children text", () => {
    render(<BaseButton>Click me</BaseButton>);

    const button = screen.getByRole("button", { name: /click me/i });

    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("Click me");
  });

  it("should render button with multiple children", () => {
    render(
      <BaseButton>
        <span>Save</span>
        <span>Changes</span>
      </BaseButton>
    );
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  describe("props", () => {
    it("should apply icon class when icon is provided", () => {
      const icon = <span>🔍</span>;
      const { container } = render(<BaseButton icon={icon}>Search</BaseButton>);
      const button = container.querySelector(".base-button.icon");
      expect(button).toBeInTheDocument();
    });

    it("should render button with loading class when loading is true", () => {
      const { container } = render(<BaseButton loading>Submit</BaseButton>);
      const button = container.querySelector(".base-button.loading");
      expect(button).toBeInTheDocument();
    });

    it("should disable button when loading is true", () => {
      render(<BaseButton loading>Submit</BaseButton>);
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });

    it("should not disable button when loading is false", () => {
      render(<BaseButton loading={false}>Submit</BaseButton>);
      const button = screen.getByRole("button");
      expect(button).not.toBeDisabled();
    });

    it("should apply custom className to button", () => {
      const { container } = render(
        <BaseButton className="custom-class">Button</BaseButton>
      );
      const button = container.querySelector(".base-button.custom-class");
      expect(button).toBeInTheDocument();
    });

    it("should apply multiple custom classNames", () => {
      const { container } = render(
        <BaseButton className="custom-class another-class">Button</BaseButton>
      );
      const button = container.querySelector(
        ".base-button.custom-class.another-class"
      );
      expect(button).toBeInTheDocument();
    });

    it("should apply custom style to button", () => {
      const customStyle = {
        backgroundColor: "rgb(255, 0, 0)",
        color: "rgb(255, 255, 255)",
      };

      render(<BaseButton style={customStyle}>Button</BaseButton>);
      const button = screen.getByRole("button");

      expect(button).toHaveStyle(customStyle);
    });

    it("should render button with type='button'", () => {
      render(<BaseButton type="button">Button</BaseButton>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("type", "button");
    });

    it("should render button with different 'type' attribute", () => {
      render(<BaseButton type="submit">Submit</BaseButton>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("type", "submit");
    });
  });

  describe("handler props", () => {
    it("should call onClick when button is clicked", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<BaseButton onClick={handleClick}>Click me</BaseButton>);
      const button = screen.getByRole("button");
      await user.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should not call onClick when button is disabled (loading)", () => {
      const handleClick = vi.fn();
      render(
        <BaseButton onClick={handleClick} loading>
          Click me
        </BaseButton>
      );
      const button = screen.getByRole("button");

      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe("slot props", () => {
    it("should render button with icon instead of children", () => {
      const icon = <span data-testid="icon">🔍</span>;
      render(<BaseButton icon={icon}>Search</BaseButton>);
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      expect(screen.getByTestId("icon")).toBeInTheDocument();
      expect(button).not.toHaveTextContent("Search");
    });
  });
});
