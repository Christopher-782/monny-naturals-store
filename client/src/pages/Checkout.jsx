import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useContent } from '../context/ContentContext';
import { formatNaira } from '../utils/format';
import { whatsappUrl } from '../utils/whatsapp';

export default function Checkout() {
  const { cart, getCartTotal } = useCart();
  const { store } = useContent();
  const [form, setForm] = useState({ name: '', phone: '', address: '', city: '', note: '' });
  const subtotal = getCartTotal();
  const freeThreshold = Number(store.freeShippingThreshold || 0);
  const delivery = cart.length && (!freeThreshold || subtotal < freeThreshold) ? Number(store.deliveryFee || 0) : 0;
  const total = subtotal + delivery;
  const update = (e) => setForm((current) => ({ ...current, [e.target.name]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    if (!cart.length) return;
    const orderLines = cart.map((item, index) => `${index + 1}. ${item.name} × ${item.quantity} — ${formatNaira(item.price * item.quantity)}`).join('\n');
    const message = `Hello ${store.brandName} 👋\n\nI would like to place an order.\n\nCustomer:\n${form.name}\n\nPhone:\n${form.phone}\n\nDelivery Address:\n${form.address}, ${form.city}\n\nOrder:\n${orderLines}\n\nSubtotal: ${formatNaira(subtotal)}\nDelivery: ${formatNaira(delivery)}\nTotal: ${formatNaira(total)}${form.note ? `\n\nAdditional note:\n${form.note}` : ''}\n\nPlease confirm my order and delivery details.\n\nThank you.`;
    window.open(whatsappUrl(store.whatsappNumber, message), '_blank');
  };

  if (!cart.length) return <section className="page-shell container empty-state"><h1>Your cart is empty</h1><p>Add products before starting checkout.</p><Link className="btn btn-dark" to="/products">Browse products</Link></section>;

  return (
    <section className="page-shell container checkout-page">
      <div className="page-hero compact"><span className="eyebrow">Easy checkout via WhatsApp</span><h1>Delivery Details</h1><p>Complete the form below. We’ll prepare your full order message and open WhatsApp for final confirmation.</p></div>
      <form className="checkout-layout" onSubmit={submit}>
        <div className="checkout-form-card"><h2>Customer information</h2><div className="form-grid"><label>Full Name<input name="name" value={form.name} onChange={update} required placeholder="Christopher Odion"/></label><label>Phone Number<input name="phone" value={form.phone} onChange={update} required placeholder="080XXXXXXXX"/></label><label className="full">Delivery Address<textarea name="address" value={form.address} onChange={update} required placeholder="Street address, landmark…"/></label><label>City<input name="city" value={form.city} onChange={update} required placeholder="Lagos"/></label><label className="full">Additional Order Note<textarea name="note" value={form.note} onChange={update} placeholder="Optional delivery or product note"/></label></div><div className="checkout-trust"><ShieldCheck/><span><strong>No online payment gateway.</strong><small>Your order is sent to {store.brandName} on WhatsApp for confirmation.</small></span></div></div>
        <aside className="order-summary checkout-summary"><h2>Your order</h2>{cart.map((item) => <div className="checkout-line" key={item.id}><span>{item.name} × {item.quantity}</span><strong>{formatNaira(item.price * item.quantity)}</strong></div>)}<div><span>Subtotal</span><strong>{formatNaira(subtotal)}</strong></div><div><span>Delivery</span><strong>{formatNaira(delivery)}</strong></div><div className="summary-total"><span>Total</span><strong>{formatNaira(total)}</strong></div><button className="btn btn-whatsapp wide" type="submit"><MessageCircle size={19}/> Order via WhatsApp</button></aside>
      </form>
    </section>
  );
}
