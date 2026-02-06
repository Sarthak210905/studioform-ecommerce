import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Sparkles, Star, Zap, Shield, Swords, Wand2 } from 'lucide-react';
import { productService } from '@/services/product.service';
import type { Product } from '@/types';
import SEOHead from '@/components/common/SEOHead';
import LazyImage from '@/components/common/LazyImage';

// Collection metadata
const COLLECTION_DATA: Record<string, {
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  accent: string;
  bgPattern: string;
}> = {
  'Harry Potter Edition': {
    title: 'Harry Potter',
    subtitle: 'Wizarding World Desk Accessories',
    description: 'Transform your workspace into the Hogwarts common room. From Marauder\'s Map desk mats to Golden Snitch chargers — mischief managed.',
    icon: Wand2,
    gradient: 'from-amber-900 via-amber-800 to-yellow-900',
    accent: 'bg-amber-500',
    bgPattern: 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))]',
  },
  'Marvel Edition': {
    title: 'Marvel',
    subtitle: 'Assemble Your Desk Setup',
    description: 'Channel the power of Earth\'s mightiest heroes. Iron Man tech, Vibranium elegance, and web-slinging organization — your desk, assembled.',
    icon: Shield,
    gradient: 'from-red-900 via-red-800 to-red-950',
    accent: 'bg-red-500',
    bgPattern: 'bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))]',
  },
  'DC Edition': {
    title: 'DC Comics',
    subtitle: 'The Hero Your Desk Deserves',
    description: 'From the Batcave to the Fortress of Solitude — premium desk accessories inspired by DC\'s legendary heroes.',
    icon: Zap,
    gradient: 'from-blue-900 via-blue-800 to-indigo-950',
    accent: 'bg-blue-500',
    bgPattern: 'bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))]',
  },
  'Star Wars Edition': {
    title: 'Star Wars',
    subtitle: 'In a Galaxy Far, Far Away... On Your Desk',
    description: 'Lightsaber light bars, Millennium Falcon blueprints, and Sith Lord pen holders. The Force is strong with this collection.',
    icon: Star,
    gradient: 'from-gray-900 via-gray-800 to-yellow-950',
    accent: 'bg-yellow-500',
    bgPattern: 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))]',
  },
  'Anime Edition': {
    title: 'Anime',
    subtitle: 'Power Up Your Workspace',
    description: 'From Hidden Leaf Village to the Grand Line — Naruto, Dragon Ball Z, One Piece & Attack on Titan inspired accessories. Plus Ultra!',
    icon: Swords,
    gradient: 'from-orange-900 via-orange-800 to-red-950',
    accent: 'bg-orange-500',
    bgPattern: 'bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))]',
  },
};

const ALL_COLLECTIONS = Object.keys(COLLECTION_DATA);

