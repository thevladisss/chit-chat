import { screen, act, fireEvent } from "@testing-library/react";
import SignInForm from "../SignInForm.tsx";
import { renderWithProviders } from "../../../test/utils.tsx";

const mockRequestSignIn = vi.hoisted(() => vi.fn());

vi.mock("../../service/userService.ts", () => ({
  requestSignIn: mockRequestSignIn,
}));

describe("SignInForm", () => {
  const mockOnUserAuthenticate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequestSignIn.mockResolvedValue({ data: { username: "testuser" } });
  });

  describe("rendering", () => {
    it("should render the heading text", async () => {
      await renderWithProviders(
        <SignInForm onUserAuthenticate={mockOnUserAuthenticate} />,
      );

      expect(
        screen.getByText((_, element) => {
          return (
            element?.tagName === "H1" &&
            element?.textContent ===
              "Chit-Chat: Your instant chatting application"
          );
        }),
      ).toBeInTheDocument();
    });

    it("should render the subheading text", async () => {
      await renderWithProviders(
        <SignInForm onUserAuthenticate={mockOnUserAuthenticate} />,
      );

      expect(
        screen.getByText(
          "Come up with the unique username and proceed with chatting",
        ),
      ).toBeInTheDocument();
    });

    it("should render the username input with correct placeholder", async () => {
      await renderWithProviders(
        <SignInForm onUserAuthenticate={mockOnUserAuthenticate} />,
      );

      const input = screen.getByPlaceholderText("John Doe...");
      expect(input).toBeInTheDocument();
    });

    it("should render the submit button with 'Proceed' text", async () => {
      await renderWithProviders(
        <SignInForm onUserAuthenticate={mockOnUserAuthenticate} />,
      );

      expect(
        screen.getByRole("button", { name: "Proceed" }),
      ).toBeInTheDocument();
    });

    it("should render the username input as required", async () => {
      await renderWithProviders(
        <SignInForm onUserAuthenticate={mockOnUserAuthenticate} />,
      );

      const input = screen.getByPlaceholderText("John Doe...");
      expect(input).toBeRequired();
    });

    it("should render the username input with autoFocus", async () => {
      await renderWithProviders(
        <SignInForm onUserAuthenticate={mockOnUserAuthenticate} />,
      );

      const input = screen.getByPlaceholderText("John Doe...");
      expect(input).toHaveFocus();
    });
  });

  describe("username input", () => {
    it("should update value when user types", async () => {
      await renderWithProviders(
        <SignInForm onUserAuthenticate={mockOnUserAuthenticate} />,
      );

      const input = screen.getByPlaceholderText(
        "John Doe...",
      ) as HTMLInputElement;

      act(() => {
        fireEvent.input(input, { target: { value: "testuser" } });
      });

      expect(input.value).toBe("testuser");
    });

    it("should trim whitespace from input value", async () => {
      await renderWithProviders(
        <SignInForm onUserAuthenticate={mockOnUserAuthenticate} />,
      );

      const input = screen.getByPlaceholderText(
        "John Doe...",
      ) as HTMLInputElement;

      act(() => {
        fireEvent.input(input, { target: { value: "  hello world  " } });
      });

      expect(input.value).toBe("hello world");
    });
  });

  describe("form submission", () => {
    it("should dispatch signInAction with the username on submit", async () => {
      await renderWithProviders(
        <SignInForm onUserAuthenticate={mockOnUserAuthenticate} />,
      );

      const input = screen.getByPlaceholderText("John Doe...");
      const form = screen
        .getByRole("button", { name: "Proceed" })
        .closest("form")!;

      act(() => {
        fireEvent.input(input, { target: { value: "testuser" } });
      });

      await act(async () => {
        fireEvent.submit(form);
      });

      expect(mockRequestSignIn).toHaveBeenCalledWith("testuser");
    });

    it("should dispatch signInAction with trimmed username", async () => {
      await renderWithProviders(
        <SignInForm onUserAuthenticate={mockOnUserAuthenticate} />,
      );

      const input = screen.getByPlaceholderText("John Doe...");
      const form = screen
        .getByRole("button", { name: "Proceed" })
        .closest("form")!;

      act(() => {
        fireEvent.input(input, { target: { value: "  spaced  " } });
      });

      await act(async () => {
        fireEvent.submit(form);
      });

      expect(mockRequestSignIn).toHaveBeenCalledWith("spaced");
    });

    it("should not call onUserAuthenticate prop on submit", async () => {
      await renderWithProviders(
        <SignInForm onUserAuthenticate={mockOnUserAuthenticate} />,
      );

      const input = screen.getByPlaceholderText("John Doe...");
      const form = screen
        .getByRole("button", { name: "Proceed" })
        .closest("form")!;

      act(() => {
        fireEvent.input(input, { target: { value: "testuser" } });
      });

      await act(async () => {
        fireEvent.submit(form);
      });

      expect(mockOnUserAuthenticate).not.toHaveBeenCalled();
    });
  });
});
