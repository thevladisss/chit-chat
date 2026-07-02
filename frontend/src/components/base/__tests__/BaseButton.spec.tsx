import { render, screen, fireEvent } from "@testing-library/react";
import BaseButton from "../BaseButton.tsx";

describe("BaseButton", () => {
  describe("rendering", () => {
    it("should match snapshot", () => {
      const { asFragment } = render(<BaseButton>Click me</BaseButton>);

      expect(asFragment()).toMatchSnapshot();
    });

    it("should render children when no icon is provided", () => {
      render(<BaseButton>Click me</BaseButton>);

      expect(screen.getByText("Click me")).toBeInTheDocument();
    });

    it("should apply the base-button class", () => {
      render(<BaseButton>Click me</BaseButton>);

      expect(screen.getByRole("button")).toHaveClass("base-button");
    });
  });

  describe("props", () => {
    describe("className", () => {
      it("should merge a custom className with the base classes", () => {
        render(<BaseButton className="custom-class">Click me</BaseButton>);

        const button = screen.getByRole("button");
        expect(button).toHaveClass("base-button");
        expect(button).toHaveClass("custom-class");
      });
    });

    describe("style", () => {
      it("should apply the passed style prop", () => {
        render(<BaseButton style={{ color: "red" }}>Click me</BaseButton>);

        expect(screen.getByRole("button")).toHaveStyle({
          color: "rgb(255, 0, 0)",
        });
      });
    });

    describe("type", () => {
      it("should set the button type attribute", () => {
        render(<BaseButton type="submit">Click me</BaseButton>);

        expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
      });
    });

    describe("icon", () => {
      it("should render the icon instead of children when provided", () => {
        render(
          <BaseButton icon={<span data-testid="icon-mock" />}>
            Click me
          </BaseButton>,
        );

        expect(screen.getByTestId("icon-mock")).toBeInTheDocument();
        expect(screen.queryByText("Click me")).not.toBeInTheDocument();
      });

      it("should apply the icon class when an icon is provided", () => {
        render(<BaseButton icon={<span data-testid="icon-mock" />} />);

        expect(screen.getByRole("button")).toHaveClass("icon");
      });

      it("should not apply the icon class when no icon is provided", () => {
        render(<BaseButton>Click me</BaseButton>);

        expect(screen.getByRole("button")).not.toHaveClass("icon");
      });
    });

    describe("loading", () => {
      it("should apply the loading class when loading is true", () => {
        render(<BaseButton loading>Click me</BaseButton>);

        expect(screen.getByRole("button")).toHaveClass("loading");
      });

      it("should disable the button when loading is true", () => {
        render(<BaseButton loading>Click me</BaseButton>);

        expect(screen.getByRole("button")).toBeDisabled();
      });

      it("should not disable the button when loading is false", () => {
        render(<BaseButton loading={false}>Click me</BaseButton>);

        expect(screen.getByRole("button")).not.toBeDisabled();
      });
    });
  });

  describe("handlers", () => {
    describe("onClick", () => {
      it("should call onClick when the button is clicked", () => {
        const mockOnClick = vi.fn();
        render(<BaseButton onClick={mockOnClick}>Click me</BaseButton>);

        fireEvent.click(screen.getByRole("button"));

        expect(mockOnClick).toHaveBeenCalledTimes(1);
      });

      it("should not call onClick when the button is disabled by loading", () => {
        const mockOnClick = vi.fn();
        render(
          <BaseButton onClick={mockOnClick} loading>
            Click me
          </BaseButton>,
        );

        fireEvent.click(screen.getByRole("button"));

        expect(mockOnClick).not.toHaveBeenCalled();
      });
    });
  });
});
