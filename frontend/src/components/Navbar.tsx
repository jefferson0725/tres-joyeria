import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Search, Heart, Menu, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useWishlist } from "@/hooks/useWishlist";
import heroBanner from "@/assets/logo.png";
import { motion, AnimatePresence } from "framer-motion";

interface NavbarProps {
  categories: string[];
  activeCategory: string;
  onCategorySelect: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onWishlistClick: () => void;
  overlayMode?: boolean;
  subcategories?: string[];
  activeSubcategory?: string | null;
  onSubcategorySelect?: (name: string | null) => void;
}

const Navbar: React.FC<NavbarProps> = ({
  categories,
  activeCategory,
  onCategorySelect,
  searchQuery,
  onSearchChange,
  onWishlistClick,
  overlayMode = false,
  subcategories = [],
  activeSubcategory = null,
  onSubcategorySelect,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMenuClosing, setIsMenuClosing] = useState(false);
  const [navOpacity, setNavOpacity] = useState(overlayMode ? 0 : 1);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { wishlist } = useWishlist();

  useEffect(() => {
    if (!overlayMode) {
      setNavOpacity(1);
      return;
    }
    const FADE_END = 280; // px scrolled hasta opacidad total
    const onScroll = () => setNavOpacity(Math.min(window.scrollY / FADE_END, 1));
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [overlayMode]);

  const handleMenuToggle = () => {
    if (isMobileMenuOpen) {
      setIsMenuClosing(true);
      setTimeout(() => {
        setIsMobileMenuOpen(false);
        setIsMenuClosing(false);
      }, 200);
    } else {
      setIsMobileMenuOpen(true);
      setIsMenuClosing(false);
    }
  };

  const handleCategorySelect = (category: string) => {
    onCategorySelect(category);
    setIsMenuClosing(true);
    setTimeout(() => {
      setIsMobileMenuOpen(false);
      setIsMenuClosing(false);
    }, 200);
  };

  return (
    <div
      className="fixed top-0 left-0 right-0 z-40 bg-foreground"
      style={{
        opacity: navOpacity,
        pointerEvents: navOpacity < 0.05 ? "none" : "auto",
      }}
    >
      {/* Top Navbar */}
      <nav className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <div className="flex items-center justify-between gap-4">

            {/* Left: hamburger (mobile) */}
            <div className="flex items-center w-10">
              <button
                onClick={handleMenuToggle}
                className="md:hidden p-1 rounded-lg hover:bg-white/10 text-white"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>

            {/* Center: logo */}
            <div className="flex-1 flex justify-center md:justify-start">
              <img
                src="/logo-horizontal.png"
                alt="TRES Joyería"
                className="h-11 md:h-12 w-auto object-contain"
              />
            </div>

            {/* Right: search + wishlist */}
            <div className="flex items-center gap-1">
              {/* Desktop search bar */}
              <div className="hidden md:flex max-w-sm w-64">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-300" />
                  <Input
                    type="text"
                    placeholder="Buscar piezas..."
                    className="w-full h-9 pl-9 pr-4 rounded-full border-white/20 !bg-white/10 text-white placeholder:text-gray-400 focus:!bg-white/20 text-sm focus-visible:!ring-1 focus-visible:!ring-white/40 focus-visible:!ring-offset-0"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                  />
                </div>
              </div>

              {/* Mobile search toggle */}
              <button
                onClick={() => {
                  setIsSearchOpen((v) => {
                    if (!v) setTimeout(() => searchInputRef.current?.focus(), 50);
                    return !v;
                  });
                }}
                className="md:hidden p-2 hover:bg-white/10 rounded-full transition-all text-white"
                aria-label="Buscar"
              >
                {isSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
              </button>

              {/* Wishlist */}
              <button
                onClick={onWishlistClick}
                className="relative p-2 hover:bg-white/10 rounded-full transition-all hover:scale-105 active:scale-95"
                title="Lista de deseos"
              >
                <Heart
                  className={`h-5 w-5 ${wishlist.length > 0 ? "fill-red-500 text-red-500" : "text-white"}`}
                />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile collapsible search */}
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="md:hidden overflow-hidden"
              >
                <div className="relative w-full pt-3 pb-1">
                  <Search className="absolute left-3 top-1/2 mt-1 h-4 w-4 -translate-y-1/2 text-gray-300" />
                  <Input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Buscar piezas..."
                    className="w-full h-10 pl-9 pr-4 rounded-full border-white/20 !bg-white/10 text-white placeholder:text-gray-400 text-sm focus-visible:!ring-1 focus-visible:!ring-white/40 focus-visible:!ring-offset-0"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Category Bar - Desktop Only */}
      <div className="hidden md:block border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-center justify-center gap-8 py-3 overflow-x-auto scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => onCategorySelect(category)}
                className={`whitespace-nowrap text-[11px] uppercase tracking-[0.14em] font-medium transition-colors pb-3 ${
                  activeCategory === category
                    ? "text-white border-b border-accent"
                    : "text-white/50 hover:text-white/80"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Subcategory Row - Desktop Only */}
      {subcategories.length > 0 && (
        <div className="hidden md:block border-b border-white/5">
          <div className="mx-auto max-w-7xl px-4 flex items-center gap-3 py-2 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => onSubcategorySelect?.(null)}
              className={`whitespace-nowrap text-[10px] uppercase tracking-[0.12em] px-3 py-1 rounded-full border transition-colors ${
                !activeSubcategory ? "border-accent text-accent" : "border-white/20 text-white/40 hover:text-white/70 hover:border-white/40"
              }`}
            >
              Todos
            </button>
            {subcategories.map((sub) => (
              <button
                key={sub}
                onClick={() => onSubcategorySelect?.(sub)}
                className={`whitespace-nowrap text-[10px] uppercase tracking-[0.12em] px-3 py-1 rounded-full border transition-colors ${
                  activeSubcategory === sub ? "border-accent text-accent" : "border-white/20 text-white/40 hover:text-white/70 hover:border-white/40"
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mobile Category Menu — rendered via portal to escape Navbar's stacking context */}
      {createPortal(
        <AnimatePresence>
          {(isMobileMenuOpen || isMenuClosing) && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[190] bg-black/50 md:hidden"
                onClick={() => {
                  setIsMenuClosing(true);
                  setTimeout(() => {
                    setIsMobileMenuOpen(false);
                    setIsMenuClosing(false);
                  }, 200);
                }}
              />

              {/* Sidebar */}
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
                className="fixed top-0 left-0 h-full w-72 z-[200] bg-foreground flex flex-col overflow-y-auto scrollbar-hide"
              >
                {/* Header */}
                <div className="relative flex items-center justify-center px-6 pt-10 pb-8">
                  <img src="/logo-horizontal.png" alt="Logo" className="h-12 w-auto object-contain" />
                  <button
                    onClick={handleMenuToggle}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white/40 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Gold divider */}
                <div className="mx-6 h-px bg-accent/30" />

                {/* Categories */}
                <nav className="flex-1 px-6 pt-8 pb-6">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-accent mb-6">
                    Colección
                  </p>
                  <div className="space-y-0">
                    {categories.map((category, idx) => (
                      <div key={category}>
                        <button
                          onClick={() => handleCategorySelect(category)}
                          className={`w-full text-left py-4 text-[15px] font-display transition-all duration-200 flex items-center justify-between group ${
                            idx < categories.length - 1 && !(activeCategory === category && subcategories.length > 0) ? "border-b border-white/10" : ""
                          } ${
                            activeCategory === category
                              ? "text-accent font-medium"
                              : "text-white/85 hover:text-white"
                          }`}
                        >
                          <span className={`tracking-wide transition-all ${activeCategory === category ? "translate-x-1" : "group-hover:translate-x-1"}`}>
                            {category}
                          </span>
                          {activeCategory === category && (
                            <span className="w-1 h-1 rounded-full bg-accent flex-shrink-0" />
                          )}
                        </button>
                        {/* Mobile subcategories — shown when parent is active */}
                        {activeCategory === category && subcategories.length > 0 && (
                          <div className={`pb-3 space-y-1 ${idx < categories.length - 1 ? "border-b border-white/8" : ""}`}>
                            <button
                              onClick={() => { onSubcategorySelect?.(null); }}
                              className={`w-full text-left pl-4 py-2 text-xs tracking-wider transition-colors ${!activeSubcategory ? "text-accent" : "text-white/65 hover:text-white"}`}
                            >
                              — Todos
                            </button>
                            {subcategories.map((sub) => (
                              <button
                                key={sub}
                                onClick={() => { onSubcategorySelect?.(sub); }}
                                className={`w-full text-left pl-4 py-2 text-xs tracking-wider transition-colors ${activeSubcategory === sub ? "text-accent" : "text-white/65 hover:text-white"}`}
                              >
                                — {sub}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </nav>

                {/* Footer */}
                <div className="mx-6 h-px bg-white/8" />
                <div className="px-6 py-6">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/20">
                    TRES Joyería
                  </p>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default Navbar;
