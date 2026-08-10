import { useState } from 'react';
import { Mail, MapPin, MessageCircle, Clock3 } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import { whatsappUrl } from '../utils/whatsapp';

export default function Contact() {
  const { store } = useContent();
  const [sent, setSent] = useState(false);
  const submit = (e) => { e.preventDefault(); setSent(true); e.currentTarget.reset(); };
  return (
    <section className="page-shell container contact-page">
      <div className="page-hero compact"><span className="eyebrow">We’d love to hear from you</span><h1>Contact {store.brandName}</h1><p>Questions about products, delivery or your order? Reach us directly or send a quick message below.</p></div>
      <div className="contact-grid">
        <div className="contact-info"><div><MessageCircle/><span><strong>WhatsApp</strong><a href={whatsappUrl(store.whatsappNumber)} target="_blank" rel="noreferrer">Chat with us</a></span></div><div><Mail/><span><strong>Email</strong><a href={`mailto:${store.email}`}>{store.email}</a></span></div><div><MapPin/><span><strong>Location</strong><small>{store.location}</small></span></div><div><Clock3/><span><strong>Customer care</strong><small>{store.customerCareHours}</small></span></div></div>
        <form className="contact-form" onSubmit={submit}><label>Name<input required/></label><label>Email<input type="email" required/></label><label>Phone<input/></label><label>Message<textarea required rows="6"/></label><button className="btn btn-dark">Send message</button>{sent && <p className="success-note">Thank you. Your message has been received.</p>}</form>
      </div>
    </section>
  );
}
