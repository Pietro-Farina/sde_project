// hooks/useResponsive.ts
import { Grid } from "antd";
import { useMemo } from "react";

const { useBreakpoint } = Grid;

export const useResponsive = () => {
  const screens = useBreakpoint();

  return useMemo(() => {
    /*
        Define device types based on breakpoints:
        - Mobile: width < 768px (screens.md is true when >= 768px)
        - Tablet: 768px <= width < 1200px (screens.xl is true when >= 1200px)
        - Desktop: width >= 1200px
    */
    const isMobile = !screens.md;
    const isTablet = screens.md && !screens.xl;
    const isDesktop = screens.xl;

    return {
      screens,
      isMobile,
      isTablet,
      isDesktop,
    };
  }, [screens]);
};
