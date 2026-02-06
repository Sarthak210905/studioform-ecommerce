import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';
import { productService } from '@/services/product.service';
import { bannerService, type HeroBanner } from '@/services/banner.service';
import type { Product } from '@/types';
import SEOHead from '@/components/common/SEOHead';
import Testimonials from '@/components/common/Testimonials';
import { getWebsiteSchema, getOrganizationSchema } from '@/utils/seoSchemas';

type ProductTile = {
  id: string;
  title: string;
  price: string;
  image: string;
  href: string;
  tag?: string;
};

type ImageTile = {
  title: string;
  subtitle?: string;
  image: string;
  href: string;
  badge?: string;
};

// State-driven data

function formatPrice(p?: number) {
  if (typeof p !== 'number') return '';
  return `₹${p.toLocaleString('en-IN')}`;
}

function toProductTile(p: Product): ProductTile {
  return {
    id: p.id,
    title: p.name,
    price: formatPrice(p.final_price ?? p.price),
    image: p.main_image || p.images?.[0] || '',
    href: `/products/${p.id}`,
    tag: p.is_featured ? 'Featured' : p.tags?.[0],
  };
}

export default function Home() {
  const [newTech, setNewTech] = useState<ProductTile[]>([]);
  const [newStyle, setNewStyle] = useState<ProductTile[]>([]);
  const [essentials, setEssentials] = useState<ProductTile[]>([]);
  const [categories, setCategories] = useState<ImageTile[]>([]);
  const [collections, setCollections] = useState<ImageTile[]>([]);
  const [heroBanners, setHeroBanners] = useState<HeroBanner[]>([]);
  const [bannerLoading, setBannerLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    async function loadBanners() {
      try {
        const banners = await bannerService.getHeroBanners();
        setHeroBanners(banners);
      } catch (error) {
        console.error('Failed to load banners:', error);
      } finally {
        setBannerLoading(false);
      }
    }

    async function loadProducts() {
      setProductsLoading(true);
      try {
        const [recent, featured, top] = await Promise.all([
          productService.getProducts({ limit: 12, sort_by: 'created_at', sort_order: 'desc' }),
          productService.getFeaturedProducts(6),
          productService.getProducts({ limit: 3, sort_by: 'sales_count', sort_order: 'desc' }),
        ]);

        const products: Product[] = recent.products || [];
        const tiles = products.map(toProductTile);
        setNewTech(tiles.slice(0, 4));
        setNewStyle(tiles.slice(4, 8));
        setEssentials((featured || []).map(toProductTile).slice(0, 3));

        const topTiles: ImageTile[] = (top.products || []).map((p: Product) => ({
          title: p.name,
          subtitle: p.brand || p.category || undefined,
          image: p.main_image || p.images?.[0] || '',
          href: `/products/${p.id}`,
          badge: 'Trending',
        }));
        setCollections(topTiles);

        const categoryMap = new Map<string, Product>();
        for (const p of products) {
          if (p.category && !categoryMap.has(p.category)) {
            categoryMap.set(p.category, p);
          }
        }
        const catTiles: ImageTile[] = Array.from(categoryMap.entries()).slice(0, 4).map(([cat, p]) => ({
          title: cat,
          image: p.main_image || p.images?.[0] || '',
          href: `/products?category=${encodeURIComponent(cat)}`,
        }));
        setCategories(catTiles);
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setProductsLoading(false);
      }
    }

    loadBanners();
    loadProducts();
  }, []);

function SectionHeader({ title, link, eyebrow }: { title: string; link?: string; eyebrow?: string }) {
  return (
    <div className="flex items-center justify-between mb-3 sm:mb-4">
      <div className="space-y-0.5 sm:space-y-1">
        {eyebrow && <span className="text-[10px] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] text-muted-foreground">{eyebrow}</span>}
        <h2 className="text-lg sm:text-xl font-semibold">{title}</h2>
      </div>
      {link && (
        <Link to={link} className="text-xs sm:text-sm font-medium text-primary hover:underline flex items-center gap-1">
          <span className="hidden sm:inline">View all</span>
          <span className="sm:hidden">All</span>
          <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
        </Link>
      )}
    </div>
  );
}

