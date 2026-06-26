
import { X, Trash2, ShoppingCart } from "lucide-react";
import { useWishlist } from "../hooks/useWishlist";
import { useSettings } from "@/context/SettingsContext";
import { formatPrice } from "@/utils/formatPrice";
import { Button } from "@/components/ui/button";

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const resolveImage = (src?: string | null) => {
  if (!src) return "/placeholder.svg";
  if (src.startsWith("/") || src.startsWith("http")) return src;
  return `/images/${src}`;
};

const WishlistDrawer = ({ isOpen, onClose }: WishlistDrawerProps) => {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { settings } = useSettings();
  const handleWhatsAppClick = () => {
    const cleanNumber = settings.whatsapp_number.replace(/[\s\-\(\)]/g, "");

    let message = "Hola, me interesan estos productos:";

    if (wishlist.length > 0) {
      const productLines = wishlist.map((product) => {
        if (product.selectedSize) {
          return `• ${product.name} - ${product.selectedSize.size}`;
        }
        return `• ${product.name}`;
      });
      message += `\n${productLines.join("\n")}`;
    }

    const encodedMessage = encodeURIComponent(message);
    window.open(
      `https://wa.me/${cleanNumber}?text=${encodedMessage}`,
      "_blank",
    );
  };

  return (
    <>
      {/* Backdrop — pointer-events-none cuando cerrado para no bloquear clicks */}
      <div
        role="presentation"
        aria-hidden="true"
        className={`fixed inset-0 bg-black z-50 transition-opacity duration-300 ${
          isOpen ? "bg-opacity-50 pointer-events-auto" : "bg-opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-[80%] md:w-96 max-w-md bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            Productos de Interés
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {wishlist.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingCart className="h-16 w-16 text-gray-300 mb-4" />
              <p className="text-lg font-semibold text-muted-foreground">
                No tienes productos seleccionados
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Agrega productos a tu lista de deseos para contactarnos
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {wishlist.map((product) => (
                <div
                  key={product.uniqueKey}
                  className="flex gap-4 p-3 bg-card rounded-lg border border-border hover:shadow-md transition-shadow"
                >
                  {/* Image */}
                  <div className="w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                    <img
                      src={resolveImage(product.image)}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">
                      {product.name}
                    </h3>
                    <p className="text-xs text-muted-foreground uppercase mt-1">
                      {product.category}
                    </p>
                    {product.selectedSize && (
                      <p className="text-xs text-secondary font-medium mt-1">
                        Tamaño: {product.selectedSize.size}
                      </p>
                    )}
                    {settings.show_prices && (
                      <p className="text-lg font-bold text-accent mt-1">
                        {formatPrice(product.price)}
                      </p>
                    )}

                  </div>

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => removeFromWishlist(product.uniqueKey)}
                    className="p-2 hover:bg-red-50 rounded-full transition-all hover:scale-110 active:scale-95 self-start"
                    aria-label="Eliminar de la lista"
                  >
                    <Trash2 className="h-5 w-5 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {wishlist.length > 0 && (
          <div className="border-t border-border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {wishlist.length} producto{wishlist.length !== 1 ? "s" : ""}{" "}
                seleccionado{wishlist.length !== 1 ? "s" : ""}
              </span>
              <button
                type="button"
                onClick={clearWishlist}
                className="text-sm text-red-500 hover:text-red-600 font-medium transition-all hover:scale-105 active:scale-95"
              >
                Limpiar todo
              </button>
            </div>
            <Button
              onClick={handleWhatsAppClick}
              className="w-full bg-[#128C7E] hover:bg-[#075E54] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              size="lg"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Pedir por WhatsApp
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default WishlistDrawer;
