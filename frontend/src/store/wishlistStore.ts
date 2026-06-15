import { create } from 'zustand';

interface WishlistItem {
  id: number;
  image: string;
  name: string;
  price: number;
  category: string;
  selectedSize?: {
    id: number;
    size: string;
    price: number;
    image: string | null;
  } | null;
  uniqueKey: string; // productId o productId-sizeId
  quantity: number; // cantidad deseada
}

interface WishlistState {
  wishlist: WishlistItem[];
  addToWishlist: (product: Omit<WishlistItem, 'quantity'>) => void;
  removeFromWishlist: (uniqueKey: string) => void;
  updateQuantity: (uniqueKey: string, quantity: number) => void;
  isInWishlist: (uniqueKey: string) => boolean;
  clearWishlist: () => void;
  loadFromStorage: () => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  wishlist: [],

  // Cargar desde localStorage
  loadFromStorage: () => {
    try {
      const saved = localStorage.getItem('wishlist');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Migrar items antiguos sin quantity
        const migrated = parsed.map((item: any) => ({
          ...item,
          quantity: item.quantity || 1
        }));
        set({ wishlist: migrated });
      }
    } catch (err) {
      console.error('Error loading wishlist:', err);
    }
  },

  // Agregar producto
  addToWishlist: (product: Omit<WishlistItem, 'quantity'>) => {
    set((state) => {
      const exists = state.wishlist.find((p) => p.uniqueKey === product.uniqueKey);
      if (exists) return state;
      
      const newWishlist = [...state.wishlist, { ...product, quantity: 1 }];
      localStorage.setItem('wishlist', JSON.stringify(newWishlist));
      return { wishlist: newWishlist };
    });
  },

  // Remover producto
  removeFromWishlist: (uniqueKey: string) => {
    set((state) => {
      const newWishlist = state.wishlist.filter((p) => p.uniqueKey !== uniqueKey);
      localStorage.setItem('wishlist', JSON.stringify(newWishlist));
      return { wishlist: newWishlist };
    });
  },

  // Actualizar cantidad
  updateQuantity: (uniqueKey: string, quantity: number) => {
    set((state) => {
      const newWishlist = state.wishlist.map((p) =>
        p.uniqueKey === uniqueKey ? { ...p, quantity: Math.max(0, quantity) } : p
      );
      localStorage.setItem('wishlist', JSON.stringify(newWishlist));
      return { wishlist: newWishlist };
    });
  },

  // Verificar si está en wishlist
  isInWishlist: (uniqueKey: string) => {
    return get().wishlist.some((p) => p.uniqueKey === uniqueKey);
  },

  // Limpiar wishlist
  clearWishlist: () => {
    localStorage.setItem('wishlist', JSON.stringify([]));
    set({ wishlist: [] });
  },
}));