function ProductRow({ items, loading }: { items: ProductTile[]; loading?: boolean }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="rounded-xl border bg-card overflow-hidden">
            <div className="aspect-square bg-muted animate-pulse" />
            <div className="p-3 space-y-2">
              <div className="h-3 w-3/4 bg-muted animate-pulse rounded" />
              <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!items.length) {
    return <p className="text-sm text-muted-foreground">No products available right now.</p>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
      {items.map((item) => (
        <Link
          key={item.id}
          to={item.href}
          className="group rounded-lg sm:rounded-xl border bg-card overflow-hidden hover:shadow-sm transition active:scale-95"
        >
          <div className="aspect-square overflow-hidden">
            <img src={item.image} alt={item.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
          </div>
          <div className="p-2 sm:p-3 space-y-0.5 sm:space-y-1">
            <div className="flex items-start justify-between gap-1 sm:gap-2">
              <p className="text-xs sm:text-sm font-medium leading-tight line-clamp-2">{item.title}</p>
              {item.tag && <Badge variant="secondary" className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 flex-shrink-0">{item.tag}</Badge>}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground font-semibold">{item.price}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

function ImageGrid({ items, columns = 'md:grid-cols-4', loading }: { items: ImageTile[]; columns?: string; loading?: boolean }) {
  if (loading) {
    return (
      <div className={`grid grid-cols-2 ${columns} gap-3`}>
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="rounded-xl border bg-card overflow-hidden">
            <div className="aspect-[4/5] bg-muted animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (!items.length) {
    return <p className="text-sm text-muted-foreground">Nothing to show here yet.</p>;
  }

  return (
    <div className={`grid grid-cols-2 ${columns} gap-2 sm:gap-3`}>
      {items.map((item) => (
        <Link
          key={item.href}
          to={item.href}
          className="group relative rounded-lg sm:rounded-xl overflow-hidden border bg-card active:scale-95 transition"
        >
          <div className="aspect-[4/5]">
            <img src={item.image} alt={item.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
          <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3 space-y-0.5 sm:space-y-1 text-white drop-shadow">
            {item.badge && <Badge variant="secondary" className="bg-white/90 text-black text-[9px] sm:text-[10px] px-1.5 py-0.5">{item.badge}</Badge>}
            <p className="text-xs sm:text-sm font-semibold line-clamp-1">{item.title}</p>
            {item.subtitle && <p className="text-[10px] sm:text-xs text-white/80 line-clamp-1">{item.subtitle}</p>}
          </div>
        </Link>
      ))}
    </div>
  );
}

  return (
    <div className="flex flex-col bg-background">
      <SEOHead
        title="Premium Desk Accessories - Transform Your Workspace"
        description="Discover premium desk accessories including leather desk mats, pen holders, organizers and more. Handcrafted quality. Free shipping above ₹1499."
        keywords="desk accessories, premium desk mat, office organizers, workspace setup, leather desk mat, pen holder"
        schema={[getWebsiteSchema(), getOrganizationSchema()]}
      />
      
      {/* Promo strip */}
      <div className="bg-black text-white text-xs sm:text-sm overflow-hidden py-2.5 px-3">
        <div className="flex items-center justify-center gap-8 animate-marquee whitespace-nowrap">
          <span className="hidden sm:inline">Prepaid Payment Only</span>
          <span>|</span>
          <span>Free Delivery on orders over ₹1,499</span>
          <span>|</span>
          <span className="hidden sm:inline">Easy Exchanges</span>
          
        </div>
      </div>

      {/* Hero banner */}
      <section className="relative overflow-hidden">
        {bannerLoading ? (
          <div className="aspect-[16/6] md:aspect-[16/5] w-full bg-muted animate-pulse" />
        ) : heroBanners.length > 0 ? (
          (() => {
            const mainBanner = heroBanners.find(b => b.position === 1) || heroBanners[0];
            return (
              <div className="aspect-[16/9] sm:aspect-[16/7] md:aspect-[16/5] w-full relative">
                <img
                  src={mainBanner.image_url}
                  alt={mainBanner.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/35 to-transparent" />
                <div className="absolute inset-0 flex items-center">
                  <div className="container px-4 sm:px-6 md:px-12 lg:px-16">
                    <div className="max-w-xl space-y-2 sm:space-y-3 md:space-y-4 text-white">
                      <Badge variant="secondary" className="bg-white/90 text-black text-xs">New collection</Badge>
                      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">{mainBanner.title}</h1>
                      <p className="text-xs sm:text-sm md:text-base text-white/85 line-clamp-2 sm:line-clamp-3">{mainBanner.description}</p>
                      <div className="flex gap-2 sm:gap-3 flex-wrap pt-2">
                        {mainBanner.cta_link && mainBanner.cta_text ? (
                          <Button asChild size="sm" className="sm:h-10 sm:px-6">
                            <Link to={mainBanner.cta_link}>{mainBanner.cta_text}</Link>
                          </Button>
                        ) : (
                          <Button asChild size="sm" className="sm:h-10 sm:px-6">
                            <Link to="/products">Shop now</Link>
                          </Button>
                        )}
                        <Button variant="secondary" asChild size="sm" className="sm:h-10 sm:px-6">
                          <Link to="/about">Learn more</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()
        ) : (
          <div className="aspect-[16/6] md:aspect-[16/5] w-full">
            <img
              src="https://images.unsplash.com/photo-1527443224154-d018e56d9d18?auto=format&fit=crop&w=1600&q=80"
              alt="Hero"
              className="h-full w-full object-cover"
            />
          </div>
        )}
      </section>

      {/* New in tech */}
      <section className="container px-3 sm:px-4 md:px-8 py-6 sm:py-8 md:py-10 space-y-3 sm:space-y-4">
        <SectionHeader title="New in Tech" link="/products" />
        <ProductRow items={newTech} loading={productsLoading} />
      </section>

      {/* Split hero */}
      <section className="container px-3 sm:px-4 md:px-8 pb-6 sm:pb-8 md:pb-10">
        {heroBanners.length > 1 ? (
          (() => {
            const pivotBanner = heroBanners.find(b => b.position === 2) || heroBanners[1];
            return (
              <div className="rounded-2xl overflow-hidden relative">
                <div className="aspect-[16/6] md:aspect-[16/5]">
                  <img
                    src={pivotBanner.image_url}
                    alt={pivotBanner.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
                <div className="absolute inset-0 flex items-center">
                  <div className="p-6 md:p-10 max-w-lg space-y-3 text-white">
                    <Badge variant="secondary" className="bg-white/90 text-black">New Drop</Badge>
                    <h2 className="text-3xl font-bold">{pivotBanner.title}</h2>
                    <p className="text-sm text-white/80">{pivotBanner.description}</p>
                    {pivotBanner.cta_link && pivotBanner.cta_text ? (
                      <Button variant="secondary" asChild>
                        <Link to={pivotBanner.cta_link}>{pivotBanner.cta_text}</Link>
                      </Button>
                    ) : (
                      <Button variant="secondary" asChild>
                        <Link to="/products">Shop collection</Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })()
        ) : (
          <div className="rounded-2xl overflow-hidden relative">
            <div className="aspect-[16/6] md:aspect-[16/5]">
              <img
                src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1600&q=80"
                alt="Pivot"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
            <div className="absolute inset-0 flex items-center">
              <div className="p-6 md:p-10 max-w-lg space-y-3 text-white">
                <Badge variant="secondary" className="bg-white/90 text-black">New Drop</Badge>
                <h2 className="text-3xl font-bold">Pivot Collection</h2>
                <p className="text-sm text-white/80">Balanced carry built for daily moves.</p>
                <Button variant="secondary" asChild>
                  <Link to="/products">Shop collection</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* New in style */}
      <section className="container px-4 md:px-8 pb-10 space-y-4">
        <SectionHeader title="New in Style" link="/products" />
        <ProductRow items={newStyle} loading={productsLoading} />
      </section>

      {/* Explore the range */}
      <section className="container px-4 md:px-8 pb-12 space-y-4">
        <SectionHeader title="Explore the range" link="/products" />
        <ImageGrid items={categories} loading={productsLoading} />
      </section>

      {/* Trending collections */}
      <section className="container px-4 md:px-8 pb-12 space-y-4">
        <SectionHeader title="Trending collections" link="/products" />
        <ImageGrid items={collections} columns="md:grid-cols-3" loading={productsLoading} />
      </section>

      {/* Essentials */}
      <section className="container px-4 md:px-8 pb-12 space-y-4">
        <SectionHeader title="Tech essentials" link="/products" />
        <ProductRow items={essentials} loading={productsLoading} />
      </section>

      {/* Gifting banner */}
      <section className="container px-4 md:px-8 pb-12">
        {heroBanners.length > 2 ? (
          (() => {
            const giftingBanner = heroBanners.find(b => b.position === 3) || heroBanners[2];
            return (
              <div className="rounded-2xl overflow-hidden relative">
                <div className="aspect-[16/6] md:aspect-[16/5]">
                  <img
                    src={giftingBanner.image_url}
                    alt={giftingBanner.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
                <div className="absolute inset-0 flex items-center">
                  <div className="p-6 md:p-10 max-w-lg space-y-3 text-white">
                    {/* <Badge variant="secondary" className="bg-white/90 text-black">Free duffle bag</Badge> */}
                    <h2 className="text-3xl font-bold">{giftingBanner.title}</h2>
                    <p className="text-sm text-white/80">{giftingBanner.description}</p>
                    {giftingBanner.cta_link && giftingBanner.cta_text ? (
                      <Button variant="secondary" asChild>
                        <Link to={giftingBanner.cta_link}>{giftingBanner.cta_text}</Link>
                      </Button>
                    ) : (
                      <Button variant="secondary" asChild>
                        <Link to="/products">Shop gifting</Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })()
        ) : (
          <div className="rounded-2xl overflow-hidden relative">
            <div className="aspect-[16/6] md:aspect-[16/5]">
              <img
                src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1600&q=80"
                alt="Gifting"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
            <div className="absolute inset-0 flex items-center">
              <div className="p-6 md:p-10 max-w-lg space-y-3 text-white">
                <Badge variant="secondary" className="bg-white/90 text-black">Free duffle bag</Badge>
                <h2 className="text-3xl font-bold">Adapters for every move</h2>
                <p className="text-sm text-white/80">Charge, connect, and gift-ready packs.</p>
                <Button variant="secondary" asChild>
                  <Link to="/products">Shop gifting</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Customer Testimonials */}
      <Testimonials />

      {/* Reviews snippet */}
      <section className="container px-4 md:px-8 pb-16">
        <div className="rounded-xl border bg-card px-6 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">Love what you see?</h3>
            <p className="text-sm text-muted-foreground">Browse our curated collection of premium desk accessories.</p>
          </div>
          <Button asChild>
            <Link to="/products">Shop now</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
