import { useEffect } from 'react';
import { useWishlistStore } from '../store/wishlistStore';

/**
 * Hook de compatibilidad con el antiguo WishlistContext
 * Permite usar Zustand sin cambiar todos los componentes
 */
export const useWishlist = () => {
  const { wishlist, addToWishlist, removeFromWishlist, updateQuantity, isInWishlist, clearWishlist, loadFromStorage } = useWishlistStore();

  // Cargar datos al montar
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  return { wishlist, addToWishlist, removeFromWishlist, updateQuantity, isInWishlist, clearWishlist };
};
