import { Heart, Eye, ShoppingCart, Star, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { formatNaira } from '../utils/format';

function getPreview(text = '', maxLength = 78) {
  const value = String(text).trim();
  if (value.length <= maxLength) return value;
  const shortened = value.slice(0, maxLength);
  const lastSpace = shortened.lastIndexOf(' ');
  return `${shortened.slice(0, lastSpace > 46 ? lastSpace : maxLength).trim()}…`;
}

export default function ProductCard({ product, onQuickView, descriptionMode = 'default' }) {
  const [wishlisted, setWishlisted] = useState(false);
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const { addToCart } = useCart();
  const inStock = Number(product.stock) > 0;
  const isDynamicDescription = descriptionMode === 'dynamic';
  const preview = getPreview(product.description);
  const hasMore = String(product.description || '').length > preview.length;

  const openDescription = () => {
    if (isDynamicDescription && hasMore) setDescriptionOpen(true);
  };

  const closeDescription = () => {
    if (isDynamicDescription) setDescriptionOpen(false);
  };

  return (
    <article
      className={`product-card ${isDynamicDescription ? 'product-card--dynamic' : ''} ${descriptionOpen ? 'description-open' : ''}`}
      onMouseEnter={openDescription}
      onMouseLeave={closeDescription}
      onFocus={openDescription}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) closeDescription();
      }}
    >
      <div className="product-media">
        <Link to={`/products/${product.id}`}>
          <img src={product.image} alt={product.name} loading="lazy" />
        </Link>
        <span className="product-badge">{product.category}</span>
        <div className="card-icons">
          <button className={wishlisted ? 'active' : ''} onClick={() => setWishlisted((v) => !v)} aria-label="Add to wishlist"><Heart size={17} fill={wishlisted ? 'currentColor' : 'none'} /></button>
          <button onClick={() => onQuickView?.(product)} aria-label="Quick view"><Eye size={17}/></button>
        </div>
      </div>

      <div className="product-info">
        <Link className="product-name" to={`/products/${product.id}`}>{product.name}</Link>

        {isDynamicDescription ? (
          <div className={`dynamic-description-wrap ${hasMore ? 'has-more' : ''}`}>
            <div className="description-stage">
              <p className="product-description product-description-preview">{preview}</p>
              <p className="product-description product-description-full">{product.description}</p>
            </div>
            {hasMore && (
              <button
                type="button"
                className="description-toggle"
                aria-expanded={descriptionOpen}
                aria-label={descriptionOpen ? 'Hide full product description' : 'Show full product description'}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setDescriptionOpen((value) => !value);
                }}
              >
                <span>{descriptionOpen ? 'Show less' : 'Hover to discover more'}</span>
                <ChevronDown size={14}/>
              </button>
            )}
          </div>
        ) : (
          <p className="product-description">{product.description}</p>
        )}

        <div className="rating-row">
          <span className="stars" aria-label={`${product.rating} out of 5 stars`}>
            {[1,2,3,4,5].map((n) => <Star key={n} size={14} fill="currentColor" />)}
          </span>
          <span>({product.reviews})</span>
        </div>
        <strong className="product-price">{formatNaira(product.price)}</strong>
        <button className="btn add-cart-btn" disabled={!inStock} onClick={() => inStock && addToCart(product)}><ShoppingCart size={17}/> {inStock ? 'Add to Cart' : 'Out of stock'}</button>
      </div>
    </article>
  );
}
