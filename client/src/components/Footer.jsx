import { Link } from 'react-router-dom';
import { Instagram, Facebook, Music2, Mail, MapPin, Phone, MessageCircle } from 'lucide-react';
import Logo from './Logo';
import { useContent } from '../context/ContentContext';
import { whatsappUrl } from '../utils/whatsapp';

export default function Footer() {
  const { store } = useContent();
  const whatsapp = whatsappUrl(store.whatsappNumber);
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Logo compact />
          <p>{store.tagline}</p>
          <div className="social-row"><Facebook size={18}/><Instagram size={18}/><Music2 size={18}/><MessageCircle size={18}/></div>
        </div>
        <div><h4>Quick Links</h4><Link to="/">Home</Link><Link to="/products">Products</Link><Link to="/about">About Us</Link><Link to="/contact">Contact Us</Link><span>Track Order</span><span>FAQ</span></div>
        <div><h4>Customer Care</h4><span>Shipping & Delivery</span><span>Returns & Refunds</span><span>Terms & Conditions</span><span>Privacy Policy</span></div>
        <div><h4>Contact Us</h4><a href={whatsapp} target="_blank" rel="noreferrer"><Phone size={15}/> WhatsApp</a><a href={`mailto:${store.email}`}><Mail size={15}/> {store.email}</a><span><MapPin size={15}/> {store.location}</span></div>
      </div>
      <div className="container copyright">© {new Date().getFullYear()} {store.brandName}. All Rights Reserved. <span>Secure checkout • WhatsApp confirmation</span></div>
    </footer>
  );
}
