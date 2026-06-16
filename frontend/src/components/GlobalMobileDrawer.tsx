import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useMobileMenu } from "@/context/MobileMenuContext";

interface CategoryData {
  id: number;
  name: string;
  parentId: number | null;
  subcategories: CategoryData[];
}

const GlobalMobileDrawer: React.FC = () => {
  const { isOpen, closeMenu } = useMobileMenu();
  const [isClosing, setIsClosing] = useState(false);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [expandedParent, setExpandedParent] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("/data.json").then((res) => {
      const tree = Array.isArray(res.data.categories) ? res.data.categories : [];
      setCategories(tree);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isOpen) setExpandedParent(null);
  }, [isOpen]);

  const handleClose = (callback?: () => void) => {
    setIsClosing(true);
    setTimeout(() => {
      closeMenu();
      setIsClosing(false);
      callback?.();
    }, 220);
  };

  const handleLogoClick = () => {
    handleClose(() => navigate("/"));
  };

  const handleCategoryClick = (category: CategoryData) => {
    if (category.subcategories?.length > 0) {
      // Expand/collapse without closing
      setExpandedParent((prev) => (prev === category.name ? null : category.name));
    } else {
      handleClose(() => navigate(`/?categoria=${encodeURIComponent(category.name)}`));
    }
  };

  const handleSubcategoryClick = (parentName: string, subName: string | null) => {
    handleClose(() => {
      if (subName) {
        navigate(`/?categoria=${encodeURIComponent(parentName)}&sub=${encodeURIComponent(subName)}`);
      } else {
        navigate(`/?categoria=${encodeURIComponent(parentName)}`);
      }
    });
  };

  const handleAllClick = () => {
    handleClose(() => navigate("/"));
  };

  const visible = isOpen || isClosing;

  return createPortal(
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isClosing ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[190] bg-black/50 md:hidden"
            onClick={() => handleClose()}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: isClosing ? "-100%" : 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.28, ease: "easeInOut" }}
            className="fixed top-0 left-0 h-full w-72 z-[200] bg-foreground flex flex-col overflow-y-auto scrollbar-hide md:hidden"
          >
            {/* Header — logo clickable */}
            <div className="relative flex items-center justify-center px-6 pt-10 pb-8">
              <button onClick={handleLogoClick} className="focus:outline-none">
                <img src="/logo-horizontal.png" alt="TRES Joyería" className="h-12 w-auto object-contain" />
              </button>
              <button
                onClick={() => handleClose()}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white/40 hover:text-white transition-colors"
                aria-label="Cerrar menú"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Gold divider */}
            <div className="mx-6 h-px bg-accent/30" />

            {/* Categories */}
            <nav className="flex-1 px-6 pt-8 pb-6">
              <p className="text-[10px] uppercase tracking-[0.25em] text-accent mb-6">Colección</p>
              <div className="space-y-0">
                {/* Todos */}
                <button
                  onClick={handleAllClick}
                  className="w-full text-left py-4 text-[15px] font-display border-b border-white/10 text-white/85 hover:text-white transition-colors flex items-center justify-between group"
                >
                  <span className="tracking-wide group-hover:translate-x-1 transition-transform">Todos</span>
                </button>

                {categories.map((category, idx) => {
                  const hasSubs = category.subcategories?.length > 0;
                  const isExpanded = expandedParent === category.name;
                  const isLast = idx === categories.length - 1;

                  return (
                    <div key={category.id}>
                      <button
                        onClick={() => handleCategoryClick(category)}
                        className={`w-full text-left py-4 text-[15px] font-display transition-all duration-200 flex items-center justify-between group ${
                          !isLast || isExpanded ? "border-b border-white/10" : ""
                        } text-white/85 hover:text-white`}
                      >
                        <span className="tracking-wide group-hover:translate-x-1 transition-transform">
                          {category.name}
                        </span>
                        {hasSubs && (
                          <ChevronRight
                            className={`w-4 h-4 text-white/40 transition-transform duration-200 ${
                              isExpanded ? "rotate-90" : ""
                            }`}
                          />
                        )}
                      </button>

                      {/* Subcategories */}
                      <AnimatePresence>
                        {isExpanded && hasSubs && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className={`overflow-hidden ${!isLast ? "border-b border-white/8" : ""}`}
                          >
                            <div className="pb-3 space-y-0.5">
                              <button
                                onClick={() => handleSubcategoryClick(category.name, null)}
                                className="w-full text-left pl-4 py-2.5 text-xs tracking-wider text-white/60 hover:text-white transition-colors"
                              >
                                — Todos
                              </button>
                              {category.subcategories.map((sub) => (
                                <button
                                  key={sub.id}
                                  onClick={() => handleSubcategoryClick(category.name, sub.name)}
                                  className="w-full text-left pl-4 py-2.5 text-xs tracking-wider text-white/60 hover:text-white transition-colors"
                                >
                                  — {sub.name}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </nav>

            {/* Footer */}
            <div className="mx-6 h-px bg-white/8" />
            <div className="px-6 py-6">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/20">TRES Joyería</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default GlobalMobileDrawer;
