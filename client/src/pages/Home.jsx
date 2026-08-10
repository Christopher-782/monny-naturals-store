import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Recycle, UserRound, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import Hero from '../components/Hero';
import Benefits from '../components/Benefits';
import ProductCard from '../components/ProductCard';
import QuickView from '../components/QuickView';
import CheckoutFlow from '../components/CheckoutFlow';
import CollectionShowcase from '../components/CollectionShowcase';
import Newsletter from '../components/Newsletter';
import { useContent } from '../context/ContentContext';

const pointIcons = [Leaf, Recycle, UserRound];

export default function Home() {
  const { categories, products, homepage, testimonials, catalogSections } = useContent();
  const [quick, setQuick] = useState(null);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const bestSellers = products.filter((p) => p.bestSelling).sort((a, b) => (Number(b.reviews) || 0) - (Number(a.reviews) || 0)).slice(0, 6);
  const featured = bestSellers.length ? bestSellers : products.filter((p) => p.featured).slice(0, 6);
  const categoryCount = (name) => products.filter((p) => p.category === name).length;

  return (
    <>
      <Hero />
      <Benefits />

      <section className="section container category-section">
        <div className="section-heading centered"><span>{homepage.categoryEyebrow}</span><h2>{homepage.categoryTitle}</h2></div>
        <div className="category-grid">
          {categories.map((category) => (
            <Link className="category-card" key={category.name} to={`/category/${encodeURIComponent(category.name)}`}>
              <img src={category.image} alt={category.name}/>
              <div><strong>{category.name}</strong><small>{categoryCount(category.name)} products</small><span>Shop now →</span></div>
            </Link>
          ))}
        </div>
      </section>

      {(catalogSections || []).map((section) => (
        <CollectionShowcase key={section.id || section.title} section={section} />
      ))}

      <section className="section container products-section">
        <div className="section-heading inline"><div><span>{homepage.featuredEyebrow}</span><h2>{homepage.featuredTitle}</h2></div><Link to="/products">View all products →</Link></div>
        {featured.length ? <div className="product-grid home-grid">{featured.map((product) => <ProductCard key={product.id} product={product} onQuickView={setQuick} descriptionMode="dynamic"/>)}</div> : <div className="empty-state"><p>No featured products have been selected yet.</p></div>}
      </section>

      <section className="philosophy-section">
        <div className="philosophy-image"><img src={homepage.philosophyImage} alt="Botanical natural skincare"/></div>
        <div className="philosophy-copy">
          <span className="eyebrow">{homepage.philosophyEyebrow}</span>
          <h2>{homepage.philosophyTitle}</h2>
          <p>{homepage.philosophyText}</p>
          <Link className="btn btn-dark" to="/about">Learn more about us →</Link>
          <div className="philosophy-points">
            {(homepage.philosophyPoints || []).slice(0, 3).map((point, index) => {
              const Icon = pointIcons[index] || Leaf;
              return <div key={`${point.title}-${index}`}><Icon/><span><strong>{point.title}</strong><small>{point.text}</small></span></div>;
            })}
          </div>
        </div>
        <div className="philosophy-person"><img src={homepage.philosophyPersonImage} alt="Woman enjoying a natural skincare ritual"/></div>
      </section>

      {!!testimonials.length && <section className="section testimonials container">
        <div className="section-heading centered"><span>{homepage.testimonialsEyebrow}</span><h2>{homepage.testimonialsTitle}</h2></div>
        <div className="testimonial-controls mobile-only-flex"><button onClick={() => setTestimonialIndex((testimonialIndex + testimonials.length - 1) % testimonials.length)}><ChevronLeft/></button><button onClick={() => setTestimonialIndex((testimonialIndex + 1) % testimonials.length)}><ChevronRight/></button></div>
        <div className="testimonial-grid">
          {testimonials.map((item, i) => <article key={item.id || item.name} className={`testimonial-card ${i === testimonialIndex ? 'mobile-active' : ''}`}><Quote/><p>{item.text}</p><div className="testimonial-person"><div className="avatar">{item.name?.[0] || 'M'}</div><span><strong>— {item.name}</strong><small>{'★'.repeat(Math.max(1, Math.min(5, Number(item.rating) || 5)))}</small></span></div></article>)}
        </div>
      </section>}

      <CheckoutFlow />
      <div className="container"><Newsletter /></div>
      <QuickView product={quick} onClose={() => setQuick(null)} />
    </>
  );
}
