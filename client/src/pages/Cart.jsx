import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useContent } from '../context/ContentContext';
import { formatNaira } from '../utils/format';

export default function Cart() {
  const { cart, removeFromCart, increaseQuantity, decreaseQuantity, getCartTotal } = useCart();
  const { store } = useContent();
  const subtotal = getCartTotal();
  const freeThreshold = Number(store.freeShippingThreshold || 0);
  const delivery = cart.length && (!freeThreshold || subtotal < freeThreshold) ? Number(store.deliveryFee || 0) : 0;

  if (!cart.length) return (
    <section className="page-shell container empty-state cart-empty">
      <ShoppingBag size={48}/><h1>Your cart is waiting</h1><p>Add your favourite natural beauty essentials and they’ll appear here.</p><Link className="btn btn-dark" to="/products">Start shopping</Link>
    </section>
  );

  return (
    <section className="page-shell container cart-page">
      <div className="page-hero compact"><span className="eyebrow">Your ritual, almost ready</span><h1>Shopping Cart</h1></div>
      <div className="cart-layout">
        <div className="cart-items">
          {cart.map((item) => <article className="cart-item" key={item.id}><img src={item.image} alt={item.name} loading="lazy" decoding="async"/><div className="cart-item-copy"><span>{item.category}</span><Link to={`/products/${item.id}`}>{item.name}</Link><strong>{formatNaira(item.price)}</strong></div><div className="quantity"><button onClick={() => decreaseQuantity(item.id)}><Minus/></button><b>{item.quantity}</b><button onClick={() => increaseQuantity(item.id)}><Plus/></button></div><strong className="line-total">{formatNaira(item.price * item.quantity)}</strong><button className="remove-btn" onClick={() => removeFromCart(item.id)} aria-label={`Remove ${item.name}`}><Trash2/></button></article>)}
        </div>
        <aside className="order-summary"><h2>Order Summary</h2><div><span>Subtotal</span><strong>{formatNaira(subtotal)}</strong></div><div><span>Delivery</span><strong>{formatNaira(delivery)}</strong></div><div className="summary-total"><span>Total</span><strong>{formatNaira(subtotal + delivery)}</strong></div><p>Checkout is completed securely through WhatsApp for confirmation and delivery coordination.</p><Link className="btn btn-dark wide" to="/checkout">Proceed to checkout</Link><Link className="continue-link" to="/products">← Continue shopping</Link></aside>
      </div>
    </section>
  );
}
