// src/utils/generateSitemap.ts
/**
 * Sitemap Generator Utility
 * 
 * This utility generates an XML sitemap for SEO purposes.
 * To use: Run this as a build step or create an API endpoint that generates the sitemap dynamically.
 * 
 * For static generation:
 * - Run: node -r tsx src/utils/generateSitemap.ts
 * - Or add to package.json scripts: "generate-sitemap": "tsx src/utils/generateSitemap.ts"
 * 
 * For dynamic generation:
 * - Create an API route /api/sitemap.xml that calls generateSitemap()
 */

interface SitemapURL {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

const BASE_URL = 'https://www.studioform.app'; // StudioForm production URL

// Static pages
const STATIC_PAGES: SitemapURL[] = [
  { loc: '/', changefreq: 'daily', priority: 1.0 },
  { loc: '/products', changefreq: 'daily', priority: 0.9 },
  { loc: '/about', changefreq: 'monthly', priority: 0.7 },
  { loc: '/contact', changefreq: 'monthly', priority: 0.7 },
  { loc: '/shipping', changefreq: 'monthly', priority: 0.6 },
  { loc: '/faq', changefreq: 'monthly', priority: 0.6 },
  { loc: '/privacy', changefreq: 'yearly', priority: 0.4 },
  { loc: '/terms', changefreq: 'yearly', priority: 0.4 },
  { loc: '/login', changefreq: 'monthly', priority: 0.5 },
  { loc: '/register', changefreq: 'monthly', priority: 0.5 },
];

export async function fetchProducts(): Promise<{ id: string; updated_at?: string }[]> {
  try {
    // In production, this would call your actual API
    // For now, return empty array - replace with actual API call
    const response = await fetch('http://localhost:8000/products?limit=1000');
    const data = await response.json();
    return data.products || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export async function fetchCategories(): Promise<string[]> {
  try {
    // Fetch unique categories from products
    const response = await fetch('http://localhost:8000/products/categories');
    const data = await response.json();
    return data.categories || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toISOString().split('T')[0]; // YYYY-MM-DD
}

function generateURLElement(url: SitemapURL): string {
  const lastmod = url.lastmod ? `  <lastmod>${formatDate(url.lastmod)}</lastmod>\n` : '';
  const changefreq = url.changefreq ? `  <changefreq>${url.changefreq}</changefreq>\n` : '';
  const priority = url.priority !== undefined ? `  <priority>${url.priority}</priority>\n` : '';

  return `
<url>
  <loc>${BASE_URL}${url.loc}</loc>
${lastmod}${changefreq}${priority}</url>`;
}

export async function generateSitemap(): Promise<string> {
  const urls: SitemapURL[] = [...STATIC_PAGES];

  // Add product pages
  const products = await fetchProducts();
  products.forEach((product) => {
    urls.push({
      loc: `/products/${product.id}`,
      lastmod: product.updated_at || new Date().toISOString(),
      changefreq: 'weekly',
      priority: 0.8,
    });
  });

  // Add category pages
  const categories = await fetchCategories();
  categories.forEach((category) => {
    urls.push({
      loc: `/products?category=${encodeURIComponent(category)}`,
      changefreq: 'daily',
      priority: 0.7,
    });
  });

  const urlElements = urls.map(generateURLElement).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`;
}

// Note: To generate sitemap, create a backend API endpoint or build script
// Example backend endpoint: GET /api/sitemap
// Or use a build script with Node.js to run this in a Node environment

export default generateSitemap;
