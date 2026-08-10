import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useContent } from './ContentContext';

const CartContext = createContext(null);
const STORAGE_KEY = 'monny-naturals-cart';

export function CartProvider({ children }) {
  const { products } = useContent();
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
  });
  const [toast, setToast] = useState('');

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); }, [cart]);

  // Keep saved carts in sync when the admin changes product price, stock, name or image.
  useEffect(() => {
    if (!products.length) return;
    setCart((current) => current.flatMap((item) => {
      const live = products.find((product) => String(product.id) === String(item.id));
      if (!live) return [];
      const stock = Math.max(0, Number(live.stock) || 0);
      const quantity = stock ? Math.min(Math.max(1, Number(item.quantity) || 1), stock) : 1;
      return [{ ...live, quantity }];
    }));
  }, [products]);

  const showToast = (message) => {
    setToast(message);
    window.clearTimeout(window.__monnyToastTimer);
    window.__monnyToastTimer = window.setTimeout(() => setToast(''), 2200);
  };

  const addToCart = (product, quantity = 1) => {
    const stock = Math.max(0, Number(product.stock) || 0);
    if (!stock) { showToast('This product is currently out of stock.'); return; }
    setCart((current) => {
      const existing = current.find((item) => String(item.id) === String(product.id));
      if (existing) {
        return current.map((item) => String(item.id) === String(product.id)
          ? { ...product, quantity: Math.min(stock, item.quantity + quantity) }
          : item);
      }
      return [...current, { ...product, quantity: Math.min(stock, Math.max(1, quantity)) }];
    });
    showToast('Added to cart successfully.');
  };

  const removeFromCart = (id) => setCart((current) => current.filter((item) => String(item.id) !== String(id)));
  const increaseQuantity = (id) => setCart((current) => current.map((item) => String(item.id) === String(id) ? { ...item, quantity: Math.min(Math.max(1, Number(item.stock) || 1), item.quantity + 1) } : item));
  const decreaseQuantity = (id) => setCart((current) => current.map((item) => String(item.id) === String(id) ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item));
  const clearCart = () => setCart([]);
  const getCartTotal = () => cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const getCartCount = () => cart.reduce((sum, item) => sum + item.quantity, 0);

  const value = useMemo(() => ({ cart, addToCart, removeFromCart, increaseQuantity, decreaseQuantity, clearCart, getCartTotal, getCartCount, toast, showToast }), [cart, toast]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const value = useContext(CartContext);
  if (!value) throw new Error('useCart must be used inside CartProvider');
  return value;
};
