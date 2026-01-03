// ResponsiveProvider.tsx
import React, { createContext, useContext } from "react";
import { useResponsive } from "../../hooks/useResponsive.js";

const ResponsiveContext = createContext(null);

export const ResponsiveProvider = ({ children }) => {
  const responsive = useResponsive();
  return (
    <ResponsiveContext.Provider value={responsive}>
      {children}
    </ResponsiveContext.Provider>
  );
};

export const useAppResponsive = () => {
  const ctx = useContext(ResponsiveContext);
  if (!ctx) {
    throw new Error("useAppResponsive must be used inside ResponsiveProvider");
  }
  return ctx;
};