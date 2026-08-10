import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { products as fallbackProducts, categories as fallbackCategories, heroSlides as fallbackHeroSlides } from '../data/products';

const defaultStore = {
  brandName: 'Monny Naturals',
  tagline: 'Natural beauty. Real results.',
  whatsappNumber: '08067823352',
  deliveryFee: 3000,
  freeShippingThreshold: 30000,
  email: 'hello@monnynaturals.com',
  location: 'Lagos, Nigeria',
  customerCareHours: 'Monday – Saturday, 9am – 6pm',
  announcementText: '🌿 FREE SHIPPING ON ALL ORDERS ABOVE ₦30,000'
};

const defaultHomepage = {
  philosophyImage: '/uploads/about/monny-about.webp',
  philosophyPersonImage: '/uploads/about/monny-about.webp',
  categoryEyebrow: 'Shop products',
  categoryTitle: 'Skin & Hair Essentials',
  featuredEyebrow: 'Customer favourites',
  featuredTitle: 'Best Sellers, Naturally Loved',
  philosophyEyebrow: 'Why choose Monny Naturals?',
  philosophyTitle: "Beauty that's natural, sustainable & empowering.",
  philosophyText: 'We believe true beauty comes from nature. Our products are carefully crafted with the finest natural ingredients to nourish your skin, uplift your spirit and empower your natural glow every day.',
  philosophyPoints: [
    { title: 'Natural Ingredients', text: 'Sourced from the best of nature.' },
    { title: 'Sustainable Beauty', text: 'Good for you, good for the planet.' },
    { title: 'Empowering You', text: 'Because every woman deserves to glow.' }
  ],
  testimonialsEyebrow: 'Loved by our community',
  testimonialsTitle: 'Real glow stories',
  checkoutEyebrow: 'Easy checkout via WhatsApp',
  checkoutTitle: 'Add products to your cart and checkout.',
  checkoutText: 'Your order will be sent directly to us on WhatsApp for confirmation.',
  newsletterEyebrow: 'Stay glowing',
  newsletterText: 'Subscribe to get updates on new products, exclusive offers and natural beauty tips.',
  heroRotationSeconds: 2
};

const fallbackBenefits = [
  { title: '100% Natural', text: 'Made with natural ingredients' },
  { title: 'Clean & Safe', text: 'No harmful chemicals, parabens or toxins' },
  { title: 'Sustainable', text: 'Eco-friendly packaging and practices' },
  { title: 'Cruelty Free', text: "We don't test on animals, ever" }
];

const fallbackTestimonials = [
  { id: 1, name: 'Amaka T.', text: 'Monny Naturals changed my skin completely! My face has never felt this healthy and glowing before.', rating: 5 },
  { id: 2, name: 'Blessing K.', text: 'I love that the products feel natural and actually work. The packaging is beautiful and eco-friendly too!', rating: 5 },
  { id: 3, name: 'Funmi A.', text: 'Fast delivery, amazing products and top-notch customer service. I am a customer for life!', rating: 5 }
];



const fallbackCatalogSections = [
  {
    id: 'skin-products',
    eyebrow: 'Shop products',
    title: 'Skin Products',
    text: 'Discover Monny Naturals skin essentials, from brightening soaps and nourishing shower gels to glow-boosting oils.',
    category: 'Skin Products',
    items: [
      { id: 'skin-01', name: 'OatHoney Soap', image: '/uploads/catalog/oatmeal-soap.webp' },
      { id: 'skin-02', name: 'Carrot Turmeric Soap', image: '/uploads/catalog/carrot-turmeric-soap.webp' },
      { id: 'skin-03', name: 'Beetroot Soap', image: '/uploads/catalog/beetroot-soap.webp' },
      { id: 'skin-04', name: 'Moringa Soap', image: '/uploads/catalog/moringa-soap.webp' },
      { id: 'skin-05', name: 'Whitening Shower Gel', image: '/uploads/catalog/whitening-shower-gel.webp' },
      { id: 'skin-06', name: 'Glow Shower Gel', image: '/uploads/catalog/glow-shower-gel.webp' },
      { id: 'skin-07', name: 'Skin Brightening Oil', image: '/uploads/catalog/skin-brightening-oil.webp' }
    ]
  },
  {
    id: 'hair-products',
    eyebrow: 'Shop products',
    title: 'Hair Products',
    text: 'Build a complete Monny Naturals hair routine with shampoos, oils, butter and daily moisture essentials.',
    category: 'Hair Products',
    items: [
      { id: 'hair-01', name: 'Premium Hair Shampoo', image: '/uploads/catalog/hair-shampoo.webp' },
      { id: 'hair-02', name: 'Coconut Oil', image: '/uploads/catalog/pure-coconut-oil.webp' },
      { id: 'hair-03', name: 'Herbal Hair Growth Oil', image: '/uploads/catalog/herbal-growth-oil-1.webp' },
      { id: 'hair-04', name: 'Hair Butter', image: '/uploads/catalog/hair-butter.webp' },
      { id: 'hair-05', name: 'Black Soap Shampoo', image: '/uploads/catalog/hair-shampoo.webp' }
    ]
  }
];

