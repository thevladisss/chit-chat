import { useState, useEffect, useMemo } from "react";
import { ScreenSizeEnum } from "../enums/ScreenSizeEnum";

interface UseScreenReturn {
  xs: boolean;
  sm: boolean;
  md: boolean;
  lg: boolean;
  xl: boolean;
  smAndSmaller: boolean;
  mdAndSmaller: boolean;
  lgAndSmaller: boolean;
  width: number;
  height: number;
}

export const useScreen = (): UseScreenReturn => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Set initial size

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const xs = useMemo(() => windowSize.width < ScreenSizeEnum.SM, [windowSize.width]);
  const sm = useMemo(() => windowSize.width >= ScreenSizeEnum.SM && windowSize.width < ScreenSizeEnum.MD, [windowSize.width]);
  const md = useMemo(() => windowSize.width >= ScreenSizeEnum.MD && windowSize.width < ScreenSizeEnum.LG, [windowSize.width]);
  const lg = useMemo(() => windowSize.width >= ScreenSizeEnum.LG && windowSize.width < ScreenSizeEnum.XL, [windowSize.width]);
  const xl = useMemo(() => windowSize.width >= ScreenSizeEnum.XL, [windowSize.width]);

  const smAndSmaller = useMemo(() => windowSize.width <= ScreenSizeEnum.SM, [windowSize.width]);
  const mdAndSmaller = useMemo(() => windowSize.width <= ScreenSizeEnum.MD, [windowSize.width]);
  const lgAndSmaller = useMemo(() => windowSize.width <= ScreenSizeEnum.LG, [windowSize.width]);

  return {
    xs,
    sm,
    md,
    lg,
    xl,
    smAndSmaller,
    mdAndSmaller,
    lgAndSmaller,
    width: windowSize.width,
    height: windowSize.height,
  };
};

