import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Search, ShoppingCart, Menu, X, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useWishlist } from "@/hooks/useWishlist";
import { motion, AnimatePresence } from "framer-motion";
import { useMobileMenu } from "@/context/MobileMenuContext";

const EMPTY_SUBCATEGORIES: string[] = [];
const EMPTY_SUBCAT_MAP: Record<string, string[]> = {};

type ProductSuggestion = {
  id: number;
  name: string;
  slug?: string | null;
  image?: string | null;
  category?: { name?: string } | string;
};
const EMPTY_PRODUCTS: ProductSuggestion[] = [];

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
  onSearchSubmit?: (query: string) => void;
  categorySubcategoriesMap?: Record<string, string[]>;
  products?: ProductSuggestion[];
}

const Navbar: React.FC<NavbarProps> = ({
  categories,
  activeCategory,
  onCategorySelect,
  searchQuery,
  onSearchChange,
  onWishlistClick,
  overlayMode = false,
  subcategories = EMPTY_SUBCATEGORIES,
  activeSubcategory = null,
  onSubcategorySelect,
  onSearchSubmit,
  categorySubcategoriesMap = EMPTY_SUBCAT_MAP,
  products = EMPTY_PRODUCTS,
}) => {
  const [navOpacity, setNavOpacity] = useState(overlayMode ? 0 : 1);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { wishlist } = useWishlist();
  const { openMenu } = useMobileMenu();

  const resolveImage = (src?: string | null): string => {
    if (!src) return "/placeholder.svg";
    if (src.startsWith("/") || src.startsWith("http")) return src;
    return `/images/${src}`;
  };

  const suggestions: ProductSuggestion[] = searchQuery.trim().length >= 3
    ? products
        .filter((p) => {
          const q = searchQuery.toLowerCase();
          const nameMatch = p.name.toLowerCase().includes(q);
          const catName = typeof p.category === "string"
            ? p.category
            : (p.category as { name?: string } | undefined)?.name ?? "";
          const catMatch = catName.toLowerCase().includes(q);
          return nameMatch || catMatch;
        })
        .slice(0, 6)
    : [];

  useEffect(() => {
    if (!overlayMode) {
      setNavOpacity(1);
      return;
    }
    const FADE_END = 280;
    const onScroll = () => setNavOpacity(Math.min(window.scrollY / FADE_END, 1));
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [overlayMode]);

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
          <div className="relative flex items-center justify-between gap-4">

            {/* Left: hamburger (mobile) */}
            <div className="flex items-center w-10">
              <button
                type="button"
                onClick={openMenu}
                className="md:hidden p-1 rounded-lg hover:bg-white/10 text-white"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>

            {/* Center: logo — absolute para centrar respecto al ancho total */}
            <div className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 md:flex-1">
              <Link to="/">
                <img
                  src="/logo-horizontal.png"
                  alt="TRES Joyería"
                  className="h-11 md:h-12 w-auto object-contain"
                />
              </Link>
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
                    onKeyDown={(e) => e.key === "Enter" && onSearchSubmit?.(searchQuery)}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  />
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-50 mt-1 w-full bg-foreground border border-white/10 rounded-md shadow-2xl overflow-hidden top-full left-0">
                      {suggestions.map((p) => {
                        if (!p.slug) return null;
                        const catName = typeof p.category === "string"
                          ? p.category
                          : (p.category as { name?: string } | undefined)?.name ?? "";
                        return (
                          <Link
                            key={p.id}
                            to={`/producto/${p.slug}`}
                            onClick={() => setShowSuggestions(false)}
                            className="flex items-center gap-3 px-3 py-2 text-white/80 hover:bg-white/10 text-sm"
                          >
                            <img
                              src={resolveImage(p.image)}
                              alt={p.name}
                              className="h-8 w-8 rounded object-cover flex-shrink-0"
                            />
                            <span className="flex-1 min-w-0">
                              <span className="block truncate">{p.name}</span>
                              {catName && (
                                <span className="block text-xs text-white/40 truncate">{catName}</span>
                              )}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile search toggle */}
              <button
                type="button"
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
                type="button"
                onClick={onWishlistClick}
                className="relative p-2 hover:bg-white/10 rounded-full transition-all hover:scale-105 active:scale-95"
                title="Lista de deseos"
              >
                <ShoppingCart
                  className={`h-5 w-5 ${wishlist.length > 0 ? "text-red-500" : "text-white"}`}
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
                    onKeyDown={(e) => e.key === "Enter" && onSearchSubmit?.(searchQuery)}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  />
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-50 mt-1 w-full bg-foreground border border-white/10 rounded-md shadow-2xl overflow-hidden top-full left-0">
                      {suggestions.map((p) => {
                        if (!p.slug) return null;
                        const catName = typeof p.category === "string"
                          ? p.category
                          : (p.category as { name?: string } | undefined)?.name ?? "";
                        return (
                          <Link
                            key={p.id}
                            to={`/producto/${p.slug}`}
                            onClick={() => { setShowSuggestions(false); setIsSearchOpen(false); }}
                            className="flex items-center gap-3 px-3 py-2 text-white/80 hover:bg-white/10 text-sm"
                          >
                            <img
                              src={resolveImage(p.image)}
                              alt={p.name}
                              className="h-8 w-8 rounded object-cover flex-shrink-0"
                            />
                            <span className="flex-1 min-w-0">
                              <span className="block truncate">{p.name}</span>
                              {catName && (
                                <span className="block text-xs text-white/40 truncate">{catName}</span>
                              )}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Category Bar - Desktop Only */}
      <div className="hidden md:block border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4">
          {/* overflow-visible es crítico: sin él, overflow-x:auto corta los dropdowns absolutos */}
          <div className="flex items-center justify-center gap-8 py-3">
            {categories.map((category) => {
              const subs = categorySubcategoriesMap[category] || [];
              const hasSubs = subs.length > 0;
              const isActive = activeCategory === category;

              return (
                <div key={category} className="group relative">
                  <button
                    type="button"
                    onClick={() => onCategorySelect(category)}
                    className={`flex items-center gap-1 whitespace-nowrap text-[11px] uppercase tracking-[0.14em] font-medium transition-colors pb-3 ${
                      isActive
                        ? "text-white border-b border-accent"
                        : "text-white/50 hover:text-white/80"
                    }`}
                  >
                    {category}
                    {hasSubs && (
                      <ChevronDown className="w-3 h-3 transition-transform duration-200 group-hover:rotate-180" />
                    )}
                  </button>

                  {/* Dropdown — visible mientras el grupo esté en hover (botón O panel) */}
                  {hasSubs && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 z-50 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-150">
                      {/* Bridge invisible que une el botón con el panel sin gap */}
                      <div className="h-1 w-full" />
                      <div className="bg-foreground border border-white/10 shadow-2xl shadow-black/40 rounded-sm min-w-[160px] py-2">
                        {subs.map((sub) => (
                          <button
                            type="button"
                            key={sub}
                            onClick={() => {
                              onCategorySelect(category);
                              onSubcategorySelect?.(sub);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-[10px] uppercase tracking-[0.14em] transition-colors ${
                              activeSubcategory === sub
                                ? "text-accent bg-white/5"
                                : "text-white/60 hover:text-white hover:bg-white/5"
                            }`}
                          >
                            {sub}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Navbar;
