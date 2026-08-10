import { Leaf, Heart, Recycle, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useContent } from '../context/ContentContext';

export default function About() {
  const { store, homepage } = useContent();
  return (
    <section className="about-page">
      <div className="about-hero"><div className="container"><span className="eyebrow light">About {store.brandName}</span><h1>Beauty that begins with nature.</h1><p>We create warm, thoughtful beauty rituals designed to help you care for your skin and hair with confidence.</p></div></div>
      <div className="container about-story"><img src={homepage.philosophyImage} alt="Monny Naturals beauty ritual" loading="lazy" decoding="async"/><div><span className="eyebrow">Our philosophy</span><h2>{store.tagline}</h2><p>{store.brandName} brings together botanical inspiration, elegant everyday rituals and a calm premium experience. Our approach is simple: create products people enjoy using, make shopping effortless, and keep every touchpoint warm and trustworthy.</p><p>From skincare and body care to gifting sets, the collection is designed around everyday care, beautiful textures and a grounded sense of self-care.</p><Link to="/products" className="btn btn-dark">Explore the collection</Link></div></div>
      <div className="container values-grid">{[[Leaf,'Natural Ingredients','Nature-inspired formulas and carefully selected ingredients.'],[Recycle,'Sustainable Beauty','Thoughtful choices designed with people and the planet in mind.'],[Heart,'Cruelty Free','Compassion is part of the standard, never an afterthought.'],[Sparkles,'Empowering You','Beauty care that supports confidence and your natural glow.']].map(([Icon,title,text]) => <div key={title}><Icon/><h3>{title}</h3><p>{text}</p></div>)}</div>
    </section>
  );
}
