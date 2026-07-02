import { render, screen, fireEvent } from "@testing-library/react";
import BaseTextField from "../BaseTextField.tsx";

describe("BaseTextField", () => {
  describe("rendering", () => {
    it("should match snapshot", () => {
      const { asFragment } = render(
        <BaseTextField name="username" value="" />,
      );

      expect(asFragment()).toMatchSnapshot();
    });

    it("should render the input with the given name and value", () => {
      render(<BaseTextField name="username" value="john" />);

      const input = screen.getByDisplayValue("john") as HTMLInputElement;
      expect(input).toHaveAttribute("name", "username");
    });
  });

  describe("props", () => {
    describe("placeholder", () => {
      it("should render the placeholder text", () => {
        render(
          <BaseTextField
            name="username"
            value=""
            placeholder="John Doe..."
          />,
        );

        expect(
          screen.getByPlaceholderText("John Doe..."),
        ).toBeInTheDocument();
      });
    });

    describe("label", () => {
      it("should not render a label when label prop is not provided", () => {
        render(<BaseTextField name="username" value="" />);

        expect(
          screen.queryByText(/./, { selector: "label" }),
        ).not.toBeInTheDocument();
      });

      it("should render the label and associate it with the input via htmlFor/id", () => {
        render(
          <BaseTextField
            name="username"
            value=""
            id="username-field"
            label="Username"
          />,
        );

        const label = screen.getByText("Username");
        expect(label).toHaveAttribute("for", "username-field");
      });
    });

    describe("required", () => {
      it("should mark the input as required when required is true", () => {
        render(<BaseTextField name="username" value="" required />);

        expect(screen.getByRole("textbox")).toBeRequired();
      });
    });

    describe("autoFocus", () => {
      it("should autofocus the input when autoFocus is true", () => {
        render(<BaseTextField name="username" value="" autoFocus />);

        expect(screen.getByRole("textbox")).toHaveFocus();
      });
    });

    describe("style", () => {
      it("should apply the passed style prop to the wrapper", () => {
        const { container } = render(
          <BaseTextField name="username" value="" style={{ color: "red" }} />,
        );

        expect(container.firstChild).toHaveStyle({ color: "rgb(255, 0, 0)" });
      });
    });

    describe("className", () => {
      it("should merge a custom className with the base classes", () => {
        const { container } = render(
          <BaseTextField
            name="username"
            value=""
            className="custom-class"
          />,
        );

        expect(container.firstChild).toHaveClass("text-field");
        expect(container.firstChild).toHaveClass("custom-class");
      });
    });

    describe("size", () => {
      it("should apply the small class when size is small", () => {
        const { container } = render(
          <BaseTextField name="username" value="" size="small" />,
        );

        expect(container.firstChild).toHaveClass("small");
      });

      it("should apply the large class when size is large", () => {
        const { container } = render(
          <BaseTextField name="username" value="" size="large" />,
        );

        expect(container.firstChild).toHaveClass("large");
      });

      it("should not apply small or large class for the default size", () => {
        const { container } = render(
          <BaseTextField name="username" value="" />,
        );

        expect(container.firstChild).not.toHaveClass("small");
        expect(container.firstChild).not.toHaveClass("large");
      });
    });

    describe("square", () => {
      it("should apply the square class when square is true", () => {
        const { container } = render(
          <BaseTextField name="username" value="" square />,
        );

        expect(container.firstChild).toHaveClass("square");
      });

      it("should not apply the square class when square is not provided", () => {
        const { container } = render(
          <BaseTextField name="username" value="" />,
        );

        expect(container.firstChild).not.toHaveClass("square");
      });
    });

    describe("loading", () => {
      it("should apply the loading class and render a spinner when loading is true", () => {
        const { container } = render(
          <BaseTextField name="username" value="" loading />,
        );

        expect(container.firstChild).toHaveClass("loading");
        expect(container.querySelector(".spinner")).toBeInTheDocument();
      });

      it("should disable the input when loading is true", () => {
        render(<BaseTextField name="username" value="" loading />);

        expect(screen.getByRole("textbox")).toBeDisabled();
      });

      it("should not render a spinner when loading is false", () => {
        const { container } = render(
          <BaseTextField name="username" value="" loading={false} />,
        );

        expect(container.querySelector(".spinner")).not.toBeInTheDocument();
      });
    });
  });

  describe("handlers", () => {
    describe("onInput", () => {
      it("should call onInput when the user types", () => {
        const mockOnInput = vi.fn();
        render(
          <BaseTextField name="username" value="" onInput={mockOnInput} />,
        );

        fireEvent.input(screen.getByRole("textbox"), {
          target: { value: "hello" },
        });

        expect(mockOnInput).toHaveBeenCalledTimes(1);
      });
    });

    describe("onChange", () => {
      it("should call onChange when the input value changes", () => {
        const mockOnChange = vi.fn();
        render(
          <BaseTextField name="username" value="" onChange={mockOnChange} />,
        );

        fireEvent.change(screen.getByRole("textbox"), {
          target: { value: "hello" },
        });

        expect(mockOnChange).toHaveBeenCalledTimes(1);
      });
    });

    describe("onFocus", () => {
      it("should call onFocus when the input is focused", () => {
        const mockOnFocus = vi.fn();
        render(
          <BaseTextField name="username" value="" onFocus={mockOnFocus} />,
        );

        fireEvent.focus(screen.getByRole("textbox"));

        expect(mockOnFocus).toHaveBeenCalledTimes(1);
      });
    });

    describe("onBlur", () => {
      it("should call onBlur when the input loses focus", () => {
        const mockOnBlur = vi.fn();
        render(
          <BaseTextField name="username" value="" onBlur={mockOnBlur} />,
        );

        fireEvent.blur(screen.getByRole("textbox"));

        expect(mockOnBlur).toHaveBeenCalledTimes(1);
      });
    });
  });
});