const defaultTheme = {
  forest: '#234d1f',
  green: '#6fad2d',
  cream: '#fbfbe9',
  beige: '#edf5cf',
  gold: '#e2d326',
  text: '#17301a',
  pageBackground: '#fcfef3'
};

const fallbackContent = {
  products: fallbackProducts,
  categories: fallbackCategories,
  heroSlides: fallbackHeroSlides,
  store: defaultStore,
  homepage: defaultHomepage,
  testimonials: fallbackTestimonials,
  benefits: fallbackBenefits,
  catalogSections: fallbackCatalogSections,
  theme: defaultTheme
};

const ContentContext = createContext(null);

function normalizeContent(next = {}) {
  return {
    ...fallbackContent,
    ...next,
    products: Array.isArray(next.products) ? next.products : fallbackContent.products,
    categories: Array.isArray(next.categories) ? next.categories : fallbackContent.categories,
    heroSlides: Array.isArray(next.heroSlides) ? next.heroSlides : fallbackContent.heroSlides,
    testimonials: Array.isArray(next.testimonials) ? next.testimonials : fallbackContent.testimonials,
    benefits: Array.isArray(next.benefits) ? next.benefits : fallbackContent.benefits,
    catalogSections: Array.isArray(next.catalogSections) ? next.catalogSections : fallbackContent.catalogSections,
    theme: { ...defaultTheme, ...(next.theme || {}) },
    store: { ...defaultStore, ...(next.store || {}) },
    homepage: {
      ...defaultHomepage,
      ...(next.homepage || {}),
      philosophyPoints: Array.isArray(next.homepage?.philosophyPoints)
        ? next.homepage.philosophyPoints
        : defaultHomepage.philosophyPoints
    }
  };
}

export function ContentProvider({ children }) {
  const [content, setContent] = useState(fallbackContent);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const theme = content.theme || defaultTheme;
    const root = document.documentElement;
    root.style.setProperty('--forest', theme.forest || defaultTheme.forest);
    root.style.setProperty('--green', theme.green || defaultTheme.green);
    root.style.setProperty('--cream', theme.cream || defaultTheme.cream);
    root.style.setProperty('--beige', theme.beige || defaultTheme.beige);
    root.style.setProperty('--gold', theme.gold || defaultTheme.gold);
    root.style.setProperty('--text', theme.text || defaultTheme.text);
    root.style.setProperty('--page-bg', theme.pageBackground || defaultTheme.pageBackground);
  }, [content.theme]);

  const refreshContent = async () => {
    try {
      const response = await fetch('/api/content', { cache: 'no-store' });
      if (!response.ok) throw new Error('Could not load content');
      const next = await response.json();
      setContent(normalizeContent(next));
    } catch (error) {
      console.warn('Using bundled fallback content:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshContent();
  }, []);

  const value = useMemo(() => ({
    content,
    products: content.products || [],
    categories: content.categories || [],
    heroSlides: content.heroSlides || [],
    homepage: content.homepage || defaultHomepage,
    testimonials: content.testimonials || fallbackTestimonials,
    benefits: content.benefits || fallbackBenefits,
    catalogSections: content.catalogSections || fallbackCatalogSections,
    store: content.store || defaultStore,
    theme: content.theme || defaultTheme,
    loading,
    refreshContent
  }), [content, loading]);

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  const context = useContext(ContentContext);
  if (!context) throw new Error('useContent must be used inside ContentProvider');
  return context;
}
