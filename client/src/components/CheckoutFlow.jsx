import { ShoppingCart, MessageCircle, BadgeCheck, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useContent } from '../context/ContentContext';

const steps = [
  ['01', ShoppingCart, 'Add to Cart'],
  ['02', MessageCircle, 'Checkout on WhatsApp'],
  ['03', BadgeCheck, 'We Confirm Your Order'],
  ['04', Truck, 'We Deliver to You']
];

export default function CheckoutFlow() {
  const { homepage } = useContent();
  return (
    <section className="container checkout-flow">
      <div className="flow-copy"><span className="eyebrow light">{homepage.checkoutEyebrow}</span><h3>{homepage.checkoutTitle}</h3><p>{homepage.checkoutText}</p></div>
      <div className="flow-steps">{steps.map(([num, Icon, label]) => <div key={num}><span>{num}</span><Icon/><small>{label}</small></div>)}</div>
      <Link className="btn flow-button" to="/checkout"><MessageCircle size={18}/> Shop now</Link>
    </section>
  );
}
