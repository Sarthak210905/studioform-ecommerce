import type { Product } from '@/types';

export const getProductSchema = (product: Product) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: product.name,
  description: product.description,
  image: product.main_image || product.images?.[0],
  brand: {
    '@type': 'Brand',
    name: product.brand || 'Premium Desk Accessories',
  },
  offers: {
    '@type': 'Offer',
    url: window.location.href,
    priceCurrency: 'INR',
    price: product.final_price,
    availability: product.is_in_stock
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock',
    seller: {
      '@type': 'Organization',
      name: 'Premium Desk Accessories',
    },
  },
});

export const getOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Premium Desk Accessories',
  url: window.location.origin,
  logo: `${window.location.origin}/logo.png`,
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Customer Service',
    email: 'contact.studioform@gmail.com',
  },
  sameAs: [
    'https://www.facebook.com/premiumdeskaccessories',
    'https://www.instagram.com/premiumdeskaccessories',
    'https://twitter.com/premiumdesk',
  ],
});

export const getBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: `${window.location.origin}${item.url}`,
  })),
});

export const getWebsiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Premium Desk Accessories',
  url: window.location.origin,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${window.location.origin}/products?search={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
});
