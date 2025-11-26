import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useScreen } from "./useScreen";
import { ScreenSizeEnum } from "../enums/ScreenSizeEnum";

describe("useScreen", () => {
  const originalInnerWidth = window.innerWidth;
  const originalInnerHeight = window.innerHeight;

  beforeEach(() => {
    // Reset window size before each test
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1920,
    });
    Object.defineProperty(window, "innerHeight", {
      writable: true,
      configurable: true,
      value: 1080,
    });
  });

  afterEach(() => {
    // Restore original window size
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
    Object.defineProperty(window, "innerHeight", {
      writable: true,
      configurable: true,
      value: originalInnerHeight,
    });
  });

  const setWindowSize = (width: number, height: number = 1080) => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: width,
    });
    Object.defineProperty(window, "innerHeight", {
      writable: true,
      configurable: true,
      value: height,
    });
  };

  const triggerResize = () => {
    act(() => {
      window.dispatchEvent(new Event("resize"));
    });
  };

  describe("initial window size", () => {
    it("should return correct width and height", () => {
      setWindowSize(1920, 1080);
      const { result } = renderHook(() => useScreen());

      expect(result.current.width).toBe(1920);
      expect(result.current.height).toBe(1080);
    });
  });

  describe("XS breakpoint (< 639)", () => {
    it("should return xs=true for width 0", () => {
      setWindowSize(0);
      const { result } = renderHook(() => useScreen());

      expect(result.current.xs).toBe(true);
      expect(result.current.sm).toBe(false);
      expect(result.current.md).toBe(false);
      expect(result.current.lg).toBe(false);
      expect(result.current.xl).toBe(false);
    });

    it("should return xs=true for width 400", () => {
      setWindowSize(400);
      const { result } = renderHook(() => useScreen());

      expect(result.current.xs).toBe(true);
      expect(result.current.sm).toBe(false);
      expect(result.current.md).toBe(false);
      expect(result.current.lg).toBe(false);
      expect(result.current.xl).toBe(false);
    });

    it("should return xs=true for width 638", () => {
      setWindowSize(638);
      const { result } = renderHook(() => useScreen());

      expect(result.current.xs).toBe(true);
      expect(result.current.sm).toBe(false);
    });
  });

  describe("SM breakpoint (639 - 767)", () => {
    it("should return sm=true for width 639", () => {
      setWindowSize(639);
      const { result } = renderHook(() => useScreen());

      expect(result.current.xs).toBe(false);
      expect(result.current.sm).toBe(true);
      expect(result.current.md).toBe(false);
      expect(result.current.lg).toBe(false);
      expect(result.current.xl).toBe(false);
    });

    it("should return sm=true for width 700", () => {
      setWindowSize(700);
      const { result } = renderHook(() => useScreen());

      expect(result.current.xs).toBe(false);
      expect(result.current.sm).toBe(true);
      expect(result.current.md).toBe(false);
    });

    it("should return sm=true for width 767", () => {
      setWindowSize(767);
      const { result } = renderHook(() => useScreen());

      expect(result.current.xs).toBe(false);
      expect(result.current.sm).toBe(true);
      expect(result.current.md).toBe(false);
    });
  });

  describe("MD breakpoint (768 - 1023)", () => {
    it("should return md=true for width 768", () => {
      setWindowSize(768);
      const { result } = renderHook(() => useScreen());

      expect(result.current.xs).toBe(false);
      expect(result.current.sm).toBe(false);
      expect(result.current.md).toBe(true);
      expect(result.current.lg).toBe(false);
      expect(result.current.xl).toBe(false);
    });

    it("should return md=true for width 900", () => {
      setWindowSize(900);
      const { result } = renderHook(() => useScreen());

      expect(result.current.xs).toBe(false);
      expect(result.current.sm).toBe(false);
      expect(result.current.md).toBe(true);
      expect(result.current.lg).toBe(false);
    });

    it("should return md=true for width 1023", () => {
      setWindowSize(1023);
      const { result } = renderHook(() => useScreen());

      expect(result.current.xs).toBe(false);
      expect(result.current.sm).toBe(false);
      expect(result.current.md).toBe(true);
      expect(result.current.lg).toBe(false);
    });
  });

  describe("LG breakpoint (1024 - 1279)", () => {
    it("should return lg=true for width 1024", () => {
      setWindowSize(1024);
      const { result } = renderHook(() => useScreen());

      expect(result.current.xs).toBe(false);
      expect(result.current.sm).toBe(false);
      expect(result.current.md).toBe(false);
      expect(result.current.lg).toBe(true);
      expect(result.current.xl).toBe(false);
    });

    it("should return lg=true for width 1150", () => {
      setWindowSize(1150);
      const { result } = renderHook(() => useScreen());

      expect(result.current.xs).toBe(false);
      expect(result.current.sm).toBe(false);
      expect(result.current.md).toBe(false);
      expect(result.current.lg).toBe(true);
      expect(result.current.xl).toBe(false);
    });

    it("should return lg=true for width 1279", () => {
      setWindowSize(1279);
      const { result } = renderHook(() => useScreen());

      expect(result.current.xs).toBe(false);
      expect(result.current.sm).toBe(false);
      expect(result.current.md).toBe(false);
      expect(result.current.lg).toBe(true);
      expect(result.current.xl).toBe(false);
    });
  });

  describe("XL breakpoint (>= 1280)", () => {
    it("should return xl=true for width 1280", () => {
      setWindowSize(1280);
      const { result } = renderHook(() => useScreen());

      expect(result.current.xs).toBe(false);
      expect(result.current.sm).toBe(false);
      expect(result.current.md).toBe(false);
      expect(result.current.lg).toBe(false);
      expect(result.current.xl).toBe(true);
    });

    it("should return xl=true for width 1920", () => {
      setWindowSize(1920);
      const { result } = renderHook(() => useScreen());

      expect(result.current.xs).toBe(false);
      expect(result.current.sm).toBe(false);
      expect(result.current.md).toBe(false);
      expect(result.current.lg).toBe(false);
      expect(result.current.xl).toBe(true);
    });
  });

  describe("smaller breakpoint flags", () => {
    it("should return smAndSmaller=true for width <= 639", () => {
      setWindowSize(639);
      const { result } = renderHook(() => useScreen());

      expect(result.current.smAndSmaller).toBe(true);
      expect(result.current.mdAndSmaller).toBe(true);
      expect(result.current.lgAndSmaller).toBe(true);
    });

    it("should return smAndSmaller=false for width > 639", () => {
      setWindowSize(640);
      const { result } = renderHook(() => useScreen());

      expect(result.current.smAndSmaller).toBe(false);
    });

    it("should return mdAndSmaller=true for width <= 768", () => {
      setWindowSize(768);
      const { result } = renderHook(() => useScreen());

      expect(result.current.mdAndSmaller).toBe(true);
      expect(result.current.lgAndSmaller).toBe(true);
    });

    it("should return mdAndSmaller=false for width > 768", () => {
      setWindowSize(769);
      const { result } = renderHook(() => useScreen());

      expect(result.current.mdAndSmaller).toBe(false);
    });

    it("should return lgAndSmaller=true for width <= 1024", () => {
      setWindowSize(1024);
      const { result } = renderHook(() => useScreen());

      expect(result.current.lgAndSmaller).toBe(true);
    });

    it("should return lgAndSmaller=false for width > 1024", () => {
      setWindowSize(1025);
      const { result } = renderHook(() => useScreen());

      expect(result.current.lgAndSmaller).toBe(false);
    });
  });

  describe("window resize events", () => {
    it("should update values when window is resized", () => {
      setWindowSize(500);
      const { result, rerender } = renderHook(() => useScreen());

      expect(result.current.xs).toBe(true);
      expect(result.current.width).toBe(500);

      // Resize to SM
      setWindowSize(700);
      triggerResize();
      rerender();

      expect(result.current.xs).toBe(false);
      expect(result.current.sm).toBe(true);
      expect(result.current.width).toBe(700);

      // Resize to MD
      setWindowSize(800);
      triggerResize();
      rerender();

      expect(result.current.sm).toBe(false);
      expect(result.current.md).toBe(true);
      expect(result.current.width).toBe(800);

      // Resize to LG
      setWindowSize(1100);
      triggerResize();
      rerender();

      expect(result.current.md).toBe(false);
      expect(result.current.lg).toBe(true);
      expect(result.current.width).toBe(1100);

      // Resize to XL
      setWindowSize(1400);
      triggerResize();
      rerender();

      expect(result.current.lg).toBe(false);
      expect(result.current.xl).toBe(true);
      expect(result.current.width).toBe(1400);
    });

    it("should update height when window is resized", () => {
      setWindowSize(1920, 1080);
      const { result, rerender } = renderHook(() => useScreen());

      expect(result.current.height).toBe(1080);

      setWindowSize(1920, 720);
      triggerResize();
      rerender();

      expect(result.current.height).toBe(720);
    });
  });

  describe("edge cases", () => {
    it("should handle exact breakpoint values correctly", () => {
      // Test SM boundary
      setWindowSize(ScreenSizeEnum.SM);
      const { result: resultSM } = renderHook(() => useScreen());
      expect(resultSM.current.sm).toBe(true);
      expect(resultSM.current.xs).toBe(false);

      // Test MD boundary
      setWindowSize(ScreenSizeEnum.MD);
      const { result: resultMD } = renderHook(() => useScreen());
      expect(resultMD.current.md).toBe(true);
      expect(resultMD.current.sm).toBe(false);

      // Test LG boundary
      setWindowSize(ScreenSizeEnum.LG);
      const { result: resultLG } = renderHook(() => useScreen());
      expect(resultLG.current.lg).toBe(true);
      expect(resultLG.current.md).toBe(false);

      // Test XL boundary
      setWindowSize(ScreenSizeEnum.XL);
      const { result: resultXL } = renderHook(() => useScreen());
      expect(resultXL.current.xl).toBe(true);
      expect(resultXL.current.lg).toBe(false);
    });

    it("should only have one size flag true at a time", () => {
      const sizes = [400, 700, 900, 1100, 1400];

      sizes.forEach((size) => {
        setWindowSize(size);
        const { result } = renderHook(() => useScreen());

        const flags = [
          result.current.xs,
          result.current.sm,
          result.current.md,
          result.current.lg,
          result.current.xl,
        ];

        const trueCount = flags.filter(Boolean).length;
        expect(trueCount).toBe(1);
      });
    });
  });
});
