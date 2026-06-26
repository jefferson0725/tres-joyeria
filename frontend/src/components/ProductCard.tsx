import { Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { ShoppingCart, Sparkles } from "lucide-react";
import { formatPrice } from "@/utils/formatPrice";
import { useWishlist } from "../hooks/useWishlist";
import { useSettings } from "@/context/SettingsContext";
import { useState, useRef, useMemo } from "react";

interface ProductSize {
  id: number;
  size: string;
  price: number;
  image: string | null;
}

interface ProductImage {
  id?: number;
  url: string;
  displayOrder?: number;
  isPrimary?: boolean;
}

interface Gemstone {
  type: string;
  carat?: number;
  count?: number;
}

interface ProductCardProps {
  id: number;
  slug?: string | null;
  image: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  sizes?: ProductSize[];
  images?: ProductImage[];
  material?: string | null;
  purity?: string | null;
  weightGrams?: number | null;
  gemstones?: Gemstone[];
  featured?: boolean;
  sku?: string | null;
}

const EMPTY_SIZES: ProductSize[] = [];
const EMPTY_IMAGES: ProductImage[] = [];
const EMPTY_GEMSTONES: Gemstone[] = [];

const resolveImageSrc = (src?: string | null) => {
  if (!src) return "/placeholder.svg";
  if (src.startsWith("/") || src.startsWith("http")) return src;
  return `/images/${src}`;
};

const ProductCard = ({
  id,
  slug,
  image,
  name,
  description,
  price,
  category,
  sizes = EMPTY_SIZES,
  images = EMPTY_IMAGES,
  material,
  purity,
  weightGrams,
  gemstones = EMPTY_GEMSTONES,
  featured = false,
  sku,
}: ProductCardProps) => {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const gallery = useMemo(() => {
    const list: string[] = [];
    if (image) list.push(image);
    for (const img of images) {
      if (img.url && img.url !== image) list.push(img.url);
    }
    return list.length ? list : [image || "/placeholder.svg"];
  }, [image, images]);

  const wishlistKey = String(id);
  const inWishlist = isInWishlist(wishlistKey);

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist) {
      removeFromWishlist(wishlistKey);
    } else {
      addToWishlist({ id, image, name, price, category, selectedSize: null, uniqueKey: wishlistKey });
    }
  };

  const handleCardClick = () => {
    if (slug) navigate(`/producto/${slug}`);
  };

  return (
    <Card
      onClick={handleCardClick}
      className={`group overflow-hidden border border-border bg-card shadow-none hover:shadow-lg hover:shadow-foreground/8 transition-all duration-500 flex flex-col h-full ${slug ? "cursor-pointer" : ""}`}
    >
      <div className="aspect-square overflow-hidden bg-muted relative">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-muted animate-pulse">
            <div
              className="absolute inset-0 bg-gradient-to-r from-muted via-muted/40 to-muted animate-shimmer"
              style={{ backgroundSize: "200% 100%" }}
            />
          </div>
        )}

        <button
          type="button"
          onClick={handleToggleWishlist}
          className={`absolute top-3 left-3 z-10 p-2 rounded-full backdrop-blur-sm transition-all ${
            inWishlist ? "bg-destructive/90 hover:bg-destructive" : "bg-background/90 hover:bg-background"
          }`}
        >
          <ShoppingCart className={`h-5 w-5 ${inWishlist ? "fill-background text-background" : "text-foreground"}`} />
        </button>

        {featured && (
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1 rounded-full bg-accent px-2 py-1 text-xs font-semibold text-accent-foreground shadow">
            <Sparkles className="h-3 w-3" />
            Destacado
          </div>
        )}

        <img
          ref={imgRef}
          src={resolveImageSrc(image)}
          alt={name}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={() => { setImageError(true); setImageLoaded(true); }}
          className={`h-full w-full object-cover transition-all duration-700 group-hover:scale-103 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
        />

        {imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <span className="text-muted-foreground text-sm">Sin imagen</span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1 gap-1">
        <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">{category}</p>
        <h3 className="text-sm font-display font-medium text-foreground line-clamp-2 leading-snug group-hover:text-accent transition-colors">
          {name}
        </h3>

        {(material || purity) && (
          <p className="text-xs tracking-wide text-muted-foreground">
            {[material, purity].filter(Boolean).join(" · ")}
          </p>
        )}

        <div className="mt-auto pt-3 flex flex-col gap-2 border-t border-border">
          <div>
            {settings.show_prices ? (
              <span className="text-sm font-semibold text-foreground">{formatPrice(price)}</span>
            ) : (
              <span className="text-xs text-muted-foreground tracking-wide">Precio bajo consulta</span>
            )}
          </div>

          {slug && (
            <div className="flex justify-end">
              <Link
                to={`/producto/${slug}`}
                onClick={(e) => e.stopPropagation()}
                className="text-xs uppercase tracking-[0.12em] text-foreground hover:text-accent transition-colors font-medium border-b border-foreground hover:border-accent pb-px"
              >
                Ver más
              </Link>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;
