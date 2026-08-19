import { useEffect, useMemo } from 'react';
import { matchPath, useLocation } from 'react-router-dom';
import { useContent } from '../context/ContentContext';

export const SITE_URL = 'https://www.monnynatural.com';

function absoluteUrl(value, fallback = '/logo.webp') {
  const input = String(value || fallback).trim();
  if (/^https?:\/\//i.test(input)) return input;
  return `${SITE_URL}${input.startsWith('/') ? input : `/${input}`}`;
}

function cleanText(value, max = 160) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (text.length <= max) return text;
  return `${text.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}

function upsertMeta(selector, attrs) {
  let tag = document.head.querySelector(selector);
  if (!tag) {
    tag = document.createElement('meta');
    document.head.appendChild(tag);
  }
  Object.entries(attrs).forEach(([key, value]) => tag.setAttribute(key, value));
  return tag;
}

function setCanonical(href) {
  let link = document.head.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
}

function safeCategory(raw) {
  try {
    return decodeURIComponent(raw || '');
  } catch {
    return raw || '';
  }
}

export default function SeoManager() {
  const location = useLocation();
  const { products = [], categories = [], store = {}, heroSlides = [] } = useContent() || {};

  const seo = useMemo(() => {
    const path = location.pathname;
    const brand = store.brandName || 'Monny Naturals';
    const defaultDescription =
      'Shop Monny Naturals for natural skincare, haircare and body care products in Nigeria, with convenient WhatsApp ordering.';
    const defaultImage = absoluteUrl(heroSlides?.[0]?.image || '/logo.webp');

    const base = {
      title: 'Monny Naturals | Natural Skincare & Haircare in Nigeria',
      description: defaultDescription,
      canonicalPath: '/',
      robots: 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1',
      type: 'website',
      image: defaultImage,
      structuredData: [
        {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: brand,
          url: SITE_URL,
          logo: absoluteUrl('/logo.webp'),
          email: store.email || undefined,
          sameAs: [store.instagramUrl, store.tiktokUrl].filter(Boolean),
        },
        {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: brand,
          url: SITE_URL,
        },
      ],
    };

    if (path === '/') return base;

    if (path === '/products') {
      return {
        ...base,
        title: `Natural Skincare & Haircare Products | ${brand}`,
        description:
          'Browse Monny Naturals skin and hair products, including handmade soaps, shower gels, oils, shampoo, hair butter and natural hair care essentials in Nigeria.',
        canonicalPath: '/products',
        robots: location.search ? 'noindex,follow' : base.robots,
        structuredData: {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: `Natural Skincare & Haircare Products | ${brand}`,
          url: `${SITE_URL}/products`,
          description:
            'Natural skincare and haircare products from Monny Naturals in Nigeria.',
        },
      };
    }

    const categoryMatch = matchPath('/category/:category', path);
    if (categoryMatch) {
      const categoryName = safeCategory(categoryMatch.params.category);
      const knownCategory = categories.find(
        (item) => String(item?.name || '').toLowerCase() === categoryName.toLowerCase(),
      );
      const normalizedName = knownCategory?.name || categoryName;
      const encoded = encodeURIComponent(normalizedName);
      return {
        ...base,
        title: `${normalizedName} in Nigeria | ${brand}`,
        description: cleanText(
          `Shop ${normalizedName.toLowerCase()} from ${brand}. Explore natural beauty products made for everyday skin and hair care in Nigeria.`,
        ),
        canonicalPath: `/category/${encoded}`,
        image: absoluteUrl(knownCategory?.image || defaultImage),
        structuredData: [
          {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: `${normalizedName} | ${brand}`,
            url: `${SITE_URL}/category/${encoded}`,
            description: `Shop ${normalizedName.toLowerCase()} from ${brand} in Nigeria.`,
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
              { '@type': 'ListItem', position: 2, name: 'Products', item: `${SITE_URL}/products` },
              { '@type': 'ListItem', position: 3, name: normalizedName, item: `${SITE_URL}/category/${encoded}` },
            ],
          },
        ],
      };
    }

    const productMatch = matchPath('/products/:id', path);
    if (productMatch) {
      const product = products.find(
        (item) => String(item?.id) === String(productMatch.params.id),
      );
      if (!product) {
        return {
          ...base,
          title: `Product Not Found | ${brand}`,
          canonicalPath: path,
          robots: 'noindex,follow',
          structuredData: null,
        };
      }
      const canonicalPath = `/products/${encodeURIComponent(product.id)}`;
      const image = absoluteUrl(product.image || '/logo.webp');
      const stock = Number(product.stock) > 0;
      return {
        ...base,
        title: `${product.name} in Nigeria | ${brand}`,
        description: cleanText(
          `${product.description || `Shop ${product.name} from ${brand}.`} Order online in Nigeria with easy WhatsApp checkout.`,
        ),
        canonicalPath,
        type: 'product',
        image,
        structuredData: [
          {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            image: [image],
            description: cleanText(product.description, 500),
            sku: String(product.id),
            category: product.category || undefined,
            brand: {
              '@type': 'Brand',
              name: brand,
            },
            offers: {
              '@type': 'Offer',
              url: `${SITE_URL}${canonicalPath}`,
              priceCurrency: 'NGN',
              price: Number(product.price || 0).toFixed(2),
              availability: stock
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
              itemCondition: 'https://schema.org/NewCondition',
            },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
              { '@type': 'ListItem', position: 2, name: 'Products', item: `${SITE_URL}/products` },
              { '@type': 'ListItem', position: 3, name: product.name, item: `${SITE_URL}${canonicalPath}` },
            ],
          },
        ],
      };
    }

    if (path === '/about') {
      return {
        ...base,
        title: `About ${brand} | Natural Beauty Products Nigeria`,
        description:
          'Discover the Monny Naturals story and our approach to thoughtful natural skincare, haircare, soap making and everyday beauty care in Nigeria.',
        canonicalPath: '/about',
        structuredData: {
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          name: `About ${brand}`,
          url: `${SITE_URL}/about`,
        },
      };
    }

    if (path === '/contact') {
      return {
        ...base,
        title: `Contact ${brand} | Orders & Customer Care`,
        description:
          'Contact Monny Naturals for product questions, WhatsApp orders, delivery information and customer care in Nigeria.',
        canonicalPath: '/contact',
        structuredData: {
          '@context': 'https://schema.org',
          '@type': 'ContactPage',
          name: `Contact ${brand}`,
          url: `${SITE_URL}/contact`,
        },
      };
    }

    if (['/cart', '/checkout', '/admin'].includes(path)) {
      return {
        ...base,
        title: `${path === '/cart' ? 'Shopping Cart' : path === '/checkout' ? 'Checkout' : 'Admin'} | ${brand}`,
        canonicalPath: path,
        robots: 'noindex,nofollow',
        structuredData: null,
      };
    }

    return {
      ...base,
      title: `Page Not Found | ${brand}`,
      canonicalPath: path,
      robots: 'noindex,follow',
      structuredData: null,
    };
  }, [location.pathname, location.search, products, categories, store, heroSlides]);

  useEffect(() => {
    const canonical = `${SITE_URL}${seo.canonicalPath}`;
    document.title = seo.title;

    upsertMeta('meta[name="description"]', { name: 'description', content: seo.description });
    upsertMeta('meta[name="robots"]', { name: 'robots', content: seo.robots });
    upsertMeta('meta[name="googlebot"]', { name: 'googlebot', content: seo.robots });
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: seo.title });
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: seo.description });
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: seo.type });
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonical });
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: seo.image });
    upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: store.brandName || 'Monny Naturals' });
    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: seo.title });
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: seo.description });
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: seo.image });
    setCanonical(canonical);

    let script = document.head.querySelector('script#monny-seo-jsonld');
    if (seo.structuredData) {
      if (!script) {
        script = document.createElement('script');
        script.id = 'monny-seo-jsonld';
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(seo.structuredData);
    } else if (script) {
      script.remove();
    }
  }, [seo, store.brandName]);

  return null;
}
