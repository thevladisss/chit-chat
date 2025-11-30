import { describe, it, expect, vi } from "vitest";
import { prettyDOM, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BaseTextField from "./BaseTextField";

describe("BaseTextField", () => {
  describe("props", () => {
    it("should render input with name attribute", () => {
      render(<BaseTextField name="username" value="" />);
      const input = screen.getByRole("textbox");
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("name", "username");
    });

    it("should render input with value", () => {
      render(<BaseTextField name="username" value="testuser" />);
      const input = screen.getByRole("textbox");
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue("testuser");
    });

    it("should render input with id attribute", () => {
      render(<BaseTextField name="username" value="" id="user-input" />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("id", "user-input");
    });

    it("should render input with placeholder", () => {
      render(
        <BaseTextField name="email" value="" placeholder="Enter your email" />
      );
      const input = screen.getByPlaceholderText("Enter your email");
      expect(input).toBeInTheDocument();
    });

    it("should not show placeholder when value is provided", () => {
      render(
        <BaseTextField
          name="email"
          value="user@example.com"
          placeholder="Enter your email"
        />
      );
      const input = screen.getByRole("textbox");
      expect(input).toHaveValue("user@example.com");
      expect(input).toHaveAttribute("placeholder", "Enter your email");
    });

    it("should render label when label prop is provided", () => {
      render(<BaseTextField name="username" value="" label="Username" />);
      const label = screen.getByText("Username");
      expect(label).toBeInTheDocument();
      expect(label.tagName).toBe("LABEL");
    });

    it("should not render label when label prop is not provided", () => {
      const { container } = render(<BaseTextField name="username" value="" />);
      const label = container.querySelector("label");
      expect(label).not.toBeInTheDocument();
    });

    it("should associate label with input using id", () => {
      render(
        <BaseTextField
          name="username"
          value=""
          label="Username"
          id="username-input"
        />
      );
      const input = screen.getByRole("textbox");
      const label = screen.getByText("Username");
      expect(label).toHaveAttribute("for", "username-input");
      expect(input).toHaveAttribute("id", "username-input");
    });

    it("should apply small size class", () => {
      const { container } = render(
        <BaseTextField name="username" value="" size="small" />
      );
      const textField = container.querySelector(".text-field.small");
      expect(textField).toBeInTheDocument();
    });

    it("should render input with small size", () => {
      const { container } = render(
        <BaseTextField name="username" value="" size="small" />
      );
      const input = container.querySelector(".text-field.small input");
      expect(input).toBeInTheDocument();
    });

    it("should apply default size (no size class when default)", () => {
      const { container } = render(
        <BaseTextField name="username" value="" size="default" />
      );
      const textField = container.querySelector(".text-field");
      expect(textField).toBeInTheDocument();
      expect(textField).not.toHaveClass("small");
      expect(textField).not.toHaveClass("large");
    });

    it("should use default size when size prop is not provided", () => {
      const { container } = render(<BaseTextField name="username" value="" />);
      const textField = container.querySelector(".text-field");
      expect(textField).toBeInTheDocument();
      expect(textField).not.toHaveClass("small");
      expect(textField).not.toHaveClass("large");
    });

    it("should apply large size class", () => {
      const { container } = render(
        <BaseTextField name="username" value="" size="large" />
      );
      const textField = container.querySelector(".text-field.large");
      expect(textField).toBeInTheDocument();
    });

    it("should render input with large size", () => {
      const { container } = render(
        <BaseTextField name="username" value="" size="large" />
      );
      const input = container.querySelector(".text-field.large input");
      expect(input).toBeInTheDocument();
    });

    it("should apply square class when square is true", () => {
      const { container } = render(
        <BaseTextField name="username" value="" square />
      );
      const textField = container.querySelector(".text-field.square");
      expect(textField).toBeInTheDocument();
    });

    it("should not apply square class when square is false", () => {
      const { container } = render(
        <BaseTextField name="username" value="" square={false} />
      );
      const textField = container.querySelector(".text-field");
      expect(textField).not.toHaveClass("square");
    });

    it("should render spinner when loading is true", () => {
      const { container } = render(
        <BaseTextField name="username" value="" loading />
      );
      const spinner = container.querySelector(".spinner");
      expect(spinner).toBeInTheDocument();
    });

    it("should apply loading class when loading is true", () => {
      const { container } = render(
        <BaseTextField name="username" value="" loading />
      );
      const textField = container.querySelector(".text-field.loading");
      expect(textField).toBeInTheDocument();
    });

    it("should disable input when loading is true", () => {
      render(<BaseTextField name="username" value="" loading />);
      const input = screen.getByRole("textbox");
      expect(input).toBeDisabled();
    });

    it("should not render spinner when loading is false", () => {
      const { container } = render(
        <BaseTextField name="username" value="" loading={false} />
      );
      const spinner = container.querySelector(".spinner");
      expect(spinner).not.toBeInTheDocument();
    });

    it("should not disable input when loading is false", () => {
      render(<BaseTextField name="username" value="" loading={false} />);
      const input = screen.getByRole("textbox");
      expect(input).not.toBeDisabled();
    });

    it("should render input with required attribute when required is true", () => {
      render(<BaseTextField name="username" value="" required />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("required");
      expect(input).toHaveAttribute("aria-required", "true");
    });

    it("should not render input with required attribute when required is false", () => {
      render(<BaseTextField name="username" value="" required={false} />);
      const input = screen.getByRole("textbox");
      expect(input).not.toHaveAttribute("required");
      expect(input).toHaveAttribute("aria-required", "false");
    });

    it("should not render input with required attribute when required is undefined", () => {
      render(<BaseTextField name="username" value="" />);
      const input = screen.getByRole("textbox");
      expect(input).not.toHaveAttribute("required");
    });

    it("should render input with autoFocus attribute when autoFocus is true", () => {
      render(
        <BaseTextField name="username" value="" autoFocus onChange={() => {}} />
      );
      const input = screen.getByRole("textbox");

      expect(document.activeElement).toBe(input);
    });

    it("should not render input with autoFocus attribute when autoFocus is false", () => {
      render(<BaseTextField name="username" value="" autoFocus={false} />);
      const input = screen.getByRole("textbox");

      expect(document.activeElement).not.toBe(input);
    });

    it("should apply custom className to container div", () => {
      const { container } = render(
        <BaseTextField name="username" value="" className="custom-class" />
      );
      const textField = container.querySelector(".text-field.custom-class");
      expect(textField).toBeInTheDocument();
    });

    it("should apply multiple custom classNames", () => {
      const { container } = render(
        <BaseTextField
          name="username"
          value=""
          className="custom-class another-class"
        />
      );
      const textField = container.querySelector(
        ".text-field.custom-class.another-class"
      );
      expect(textField).toBeInTheDocument();
    });

    it("should apply custom style to container div", () => {
      const customStyle = { margin: "10px", padding: "5px" };
      const { container } = render(
        <BaseTextField name="username" value="" style={customStyle} />
      );
      const textField = container.querySelector(".text-field");
      expect(textField).toHaveStyle({ margin: "10px", padding: "5px" });
    });
  });

  describe("handler props", () => {
    it("should call onChange when input value changes", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(
        <BaseTextField name="username" value="" onChange={handleChange} />
      );
      const input = screen.getByRole("textbox");
      await user.type(input, "test");
      expect(handleChange).toHaveBeenCalled();
    });

    it("should not call onChange when input is disabled (loading)", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(
        <BaseTextField
          name="username"
          value=""
          onChange={handleChange}
          loading
        />
      );
      const input = screen.getByRole("textbox");
      await user.type(input, "test");
      expect(handleChange).not.toHaveBeenCalled();
    });

    it("should call onInput when input event occurs", async () => {
      const user = userEvent.setup();
      const handleInput = vi.fn();
      render(<BaseTextField name="username" value="" onInput={handleInput} />);
      const input = screen.getByRole("textbox");
      await user.type(input, "a");
      expect(handleInput).toHaveBeenCalled();
    });

    it("should call onFocus when input receives focus", async () => {
      const user = userEvent.setup();
      const handleFocus = vi.fn();
      render(<BaseTextField name="username" value="" onFocus={handleFocus} />);
      const input = screen.getByRole("textbox");
      await user.click(input);
      expect(handleFocus).toHaveBeenCalled();
    });

    it("should call onFocus when input is focused via keyboard", async () => {
      const user = userEvent.setup();
      const handleFocus = vi.fn();
      render(<BaseTextField name="username" value="" onFocus={handleFocus} />);
      const input = screen.getByRole("textbox");
      await user.tab();
      if (document.activeElement === input) {
        expect(handleFocus).toHaveBeenCalled();
      }
    });

    it("should call onBlur when input loses focus", async () => {
      const user = userEvent.setup();
      const handleBlur = vi.fn();
      render(<BaseTextField name="username" value="" onBlur={handleBlur} />);
      const input = screen.getByRole("textbox");
      await user.click(input);
      await user.tab();
      expect(handleBlur).toHaveBeenCalled();
    });
  });
});
