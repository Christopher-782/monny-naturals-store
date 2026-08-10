import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Heart, Minus, Plus, ShoppingBag, Star, MessageCircle } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import ProductCard from '../components/ProductCard';
import QuickView from '../components/QuickView';
import { useCart } from '../context/CartContext';
import { formatNaira } from '../utils/format';
import { whatsappUrl } from '../utils/whatsapp';

export default function ProductDetails() {
  const { products, store } = useContent();
  const { id } = useParams();
  const product = products.find((p) => String(p.id) === String(id));
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [quick, setQuick] = useState(null);
  const { addToCart } = useCart();
  const related = useMemo(() => products.filter((p) => p.category === product?.category && p.id !== product?.id).slice(0, 4), [products, product]);

  if (!product) return <div className="page-shell container empty-state"><h1>Product not found</h1><Link className="btn btn-dark" to="/products">Back to products</Link></div>;

  const stock = Math.max(0, Number(product.stock) || 0);
  const buyNow = () => {
    const message = `Hello ${store.brandName} 👋\n\nI would like to order ${product.name} × ${quantity} — ${formatNaira(product.price * quantity)}.\n\nPlease confirm availability and delivery details. Thank you.`;
    window.open(whatsappUrl(store.whatsappNumber, message), '_blank');
  };

  return (
    <section className="page-shell container product-detail-page">
      <div className="breadcrumbs"><Link to="/">Home</Link><span>/</span><Link to="/products">Products</Link><span>/</span><span>{product.name}</span></div>
      <div className="product-detail-grid">
        <div className="detail-gallery"><div className="main-image"><img src={product.image} alt={product.name}/></div><div className="thumb-row">{[product.image, product.image, product.image].map((image, i) => <button key={i}><img src={image} alt=""/></button>)}</div></div>
        <div className="detail-copy">
          <span className="eyebrow">{product.category}</span><h1>{product.name}</h1>
          <div className="rating-row"><span className="stars">{[1,2,3,4,5].map((n) => <Star key={n} size={16} fill="currentColor"/>)}</span><span>{product.rating} ({product.reviews} reviews)</span></div>
          <strong className="detail-price">{formatNaira(product.price)}</strong><p className="detail-desc">{product.description}</p>
          <div className="detail-facts"><div><strong>Ingredients</strong><p>{product.ingredients}</p></div><div><strong>Benefits</strong><p>{product.benefits}</p></div><div><strong>How to use</strong><p>{product.usage}</p></div></div>
          <div className="quantity-row"><span>Quantity</span><div className="quantity"><button disabled={!stock} onClick={() => setQuantity((q) => Math.max(1, q - 1))}><Minus/></button><b>{quantity}</b><button disabled={!stock} onClick={() => setQuantity((q) => Math.min(stock, q + 1))}><Plus/></button></div><small>{stock ? `${stock} in stock` : 'Out of stock'}</small></div>
          <div className="detail-actions"><button className="btn btn-dark" disabled={!stock} onClick={() => addToCart(product, quantity)}><ShoppingBag size={18}/> {stock ? 'Add to cart' : 'Out of stock'}</button><button className="btn btn-gold" disabled={!stock} onClick={buyNow}><MessageCircle size={18}/> Buy now</button><button className={`wishlist-big ${wishlisted ? 'active' : ''}`} onClick={() => setWishlisted((v) => !v)}><Heart fill={wishlisted ? 'currentColor' : 'none'}/></button></div>
        </div>
      </div>
      {!!related.length && <section className="section related-products"><div className="section-heading inline"><div><span>You may also like</span><h2>Related products</h2></div></div><div className="product-grid">{related.map((p) => <ProductCard key={p.id} product={p} onQuickView={setQuick}/>)}</div></section>}
      <QuickView product={quick} onClose={() => setQuick(null)} />
    </section>
  );
}
