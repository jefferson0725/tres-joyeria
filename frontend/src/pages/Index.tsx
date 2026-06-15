import React, { useEffect, useState, useRef, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import axios from "axios";
import { Loader2 } from "lucide-react";
import AnimatedProductCard from "@/components/AnimatedProductCard";
import AttributeFilters from "@/components/AttributeFilters";
import CategoryFilter from "@/components/CategoryFilter";
import WhatsAppButton from "@/components/WhatsAppButton";
import SocialFloat from "@/components/SocialFloat";
import WishlistDrawer from "@/components/WishlistDrawer";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Carousel from "@/components/Carousel";
import { useWishlist } from "@/hooks/useWishlist";
import { useDataVersion } from "@/hooks/useDataVersion";
import { useSettings } from "@/context/SettingsContext";
import { motion, AnimatePresence } from "framer-motion";

// products will be loaded from local JSON file
const PRODUCTS_PER_PAGE = 12; // Number of products to load per batch

const Index = () => {
  const { wishlist } = useWishlist();
  const { settings } = useSettings();
  // Auto-reload when data.json changes (checks every 30 seconds in production)
  useDataVersion(30000);

  const [searchQuery, setSearchQuery] = useState("");
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  interface CategoryData { id: number; name: string; parentId: number | null; subcategories: CategoryData[] }
  const [categories, setCategories] = useState<CategoryData[]>([]); // parent categories with nested subcategories
  const [activeParentName, setActiveParentName] = useState<string>("Todos");
  const [activeSubName, setActiveSubName] = useState<string | null>(null);

  // Legacy alias used by Navbar and section header
  const activeCategory = activeSubName ?? activeParentName;
  const setActiveCategory = (name: string) => {
    setActiveParentName(name);
    setActiveSubName(null);
    setActiveGemstones([]);
    setActiveMaterials([]);
  };

  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);

  // Attribute filters
  const [activeGemstones, setActiveGemstones] = useState<string[]>([]);
  const [activeMaterials, setActiveMaterials] = useState<string[]>([]);

  // Pagination state
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_PAGE);
  const [loadingMore, setLoadingMore] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  // Load categories from local JSON
  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoadingCategories(true);
      setCategoriesError(null);
      try {
        const response = await axios.get("/data.json");
        const data = response.data;
        if (!mounted) return;

        const tree = Array.isArray(data.categories) ? data.categories : [];
        setCategories(tree);
      } catch (err: any) {
        if (!mounted) return;
        setCategoriesError(err.message || "Error loading categories");
      } finally {
        if (mounted) setLoadingCategories(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Load products from local JSON
  useEffect(() => {
    let mounted = true;
    async function loadProducts() {
      setLoadingProducts(true);
      setProductsError(null);
      try {
        const response = await axios.get("/data.json");
        const data = response.data;
        if (!mounted) return;

        // Transform products to use local image paths
        const productsData = Array.isArray(data.products)
          ? data.products.map((p: any) => ({
              ...p,
              image: p.image ? `/images/${p.image}` : null,
              sizes: p.sizes
                ? p.sizes.map((s: any) => ({
                    ...s,
                    image: s.image ? `/images/${s.image}` : null,
                  }))
                : [],
              images: p.images
                ? p.images.map((img: any) => ({
                    ...img,
                    url: img.url ? `/images/${img.url}` : null,
                  }))
                : [],
            }))
          : [];

        setProducts(productsData);
      } catch (err: any) {
        if (!mounted) return;
        setProductsError(err.message || "Error loading products");
      } finally {
        if (mounted) setLoadingProducts(false);
      }
    }
    loadProducts();
    return () => {
      mounted = false;
    };
  }, []);

  // Unique attribute values available in the current catalogue
  const availableGemstones = [...new Set(
    products.flatMap((p) => (p.gemstones || []).map((g: any) => g.type).filter(Boolean))
  )].sort() as string[];

  const availableMaterials = [...new Set(
    products.map((p) => p.material).filter(Boolean)
  )].sort() as string[];

  const toggleGemstone = (g: string) =>
    setActiveGemstones((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]);

  const toggleMaterial = (m: string) =>
    setActiveMaterials((prev) => prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]);

  const clearAttributeFilters = () => { setActiveGemstones([]); setActiveMaterials([]); };

  const filteredProducts = products.filter((product) => {
    const catId: number | undefined = product?.category?.id;
    const matchesSearch = String(product.name || "").toLowerCase().includes(searchQuery.toLowerCase());

    // Category filter
    let matchesCat = true;
    if (activeParentName !== "Todos") {
      const parent = categories.find((c) => c.name === activeParentName);
      if (parent) {
        const childIds = (parent.subcategories ?? []).map((s) => s.id);
        matchesCat = catId === parent.id || childIds.includes(catId!);
      }
    }
    const matchesSub = !activeSubName || product?.category?.name === activeSubName;

    // Attribute filters (OR within each group, AND between groups)
    const matchesGem = activeGemstones.length === 0 || (
      (product.gemstones || []).some((g: any) =>
        activeGemstones.some((sel) => g.type?.toLowerCase() === sel.toLowerCase())
      )
    );
    const matchesMat = activeMaterials.length === 0 || (
      activeMaterials.some((m) => product.material?.toLowerCase() === m.toLowerCase())
    );

    return matchesCat && matchesSub && matchesSearch && matchesGem && matchesMat;
  });

  // Reset visible count when any filter changes
  useEffect(() => {
    setVisibleCount(PRODUCTS_PER_PAGE);
  }, [activeParentName, activeSubName, searchQuery, activeGemstones, activeMaterials]);

  // Products to display (paginated)
  const displayedProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  const featuredProducts = products.filter((p) => Boolean(p.featured)).slice(0, 8);
  const showFeatured =
    featuredProducts.length > 0 && activeCategory === "Todos" && !searchQuery;

  // Infinite scroll observer
  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    // Small delay for smooth UX
    setTimeout(() => {
      setVisibleCount((prev) => prev + PRODUCTS_PER_PAGE);
      setLoadingMore(false);
    }, 300);
  }, [loadingMore, hasMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: "100px" },
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [loadMore, hasMore]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>
          {activeParentName === "Todos"
            ? "TRES Joyería | Catálogo"
            : `${activeSubName ?? activeParentName} | TRES Joyería`}
        </title>
        <meta
          name="description"
          content={
            activeParentName === "Todos"
              ? "Descubre nuestra colección de joyería: anillos, collares, aretes, pulseras y más. Piezas únicas de alta calidad."
              : `Explora nuestra colección de ${activeSubName ?? activeParentName}. Joyería de alta calidad en TRES.`
          }
        />
      </Helmet>
      {/* Navbar Component */}
      <Navbar
        categories={["Todos", ...categories.map((c) => c.name)]}
        activeCategory={activeParentName}
        onCategorySelect={setActiveCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onWishlistClick={() => setIsWishlistOpen(true)}
        overlayMode={settings.show_carousel}
        subcategories={(categories.find((c) => c.name === activeParentName)?.subcategories ?? []).map((s) => s.name)}
        activeSubcategory={activeSubName}
        onSubcategorySelect={setActiveSubName}
      />

      {/* Carousel — full viewport, no top padding (navbar overlays transparently) */}
      {settings.show_carousel && <Carousel />}

      {/* Attribute filters — sticky below navbar */}
      <div className={settings.show_carousel ? "" : "mt-[var(--navbar-h,5rem)]"}>
        <AttributeFilters
          availableGemstones={availableGemstones}
          availableMaterials={availableMaterials}
          activeGemstones={activeGemstones}
          activeMaterials={activeMaterials}
          onToggleGemstone={toggleGemstone}
          onToggleMaterial={toggleMaterial}
          onClear={clearAttributeFilters}
        />
      </div>

      {/* Main Content */}
      <main
        className={`flex-1 mx-auto w-full max-w-7xl px-4 py-12 ${settings.show_carousel ? "pt-16" : "pt-32 md:pt-48"}`}
      >
        {showFeatured && (
          <section className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-accent">Selección</p>
                <h2 className="text-3xl font-display font-semibold text-foreground">Piezas destacadas</h2>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
              {featuredProducts.map((product, index) => (
                <AnimatedProductCard key={`featured-${product.id}`} product={product} index={index} />
              ))}
            </div>
          </section>
        )}

        {/* Products Grid */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
          <div className="mb-6 flex items-end justify-between border-b border-border pb-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-accent mb-1">
                {activeCategory === "Todos" ? "Colección completa" : "Categoría"}
              </p>
              <h2 className="text-2xl font-display font-medium text-foreground">
                {activeCategory === "Todos" ? "Catálogo" : activeCategory}
              </h2>
            </div>
            <p className="text-xs text-muted-foreground tracking-wide">
              {filteredProducts.length} {filteredProducts.length === 1 ? "pieza" : "piezas"}
            </p>
          </div>
          {loadingProducts ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-xl text-muted-foreground">
                No se encontraron piezas
              </p>
            </div>
          ) : (
            <>
              <motion.div
                key={activeCategory}
                className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-6"
              >
                {displayedProducts.map((product, index) => (
                  <AnimatedProductCard
                    key={product.id}
                    product={product}
                    index={index}
                  />
                ))}
              </motion.div>

              {/* Infinite scroll loader */}
              {hasMore && (
                <div
                  ref={loaderRef}
                  className="flex justify-center items-center py-8 mt-4"
                >
                  {loadingMore ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Cargando más piezas...</span>
                    </div>
                  ) : (
                    <div className="h-8" />
                  )}
                </div>
              )}

              {/* End of products message */}
              {!hasMore && filteredProducts.length > PRODUCTS_PER_PAGE && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Has visto todas las piezas</p>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      {/* Footer */}
      <Footer />

      {/* WhatsApp Button */}
      <WhatsAppButton />

      {/* Social Float */}
      <SocialFloat />

      {/* Wishlist Drawer */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
      />
    </div>
  );
};

export default Index;
