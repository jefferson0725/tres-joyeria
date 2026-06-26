import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ChevronLeft, ChevronRight, ShoppingCart, Sparkles, ArrowLeft } from "lucide-react";
import { useDataJson } from "@/hooks/useDataJson";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatPrice } from "@/utils/formatPrice";
import { useSettings } from "@/context/SettingsContext";
import { useWishlist } from "@/hooks/useWishlist";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import WishlistDrawer from "@/components/WishlistDrawer";

const SITE_URL = "https://tresjoyeria.com";

const resolveImage = (src?: string | null) => {
  if (!src) return "/placeholder.svg";
  if (src.startsWith("/") || src.startsWith("http")) return src;
  return `/images/${src}`;
};

const ProductPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const [galleryIndex, setGalleryIndex] = useState(0);
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null);
  const [navSearch, setNavSearch] = useState("");
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");

  const { data: jsonData, isLoading } = useDataJson();
  const product = (jsonData?.products ?? []).find((p: any) => p.slug === slug) ?? null;
  const [modalPrice, setModalPrice] = useState<number>(0);

  const _productId = product?.id;
  const _productPrice = product?.price;
  useEffect(() => {
    if (_productId != null && _productPrice != null) setModalPrice(parseFloat(_productPrice));
  }, [_productId, _productPrice]);

  if (isLoading) {
    return <div className="min-h-screen bg-background animate-pulse" />;
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Producto no encontrado</p>
        <Link to="/" className="text-sm underline">Volver al catálogo</Link>
      </div>
    );
  }

  const gallery: string[] = [];
  if (product.image) gallery.push(product.image);
  for (const img of product.images || []) {
    if (img.url && img.url !== product.image) gallery.push(img.url);
  }
  if (!gallery.length) gallery.push("/placeholder.svg");

  const selectedSize = (product.sizes || []).find((s: any) => String(s.id) === selectedSizeId) ?? null;
  const activeImage = selectedSize?.image ? resolveImage(selectedSize.image) : resolveImage(gallery[galleryIndex]);

  const handleSizeChange = (val: string) => {
    if (val === "original") {
      setSelectedSizeId(null);
      setModalPrice(parseFloat(product.price));
    } else {
      setSelectedSizeId(val);
      const s = (product.sizes || []).find((x: any) => String(x.id) === val);
      if (s) setModalPrice(parseFloat(s.price));
    }
  };

  const wishlistKey = selectedSize ? `${product.id}-${selectedSize.id}` : String(product.id);
  const inWishlist = isInWishlist(wishlistKey);

  const handleWishlist = () => {
    if (inWishlist) {
      removeFromWishlist(wishlistKey);
    } else {
      addToWishlist({
        id: product.id,
        image: resolveImage(product.image),
        name: product.name,
        price: modalPrice,
        category: product.category?.name || "",
        selectedSize: selectedSize || null,
        uniqueKey: wishlistKey,
      });
    }
  };

  const categoryName = product.category?.name || "";
  const metaTitle = `${product.name} | TRES Joyería`;
  const metaDesc = product.description
    ? product.description.slice(0, 155)
    : `${product.name}${categoryName ? ` — ${categoryName}` : ""}. Joyería de alta calidad.`;
  const ogImage = product.image ? `${SITE_URL}/images/${product.image}` : `${SITE_URL}/og-image.jpg`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || metaDesc,
    image: ogImage,
    sku: product.sku || undefined,
    brand: { "@type": "Brand", name: "TRES" },
    ...(product.material && { material: [product.material, product.purity].filter(Boolean).join(" ") }),
    ...(settings.show_prices && {
      offers: {
        "@type": "Offer",
        price: String(modalPrice),
        priceCurrency: "COP",
        availability: "https://schema.org/InStock",
        url: `${SITE_URL}/producto/${slug}`,
      },
    }),
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDesc} />
        <link rel="canonical" href={`${SITE_URL}/producto/${slug}`} />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDesc} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:url" content={`${SITE_URL}/producto/${slug}`} />
        <meta property="og:type" content="product" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(jsonLd).replace(/</g, "\\u003c").replace(/>/g, "\\u003e")}</script>
      </Helmet>

      <Navbar
        categories={[]}
        activeCategory="Todos"
        onCategorySelect={() => {}}
        searchQuery={navSearch}
        onSearchChange={setNavSearch}
        onSearchSubmit={(q) => navigate(`/?search=${encodeURIComponent(q)}`)}
        onWishlistClick={() => setIsWishlistOpen(true)}
        products={jsonData?.products ?? []}
      />

      <main className="mx-auto max-w-5xl px-4 pt-32 pb-20">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">Catálogo</Link>
          <span>/</span>
          {categoryName && (
            <>
              <Link to={`/?categoria=${encodeURIComponent(categoryName)}`} className="hover:text-foreground transition-colors">
                {categoryName}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
          {/* Gallery */}
          <div>
            <div
              className="aspect-square overflow-hidden bg-muted rounded-sm relative group"
              onMouseEnter={() => setZoom(true)}
              onMouseLeave={() => setZoom(false)}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
                const y = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100));
                setOrigin(`${x}% ${y}%`);
              }}
            >
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-200 cursor-zoom-in"
                style={{ transformOrigin: origin, transform: zoom ? "scale(2)" : "scale(1)" }}
              />
              {gallery.length > 1 && !selectedSize && (
                <>
                  <button
                    type="button"
                    onClick={() => setGalleryIndex((i) => (i - 1 + gallery.length) % gallery.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                    aria-label="Imagen anterior"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setGalleryIndex((i) => (i + 1) % gallery.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                    aria-label="Imagen siguiente"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
            {gallery.length > 1 && !selectedSize && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {gallery.map((src, idx) => (
                  <button
                    type="button"
                    key={src}
                    onClick={() => setGalleryIndex(idx)}
                    aria-label={`Ver imagen ${idx + 1}`}
                    className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-sm border-2 transition ${
                      idx === galleryIndex ? "border-accent" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={resolveImage(src)} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col gap-5">
            {categoryName && (
              <p className="text-[10px] uppercase tracking-[0.2em] text-accent">{categoryName}</p>
            )}
            <h1 className="text-3xl font-display font-semibold text-foreground leading-tight">{product.name}</h1>

            {/* Specs */}
            {(product.material || product.purity || product.weightGrams || product.sku) && (
              <dl className="grid grid-cols-2 gap-3 rounded-sm border border-border bg-muted/40 p-4 text-sm">
                {product.material && (
                  <div>
                    <dt className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">Material</dt>
                    <dd className="font-medium">{product.material}</dd>
                  </div>
                )}
                {product.purity && (
                  <div>
                    <dt className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">Pureza</dt>
                    <dd className="font-medium">{product.purity}</dd>
                  </div>
                )}
                {product.weightGrams != null && (
                  <div>
                    <dt className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">Peso</dt>
                    <dd className="font-medium">{Number(product.weightGrams)} g</dd>
                  </div>
                )}
                {product.sku && (
                  <div>
                    <dt className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">Referencia</dt>
                    <dd className="font-medium">{product.sku}</dd>
                  </div>
                )}
              </dl>
            )}

            {/* Gemstones */}
            {product.gemstones?.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2">Piedras</p>
                <ul className="space-y-1 text-sm">
                  {product.gemstones.map((g: any, idx: number) => (
                    <li key={g.id ?? `${g.type}-${idx}`} className="flex items-center gap-2">
                      <Sparkles className="h-3 w-3 text-accent" />
                      <span>
                        {g.type}{g.count ? ` × ${g.count}` : ""}{g.carat ? ` · ${g.carat} ct` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Sizes */}
            {product.sizes?.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2">Talla / Longitud</p>
                <Select value={selectedSizeId || "original"} onValueChange={handleSizeChange}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="original">
                      {settings.show_prices ? `Original — ${formatPrice(parseFloat(product.price))}` : "Original"}
                    </SelectItem>
                    {product.sizes.map((s: any) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {settings.show_prices ? `${s.size} — ${formatPrice(parseFloat(s.price))}` : s.size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2">Descripción</p>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{product.description}</p>
              </div>
            )}

            {/* Price */}
            <div className="border-t border-border pt-5">
              {settings.show_prices ? (
                <p className="text-3xl font-display font-semibold text-foreground">{formatPrice(modalPrice)}</p>
              ) : (
                <p className="text-lg text-muted-foreground">Precio bajo consulta</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={handleWishlist}
                variant="outline"
                className={`flex-1 h-11 border-2 ${inWishlist ? "border-destructive text-destructive" : "border-foreground text-foreground"}`}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {inWishlist ? "En favoritos" : "Añadir a favoritos"}
              </Button>
            </div>

            <Link
              to="/"
              className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-fit"
            >
              <ArrowLeft className="h-3 w-3" />
              Volver al catálogo
            </Link>
          </div>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
      <WishlistDrawer isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />
    </div>
  );
};

export default ProductPage;
