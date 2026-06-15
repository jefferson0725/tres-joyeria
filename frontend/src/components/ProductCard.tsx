import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Eye, X, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { formatPrice } from "@/utils/formatPrice";
import { useWishlist } from "../hooks/useWishlist";
import { useSettings } from "@/context/SettingsContext";
import { useState, useEffect, useRef, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  sizes = [],
  images = [],
  material,
  purity,
  weightGrams,
  gemstones = [],
  featured = false,
  sku,
}: ProductCardProps) => {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { settings } = useSettings();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [modalPrice, setModalPrice] = useState<number>(price);
  const [imageTransition, setImageTransition] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Build full gallery: primary cover + gallery images
  const gallery = useMemo(() => {
    const list: string[] = [];
    if (image) list.push(image);
    for (const img of images) {
      if (img.url && img.url !== image) list.push(img.url);
    }
    return list.length ? list : [image || "/placeholder.svg"];
  }, [image, images]);

  useEffect(() => {
    if (isDialogOpen) {
      setModalPrice(price);
      setSelectedSizeId(null);
      setSelectedSize(null);
      setGalleryIndex(0);
    }
  }, [isDialogOpen, price]);

  const handleSizeChange = (sizeId: string) => {
    setImageTransition(true);
    setTimeout(() => {
      if (sizeId === "original") {
        setSelectedSizeId(null);
        setSelectedSize(null);
        setModalPrice(price);
      } else {
        setSelectedSizeId(sizeId);
        const size = sizes.find((s) => String(s.id) === sizeId);
        setSelectedSize(size || null);
        if (size) setModalPrice(size.price);
      }
      setTimeout(() => setImageTransition(false), 50);
    }, 200);
  };

  const getWishlistKey = () => (selectedSize ? `${id}-${selectedSize.id}` : String(id));
  const inWishlist = isInWishlist(getWishlistKey());

  const handleToggleWishlist = () => {
    const uniqueKey = getWishlistKey();
    if (inWishlist) {
      removeFromWishlist(uniqueKey);
    } else {
      addToWishlist({
        id,
        image,
        name,
        price: selectedSize ? selectedSize.price : price,
        category,
        selectedSize: selectedSize || null,
        uniqueKey,
      });
    }
  };

  const activeGalleryImage = selectedSize?.image || gallery[galleryIndex] || image;

  return (
    <>
      <Card className="group overflow-hidden border border-border bg-card shadow-none hover:shadow-lg hover:shadow-foreground/8 transition-all duration-500 flex flex-col h-full">
        <div
          className="aspect-square overflow-hidden bg-muted cursor-pointer relative"
          onClick={() => setIsDialogOpen(true)}
        >
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-muted animate-pulse">
              <div
                className="absolute inset-0 bg-gradient-to-r from-muted via-muted/40 to-muted animate-shimmer"
                style={{ backgroundSize: "200% 100%" }}
              />
            </div>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleWishlist();
            }}
            className={`absolute top-3 left-3 z-10 p-2 rounded-full backdrop-blur-sm transition-all ${
              inWishlist ? "bg-destructive/90 hover:bg-destructive" : "bg-background/90 hover:bg-background"
            }`}
          >
            <Heart className={`h-5 w-5 ${inWishlist ? "fill-background text-background" : "text-foreground"}`} />
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
          <h3 className="text-sm font-display font-medium text-foreground line-clamp-2 leading-snug">{name}</h3>

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

            <div className="flex justify-end">
              {slug ? (
                <Link
                  to={`/producto/${slug}`}
                  className="text-xs uppercase tracking-[0.12em] text-foreground hover:text-accent transition-colors font-medium border-b border-foreground hover:border-accent pb-px"
                >
                  Ver más
                </Link>
              ) : (
                <button
                  onClick={() => setIsDialogOpen(true)}
                  className="text-xs uppercase tracking-[0.12em] text-foreground hover:text-accent transition-colors font-medium border-b border-foreground hover:border-accent pb-px"
                >
                  Ver más
                </button>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 z-50 flex justify-end pointer-events-none">
            <DialogClose className="pointer-events-auto rounded-full opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none bg-background/95 backdrop-blur-sm p-2 border border-border shadow-sm hover:shadow-md">
              <X className="h-4 w-4" />
              <span className="sr-only">Cerrar</span>
            </DialogClose>
          </div>

          <DialogHeader className="-mt-10">
            <DialogTitle className="text-2xl font-display font-semibold pr-10">{name}</DialogTitle>
            <DialogDescription className="sr-only">Detalles de {name}</DialogDescription>
          </DialogHeader>

          <div className="grid md:grid-cols-2 gap-6 mt-4">
            <div className="md:sticky md:top-4 md:self-start">
              <div className="aspect-square overflow-hidden rounded-lg bg-muted relative">
                <img
                  src={resolveImageSrc(activeGalleryImage)}
                  alt={name}
                  className={`h-full w-full object-cover transition-all duration-300 ${
                    imageTransition ? "opacity-0 scale-95" : "opacity-100 scale-100"
                  }`}
                />
                {gallery.length > 1 && !selectedSize && (
                  <>
                    <button
                      type="button"
                      onClick={() => setGalleryIndex((i) => (i - 1 + gallery.length) % gallery.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow hover:bg-background"
                      aria-label="Imagen anterior"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setGalleryIndex((i) => (i + 1) % gallery.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow hover:bg-background"
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
                      key={`${src}-${idx}`}
                      type="button"
                      onClick={() => setGalleryIndex(idx)}
                      className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 transition ${
                        idx === galleryIndex ? "border-accent" : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={resolveImageSrc(src)} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">Categoría</p>
                <p className="text-base font-medium">{category}</p>
              </div>

              {(material || purity || weightGrams || sku) && (
                <dl className="grid grid-cols-2 gap-3 rounded-md border border-border bg-muted/40 p-3 text-sm">
                  {material && (
                    <div>
                      <dt className="text-xs uppercase text-muted-foreground">Material</dt>
                      <dd className="font-medium">{material}</dd>
                    </div>
                  )}
                  {purity && (
                    <div>
                      <dt className="text-xs uppercase text-muted-foreground">Pureza</dt>
                      <dd className="font-medium">{purity}</dd>
                    </div>
                  )}
                  {weightGrams !== null && weightGrams !== undefined && (
                    <div>
                      <dt className="text-xs uppercase text-muted-foreground">Peso</dt>
                      <dd className="font-medium">{Number(weightGrams)} g</dd>
                    </div>
                  )}
                  {sku && (
                    <div>
                      <dt className="text-xs uppercase text-muted-foreground">Referencia</dt>
                      <dd className="font-medium">{sku}</dd>
                    </div>
                  )}
                </dl>
              )}

              {gemstones?.length > 0 && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Piedras</p>
                  <ul className="space-y-1 text-sm">
                    {gemstones.map((g, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Sparkles className="h-3 w-3 text-accent" />
                        <span>
                          {g.type}
                          {g.count ? ` × ${g.count}` : ""}
                          {g.carat ? ` · ${g.carat} ct` : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {sizes && sizes.length > 0 && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Talla / Longitud</p>
                  <Select value={selectedSizeId || "original"} onValueChange={handleSizeChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="original">
                        {settings.show_prices ? `Original - ${formatPrice(price)}` : "Original"}
                      </SelectItem>
                      {sizes.map((size) => (
                        <SelectItem key={size.id} value={String(size.id)}>
                          {settings.show_prices ? `${size.size} - ${formatPrice(size.price)}` : size.size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {description && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Descripción</p>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{description}</p>
                </div>
              )}

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Precio</p>
                {settings.show_prices ? (
                  <p
                    className={`text-3xl font-display font-semibold text-foreground transition-all duration-300 ${
                      imageTransition ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
                    }`}
                  >
                    {formatPrice(modalPrice)}
                  </p>
                ) : (
                  <p className="text-lg text-muted-foreground">Precio bajo consulta</p>
                )}
              </div>

              <Button
                onClick={handleToggleWishlist}
                className={`w-full mt-2 ${
                  inWishlist ? "bg-destructive hover:bg-destructive/90" : "bg-primary hover:bg-primary/90"
                }`}
              >
                <Heart className={`h-5 w-5 mr-2 ${inWishlist ? "fill-current" : ""}`} />
                {inWishlist ? "Quitar de favoritos" : "Añadir a favoritos"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductCard;
