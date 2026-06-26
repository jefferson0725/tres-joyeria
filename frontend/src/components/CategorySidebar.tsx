import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import heroBanner from "@/assets/logo.png";

interface CategorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  activeCategory: string;
  onCategorySelect: (category: string) => void;
}

const CategorySidebar: React.FC<CategorySidebarProps> = ({
  isOpen,
  onClose,
  categories,
  activeCategory,
  onCategorySelect,
}) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 200);
  };

  const handleCategorySelect = (category: string) => {
    onCategorySelect(category);
    handleClose();
  };

  return (
    <AnimatePresence>
      {(isOpen || isClosing) && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[190] bg-black/50 md:hidden"
            onClick={handleClose}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ duration: 0.2 }}
            className="fixed top-0 left-0 h-full w-[80%] md:w-72 z-[200] bg-gradient-to-b from-foreground to-foreground/90 border-r border-white/10 shadow-2xl overflow-y-auto"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-3 right-3 p-2.5 rounded-full bg-white/30 hover:bg-white/40 text-white transition-all z-[100] shadow-xl border border-white/20"
              aria-label="Cerrar menú"
            >
              <X className="w-6 h-6 stroke-[2.5]" />
            </button>

            {/* Logo Section */}
            <div className="flex items-center justify-center py-5 px-6 border-b border-white/10">
              <img
                src={heroBanner}
                alt="Logo"
                className="h-10 w-auto object-contain"
              />
            </div>

            {/* Categories Section */}
            <div className="px-4 py-6 space-y-3">
              <div className="space-y-3">
                <p className="text-[11px] font-bold text-white/50 uppercase tracking-[0.2em] px-3 mb-4">
                  Colección
                </p>
                <div className="space-y-1">
                  {categories.map((category) => (
                    <button
                      type="button"
                      key={category}
                      onClick={() => handleCategorySelect(category)}
                      className={`w-full text-left px-4 py-3 rounded-xl text-[13px] font-medium tracking-wide transition-all duration-200 ${
                        activeCategory === category
                          ? "bg-white text-foreground shadow-lg"
                          : "text-white/80 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CategorySidebar;
