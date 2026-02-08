import { render, screen } from "@testing-library/react";
import SidebarUserInformation from "../SidebarUserInformation";

describe("SidebarUserInformation", () => {
  describe("rendering", () => {
    it("should render the username", () => {
      render(<SidebarUserInformation username="JohnDoe" />);

      expect(screen.getByText("JohnDoe")).toBeInTheDocument();
    });

    it("should render the greeting text", () => {
      render(<SidebarUserInformation username="JohnDoe" />);

      expect(
        screen.getByText((_, element) => {
          return (
            element?.tagName === "H2" &&
            element?.textContent === "👉 Hello, JohnDoe"
          );
        }),
      ).toBeInTheDocument();
    });

    it("should render the username inside a strong tag", () => {
      render(<SidebarUserInformation username="Alice" />);

      const strong = screen.getByText("Alice");
      expect(strong.tagName).toBe("STRONG");
    });

    it("should render the logout button", () => {
      render(<SidebarUserInformation username="JohnDoe" />);

      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("should render logout icon with correct title", () => {
      render(<SidebarUserInformation username="JohnDoe" />);

      expect(screen.getByTitle("Logout")).toBeInTheDocument();
    });

    it("should render with different username", () => {
      render(<SidebarUserInformation username="Jane" />);

      expect(screen.getByText("Jane")).toBeInTheDocument();
    });

    it("should render with empty username", () => {
      render(<SidebarUserInformation username="" />);

      expect(
        screen.getByText((_, element) => {
          return (
            element?.tagName === "H2" && element?.textContent === "👉 Hello, "
          );
        }),
      ).toBeInTheDocument();
    });
  });
});
