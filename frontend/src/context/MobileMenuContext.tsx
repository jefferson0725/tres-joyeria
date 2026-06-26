import React, { createContext, useContext, useState, useMemo, useCallback } from "react";

interface MobileMenuContextValue {
  isOpen: boolean;
  openMenu: () => void;
  closeMenu: () => void;
}

const MobileMenuContext = createContext<MobileMenuContextValue>({
  isOpen: false,
  openMenu: () => {},
  closeMenu: () => {},
});

export const MobileMenuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const openMenu = useCallback(() => setIsOpen(true), []);
  const closeMenu = useCallback(() => setIsOpen(false), []);
  const value = useMemo(() => ({ isOpen, openMenu, closeMenu }), [isOpen, openMenu, closeMenu]);

  return <MobileMenuContext.Provider value={value}>{children}</MobileMenuContext.Provider>;
};

export const useMobileMenu = () => useContext(MobileMenuContext);
