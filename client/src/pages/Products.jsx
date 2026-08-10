import { useEffect, useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import QuickView from '../components/QuickView';
import { useContent } from '../context/ContentContext';

export default function Products() {
  const { products, categories, store } = useContent();
  const { category } = useParams();
  const location = useLocation();
  const urlQuery = new URLSearchParams(location.search).get('q') || '';
  const catalogMax = Math.max(10000, Math.ceil(Math.max(0, ...products.map((p) => Number(p.price) || 0)) / 5000) * 5000);
  const [query, setQuery] = useState(urlQuery);
  const [selectedCategory, setSelectedCategory] = useState(category ? decodeURIComponent(category) : 'All');
  const [maxPrice, setMaxPrice] = useState(catalogMax);
  const [rating, setRating] = useState(0);
  const [availability, setAvailability] = useState('all');
  const [sort, setSort] = useState('featured');
  const [quick, setQuick] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => setQuery(urlQuery), [urlQuery]);
  useEffect(() => setSelectedCategory(category ? decodeURIComponent(category) : 'All'), [category]);
  useEffect(() => setMaxPrice((current) => Math.max(Number(current), catalogMax)), [catalogMax]);

  const filtered = useMemo(() => {
    const output = products.filter((p) => {
      const q = query.toLowerCase().trim();
      const searchMatch = !q || [p.name, p.category, p.description].some((value) => String(value || '').toLowerCase().includes(q));
      const catMatch = selectedCategory === 'All' || p.category === selectedCategory;
      const priceMatch = Number(p.price) <= Number(maxPrice);
      const ratingMatch = Number(p.rating) >= Number(rating);
      const stockMatch = availability === 'all' || (availability === 'in' ? Number(p.stock) > 0 : Number(p.stock) <= 0);
      return searchMatch && catMatch && priceMatch && ratingMatch && stockMatch;
    });

    const sorters = {
      featured: (a, b) => Number(b.featured) - Number(a.featured),
      low: (a, b) => Number(a.price) - Number(b.price),
      high: (a, b) => Number(b.price) - Number(a.price),
      newest: (a, b) => Number(b.newest) - Number(a.newest),
      best: (a, b) => Number(b.bestSelling) - Number(a.bestSelling)
    };
    return [...output].sort(sorters[sort]);
  }, [products, query, selectedCategory, maxPrice, rating, availability, sort]);

  return (
    <section className="page-shell container">
      <div className="page-hero compact"><span className="eyebrow">Natural beauty, curated for you</span><h1>Shop {store.brandName}</h1><p>Browse our focused collection of skin products and hair products, all in one place.</p></div>
      <div className="catalog-toolbar">
        <label className="catalog-search"><Search size={18}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products…"/></label>
        <button className="btn btn-outline filter-toggle" onClick={() => setFiltersOpen(true)}><SlidersHorizontal size={17}/> Filters</button>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="featured">Featured</option><option value="low">Price: Low to High</option><option value="high">Price: High to Low</option><option value="newest">Newest</option><option value="best">Best Selling</option>
        </select>
      </div>

      <div className="catalog-layout">
        <aside className={`filters ${filtersOpen ? 'open' : ''}`}>
          <button className="icon-btn close-filters" onClick={() => setFiltersOpen(false)}><X/></button>
          <h3>Filters</h3>
          <label>Category<select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}><option>All</option>{categories.map((c) => <option key={c.name}>{c.name}</option>)}</select></label>
          <label>Maximum price <strong>₦{Number(maxPrice).toLocaleString()}</strong><input type="range" min="0" max={catalogMax} step="1000" value={Math.min(Number(maxPrice), catalogMax)} onChange={(e) => setMaxPrice(e.target.value)}/></label>
          <label>Minimum rating<select value={rating} onChange={(e) => setRating(e.target.value)}><option value="0">Any rating</option><option value="4">4★ and up</option><option value="4.5">4.5★ and up</option><option value="5">5★ only</option></select></label>
          <label>Availability<select value={availability} onChange={(e) => setAvailability(e.target.value)}><option value="all">All</option><option value="in">In stock</option><option value="out">Out of stock</option></select></label>
          <button className="btn btn-dark" onClick={() => setFiltersOpen(false)}>Apply filters</button>
        </aside>
        {filtersOpen && <button className="filter-backdrop" onClick={() => setFiltersOpen(false)} />}
        <div className="catalog-results">
          <div className="results-meta"><span>{filtered.length} product{filtered.length === 1 ? '' : 's'}</span>{selectedCategory !== 'All' && <button onClick={() => setSelectedCategory('All')}>Clear category ×</button>}</div>
          {filtered.length ? <div className="product-grid catalog-grid">{filtered.map((product) => <ProductCard key={product.id} product={product} onQuickView={setQuick}/>)}</div> : <div className="empty-state"><h2>No products found</h2><p>Try a different search or adjust your filters.</p></div>}
        </div>
      </div>
      <QuickView product={quick} onClose={() => setQuick(null)} />
    </section>
  );
}
