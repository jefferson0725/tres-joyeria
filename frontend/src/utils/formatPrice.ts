/**
 * Formatea un número como precio en pesos colombianos
 * @param price - El precio como número o string
 * @returns String formateado como "$ 1.234.567"
 */
export const formatPrice = (price: number | string): string => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numPrice)) {
    return '$ 0';
  }
  
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numPrice);
};
