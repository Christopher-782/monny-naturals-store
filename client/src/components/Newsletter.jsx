import { useState } from 'react';
import { useContent } from '../context/ContentContext';

export default function Newsletter() {
  const { homepage } = useContent();
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const submit = (e) => { e.preventDefault(); if (email.trim()) { setDone(true); setEmail(''); } };
  return (
    <section className="newsletter"><div><span className="eyebrow">{homepage.newsletterEyebrow}</span><p>{homepage.newsletterText}</p></div><form onSubmit={submit}><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email"/><button className="btn btn-dark">Subscribe</button></form>{done && <small>Thank you — you're on the glow list.</small>}</section>
  );
}