export default function SpecialEditions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCollection = searchParams.get('collection') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [collections, setCollections] = useState<string[]>([]);

  // Load available collections
  useEffect(() => {
    async function loadCollections() {
      try {
        const data = await productService.getCollections();
        setCollections(data.length > 0 ? data : ALL_COLLECTIONS);
      } catch {
        setCollections(ALL_COLLECTIONS);
      }
    }
    loadCollections();
  }, []);

  // Load products for the selected collection (or all special editions)
  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const params: Record<string, unknown> = {
          limit: 50,
          sort_by: 'created_at',
          sort_order: 'desc',
        };
        if (activeCollection) {
          params.tag = activeCollection;
        } else {
          params.tag = 'Special Edition';
        }
        const data = await productService.getProducts(params as Parameters<typeof productService.getProducts>[0]);
        setProducts(data.products || []);
      } catch (error) {
        console.error('Failed to load special edition products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [activeCollection]);

  const handleCollectionChange = (collection: string) => {
    if (collection === activeCollection) {
      searchParams.delete('collection');
    } else {
      searchParams.set('collection', collection);
    }
    setSearchParams(searchParams);
  };

  const currentMeta = activeCollection && COLLECTION_DATA[activeCollection]
    ? COLLECTION_DATA[activeCollection]
    : null;

  return (
    <div className="flex flex-col bg-background min-h-screen">
      <SEOHead
        title={currentMeta ? `${currentMeta.title} Special Edition - Premium Desk Accessories` : 'Special Editions - Premium Desk Accessories'}
        description={currentMeta?.description || 'Discover limited edition desk accessories inspired by Harry Potter, Marvel, DC Comics, Star Wars, and popular Anime series.'}
        keywords="special edition, harry potter desk, marvel desk accessories, dc comics, star wars desk, anime desk accessories, limited edition"
      />

      {/* Hero Section */}
      <section className={`relative overflow-hidden ${currentMeta ? `bg-gradient-to-br ${currentMeta.gradient}` : 'bg-gradient-to-br from-purple-950 via-indigo-900 to-slate-900'} text-white`}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnYtNGgtNHYyaC00di0ySDIwdjRoMnY0aC0ydjRoNHYtMmg0djJoNHYtNGgtMnYtNHptMC0xMGgtMlYyMGgydi00aC00djJoLTR2LTJIMjB2NGgydjRoLTJ2NGg0di0yaDR2Mmg0di00aC0ydi00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        </div>
        <div className="container px-4 sm:px-6 md:px-8 py-10 sm:py-14 md:py-20 relative z-10">
          <div className="max-w-3xl space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                <Sparkles className="h-3 w-3 mr-1" />
                Limited Edition
              </Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              {currentMeta ? (
                <>
                  {currentMeta.title}
                  <span className="block text-white/70 text-xl sm:text-2xl md:text-3xl mt-1">
                    {currentMeta.subtitle}
                  </span>
                </>
              ) : (
                <>
                  Special Edition
                  <span className="block text-white/70 text-xl sm:text-2xl md:text-3xl mt-1">
                    Premium Fan Collections
                  </span>
                </>
              )}
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-white/80 max-w-2xl">
              {currentMeta?.description || 'Discover premium desk accessories inspired by your favorite universes. Handcrafted quality meets fandom — from Hogwarts to Wakanda, from a galaxy far away to the Grand Line.'}
            </p>
          </div>
        </div>
      </section>

      {/* Collection Tabs */}
      <section className="sticky top-14 sm:top-16 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container px-3 sm:px-4 md:px-8">
          <div className="flex gap-1.5 sm:gap-2 overflow-x-auto py-3 scrollbar-hide">
            <Button
              variant={!activeCollection ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCollectionChange('')}
              className="flex-shrink-0 text-xs sm:text-sm"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1" />
              All Editions
            </Button>
            {(collections.length > 0 ? collections : ALL_COLLECTIONS).map((col) => {
              const meta = COLLECTION_DATA[col];
              if (!meta) return null;
              const Icon = meta.icon;
              return (
                <Button
                  key={col}
                  variant={activeCollection === col ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleCollectionChange(col)}
                  className="flex-shrink-0 text-xs sm:text-sm"
                >
                  <Icon className="h-3.5 w-3.5 mr-1" />
                  {meta.title}
                </Button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Collection Cards (when no specific collection selected) */}
      {!activeCollection && !loading && (
        <section className="container px-3 sm:px-4 md:px-8 py-6 sm:py-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Browse Collections</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {ALL_COLLECTIONS.map((col) => {
              const meta = COLLECTION_DATA[col];
              const Icon = meta.icon;
              const colProducts = products.filter(p => p.tags?.includes(col));
              return (
                <button
                  key={col}
                  onClick={() => handleCollectionChange(col)}
                  className={`group relative rounded-xl overflow-hidden bg-gradient-to-br ${meta.gradient} text-white p-5 sm:p-6 text-left hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]`}
                >
                  <div className="absolute top-3 right-3 opacity-20 group-hover:opacity-30 transition-opacity">
                    <Icon className="h-16 w-16" />
                  </div>
                  <div className="relative z-10 space-y-2">
                    <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${meta.accent} text-white`}>
                      <Icon className="h-3 w-3" />
                      {colProducts.length} Products
                    </div>
                    <h3 className="text-xl font-bold">{meta.title}</h3>
                    <p className="text-sm text-white/70">{meta.subtitle}</p>
                    <div className="flex items-center gap-1 text-xs text-white/60 pt-1">
                      Explore collection <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Products Grid */}
      <section className="container px-3 sm:px-4 md:px-8 py-4 sm:py-6 pb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-semibold">
            {activeCollection ? COLLECTION_DATA[activeCollection]?.title || activeCollection : 'All Special Editions'}
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({products.length} {products.length === 1 ? 'product' : 'products'})
            </span>
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="rounded-xl border bg-card overflow-hidden">
                <div className="aspect-square bg-muted animate-pulse" />
                <div className="p-3 space-y-2">
                  <div className="h-3 w-3/4 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-1/3 bg-muted animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <Sparkles className="h-12 w-12 mx-auto text-muted-foreground/40" />
            <h3 className="text-lg font-semibold">No special editions available yet</h3>
            <p className="text-sm text-muted-foreground">Check back soon — new collections are dropping!</p>
            <Button asChild variant="outline">
              <Link to="/products">Browse All Products</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
            {products.map((product) => {
              const collectionTag = product.tags?.find(t => t.includes('Edition') && t !== 'Special Edition' && t !== 'Limited Edition');
              const meta = collectionTag ? COLLECTION_DATA[collectionTag] : null;

              return (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="group"
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-all h-full border-0 ring-1 ring-border hover:ring-primary/30">
                    <div className="aspect-square bg-muted relative overflow-hidden">
                      <LazyImage
                        src={product.main_image || product.images?.[0] || ''}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                      {/* Collection badge */}
                      {collectionTag && (
                        <Badge className={`absolute top-2 left-2 z-10 text-[10px] sm:text-xs ${meta?.accent || 'bg-primary'} text-white border-0`}>
                          {meta?.title || collectionTag}
                        </Badge>
                      )}
                      {/* Discount badge */}
                      {product.price > product.final_price && (
                        <Badge className="absolute top-2 right-2 z-10 text-[10px] sm:text-xs bg-red-500 text-white border-0">
                          {Math.round(((product.price - product.final_price) / product.price) * 100)}% OFF
                        </Badge>
                      )}
                      {/* Special Edition shimmer overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      {/* Out of stock overlay */}
                      {product.stock <= 0 && !product.has_variants && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white text-xs font-bold bg-black/70 px-3 py-1.5 rounded-full">
                            Sold Out
                          </span>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-2.5 sm:p-3 space-y-1">
                      <h3 className="text-xs sm:text-sm font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1">
                        {product.brand || product.category}
                      </p>
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <span className="text-sm sm:text-base font-bold">
                          ₹{product.final_price.toLocaleString('en-IN')}
                        </span>
                        {product.price > product.final_price && (
                          <span className="text-[10px] sm:text-xs text-muted-foreground line-through">
                            ₹{product.price.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="container px-4 md:px-8 pb-12">
        <div className="rounded-xl border bg-card px-6 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">Can't find your fandom?</h3>
            <p className="text-sm text-muted-foreground">We're always adding new collections. Check out our full range or suggest a collection!</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link to="/contact">Suggest a Collection</Link>
            </Button>
            <Button asChild>
              <Link to="/products">Browse All Products</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
