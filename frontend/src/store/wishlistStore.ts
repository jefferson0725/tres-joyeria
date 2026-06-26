import { create } from 'zustand';

const WISHLIST_KEY = 'wishlist';
const WISHLIST_VERSION = 1;

const saveWishlist = (items: WishlistItem[]) =>
  localStorage.setItem(WISHLIST_KEY, JSON.stringify({ v: WISHLIST_VERSION, data: items }));

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
      const saved = localStorage.getItem(WISHLIST_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved);
      // Migrate: old format was a plain array; new format is { v, data }
      const rawItems: any[] = Array.isArray(parsed) ? parsed : (parsed?.v === WISHLIST_VERSION ? parsed.data : []);
      const migrated = rawItems.map((item: any) => ({ ...item, quantity: item.quantity || 1 }));
      set({ wishlist: migrated });
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
      saveWishlist(newWishlist);
      return { wishlist: newWishlist };
    });
  },

  // Remover producto
  removeFromWishlist: (uniqueKey: string) => {
    set((state) => {
      const newWishlist = state.wishlist.filter((p) => p.uniqueKey !== uniqueKey);
      saveWishlist(newWishlist);
      return { wishlist: newWishlist };
    });
  },

  // Actualizar cantidad
  updateQuantity: (uniqueKey: string, quantity: number) => {
    set((state) => {
      const newWishlist = state.wishlist.map((p) =>
        p.uniqueKey === uniqueKey ? { ...p, quantity: Math.max(0, quantity) } : p
      );
      saveWishlist(newWishlist);
      return { wishlist: newWishlist };
    });
  },

  // Verificar si está en wishlist
  isInWishlist: (uniqueKey: string) => {
    return get().wishlist.some((p) => p.uniqueKey === uniqueKey);
  },

  // Limpiar wishlist
  clearWishlist: () => {
    saveWishlist([]);
    set({ wishlist: [] });
  },
}));
