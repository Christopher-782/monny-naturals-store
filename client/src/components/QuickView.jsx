import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ShoppingBag, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatNaira } from '../utils/format';

export default function QuickView({ product, onClose }) {
  const { addToCart } = useCart();

  useEffect(() => {
    if (!product || typeof document === 'undefined') return undefined;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    // Keep the page behind the quick-view still while the modal is open.
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [product, onClose]);

  if (!product || typeof document === 'undefined') return null;

  const inStock = Number(product.stock) > 0;

  const modal = (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={onClose}
    >
      <div
        className="quick-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`quick-view-title-${product.id}`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label="Close quick view">
          <X />
        </button>

        <div className="quick-modal-media">
          <img src={product.image} alt={product.name} decoding="async" />
        </div>

        <div className="quick-modal-content">
          <span className="eyebrow">{product.category}</span>
          <h2 id={`quick-view-title-${product.id}`}>{product.name}</h2>
          <div className="rating-row">
            <span className="stars">
              {[1, 2, 3, 4, 5].map((n) => <Star key={n} size={15} fill="currentColor" />)}
            </span>
            <span>({product.reviews} reviews)</span>
          </div>
          <strong className="quick-price">{formatNaira(product.price)}</strong>
          <p>{product.description}</p>
          <p className="stock-note">{inStock ? `${product.stock} in stock` : 'Out of stock'}</p>
          <div className="quick-actions">
            <button
              className="btn btn-dark"
              disabled={!inStock}
              onClick={() => inStock && addToCart(product)}
            >
              <ShoppingBag size={17} /> {inStock ? 'Add to cart' : 'Out of stock'}
            </button>
            <Link className="btn btn-outline" to={`/products/${product.id}`} onClick={onClose}>
              View details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  // Render directly under <body>, outside the animated <main>. This keeps the
  // quick-view centered in the CURRENT viewport no matter how far down the
  // shopper has scrolled.
  return createPortal(modal, document.body);
}
