import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useContent } from '../context/ContentContext';
import { formatNaira } from '../utils/format';

export default function CollectionShowcase({ section }) {
  const { products } = useContent();
  const liveProducts = products.filter((product) => product.category === section?.category);
  if (!section || !liveProducts.length) return null;

  const items = liveProducts.slice(0, Number(section.limit) || 6);
  const hasOverflowProduct = items.length > 5;

  return (
    <section className="section container catalog-showcase-section">
      <div className="catalog-showcase-head">
        <div>
          <span>{section.eyebrow}</span>
          <h2>{section.title}</h2>
          {section.text && <p>{section.text}</p>}
        </div>
        <Link to={`/category/${encodeURIComponent(section.category || '')}`}>
          Shop collection <ArrowRight size={16} />
        </Link>
      </div>

      <div
        className={`catalog-showcase-grid dynamic-products ${hasOverflowProduct ? 'has-overflow-product' : ''}`}
        tabIndex={hasOverflowProduct ? 0 : undefined}
        aria-label={hasOverflowProduct ? `${section.title}: hover or focus to reveal one more product` : section.title}
      >
        {items.map((product) => (
          <Link className="catalog-showcase-card" key={product.id} to={`/products/${product.id}`}>
            <div className="catalog-showcase-image-wrap">
              <img src={product.image} alt={product.name} loading="lazy" />
            </div>
            <div className="catalog-showcase-card-copy">
              <small>{product.category}</small>
              <strong>{product.name}</strong>
              <b>{formatNaira(product.price)}</b>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
