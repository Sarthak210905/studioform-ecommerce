import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { SlidersHorizontal } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { productService } from '@/services/product.service';
import type { Product } from '@/types';
import AdvancedFilters from '@/components/common/AdvancedFilters';
import Breadcrumb from '@/components/common/Breadcrumb';
import SearchSuggestions from '@/components/common/SearchSuggestions';
import { ProductGridSkeleton } from '@/components/common/SkeletonLoader';
import LazyImage from '@/components/common/LazyImage';
import SEOHead from '@/components/common/SEOHead';
import { getOrganizationSchema } from '@/utils/seoSchemas';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get('category')?.split(',').filter(Boolean) || []
  );
  const [sortBy, setSortBy] = useState(searchParams.get('sort_by') || 'created_at');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const limit = 20;

  // Sync URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategories.length > 0) params.set('category', selectedCategories.join(','));
    if (sortBy !== 'created_at') params.set('sort_by', sortBy);
    if (currentPage !== 1) params.set('page', currentPage.toString());
    
    setSearchParams(params, { replace: true });
  }, [searchQuery, selectedCategories, sortBy, currentPage, setSearchParams]);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [searchQuery, selectedCategories, sortBy, currentPage, priceRange, selectedRating]);

  const loadCategories = async () => {
    try {
      const data = await productService.getCategories();
      // Handle if data is an array or needs to be converted
      if (Array.isArray(data)) {
        setCategories(data);
      } else if (typeof data === 'object') {
        // If it's an object, extract values
        setCategories(Object.values(data));
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
      setCategories([]);
    }
  };

  // Brands functionality removed
  // const loadBrands = async () => {
  //   try {
  //     const data = await productService.getBrands();
  //     if (Array.isArray(data)) {
  //       setBrands(data);
  //     } else if (typeof data === 'object') {
  //       setBrands(Object.values(data));
  //     } else {
  //       setBrands([]);
  //     }
  //   } catch (error) {
  //     console.error('Failed to load brands:', error);
  //     setBrands([]);
  //   }
  // };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const sortOptions = (() => {
        if (sortBy === 'price') return { sort_by: 'price', sort_order: 'asc' };
        if (sortBy === 'price_desc') return { sort_by: 'price', sort_order: 'desc' };
        if (sortBy === 'name') return { sort_by: 'name', sort_order: 'asc' };
        return { sort_by: 'created_at', sort_order: 'desc' };
      })();

      const params: any = {
        skip: (currentPage - 1) * limit,
        limit,
        ...sortOptions,
      };

      if (searchQuery) params.search = searchQuery;
      if (selectedCategories.length > 0) params.category = selectedCategories;
      if (priceRange[0] > 0 || priceRange[1] < 100000) {
        params.min_price = priceRange[0];
        params.max_price = priceRange[1];
      }
      if (selectedRating) params.min_rating = selectedRating;

      const data = await productService.getProducts(params);
      
      // Handle different response structures
      if (Array.isArray(data)) {
        setProducts(data);
      } else if (data.products && Array.isArray(data.products)) {
        setProducts(data.products);
      } else if (data.items && Array.isArray(data.items)) {
        setProducts(data.items);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 max-w-7xl">
      <SEOHead
        title="All Premium Desk Accessories - Shop Quality Products"
        description="Browse our complete collection of premium desk accessories. Find leather desk mats, organizers, pen holders and more. Fast shipping, exchanges on defective products."
        keywords="desk accessories, office organizers, workspace products, desk mats, pen holders"
        schema={getOrganizationSchema()}
      />
      
      {/* Breadcrumb */}
      <Breadcrumb />

      {/* Header */}
      <div className="mb-4 sm:mb-6 md:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">All Products</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Discover our premium collection</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8">
        {/* Mobile Filter Drawer */}
        <Sheet open={filterDrawerOpen} onOpenChange={setFilterDrawerOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="outline" 
              className="lg:hidden w-full mb-4 h-10 touch-manipulation"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {(selectedCategories.length > 0 || selectedRating !== null) && (
                <Badge className="ml-2" variant="secondary">
                  {selectedCategories.length + (selectedRating ? 1 : 0)}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] sm:w-[320px] overflow-y-auto">
            <SheetHeader className="mb-4">
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <AdvancedFilters
              categories={categories}
              priceRange={priceRange}
              minPrice={0}
              maxPrice={100000}
              selectedRating={selectedRating}
              selectedCategories={selectedCategories}
              onCategoryChange={(cats) => {
                setSelectedCategories(cats);
                setCurrentPage(1);
              }}
              onPriceChange={(range) => {
                setPriceRange(range);
                setCurrentPage(1);
              }}
              onRatingChange={(rating) => {
                setSelectedRating(rating);
                setCurrentPage(1);
              }}
            />
            <div className="mt-4 pt-4 border-t">
              <Button 
                onClick={() => setFilterDrawerOpen(false)} 
                className="w-full touch-manipulation"
              >
                Apply Filters
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        {/* Desktop Sidebar Filters */}
        <div className="hidden lg:block lg:col-span-1">
          <AdvancedFilters
            categories={categories}
            priceRange={priceRange}
            minPrice={0}
            maxPrice={100000}
            selectedRating={selectedRating}
            selectedCategories={selectedCategories}
            onCategoryChange={(cats) => {
              setSelectedCategories(cats);
              setCurrentPage(1);
            }}
            onPriceChange={(range) => {
              setPriceRange(range);
              setCurrentPage(1);
            }}
            onRatingChange={(rating) => {
              setSelectedRating(rating);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4 sm:space-y-6">
          {/* Top Filters */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <SearchSuggestions
              value={searchQuery}
              onChange={(value) => {
                setSearchQuery(value);
                setCurrentPage(1);
              }}
              onSelect={(value) => {
                setSearchQuery(value);
                setCurrentPage(1);
              }}
            />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[180px] h-10">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Newest</SelectItem>
                <SelectItem value="price">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Products Grid */}
          {loading ? (
            <ProductGridSkeleton count={9} />
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {products.map((product) => (
                <Link key={product.id} to={`/products/${product.id}`} className="block">
                <Card className="group overflow-hidden hover:shadow-lg transition-shadow h-full">
                  <div className="aspect-square bg-muted relative overflow-hidden">
                    {product.main_image && (
                      <LazyImage
                        src={product.main_image}
                        alt={product.name}
                        containerClassName="w-full h-full"
                        className="group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    {product.price > product.final_price && (
                      <Badge className="absolute top-1.5 right-1.5 z-10 text-xs px-1.5 py-0.5">
                        {Math.round(((product.price - product.final_price) / product.price) * 100)}% OFF
                      </Badge>
                    )}
                    {!product.is_in_stock && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Badge variant="destructive" className="text-xs">Out of Stock</Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-2.5 sm:p-3 space-y-1.5">
                    <h3 className="text-sm font-semibold group-hover:text-primary transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-1 hidden sm:block">
                      {product.description || product.category}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-base sm:text-lg font-bold">₹{product.final_price.toLocaleString()}</span>
                        {product.price > product.final_price && (
                          <span className="text-xs text-muted-foreground line-through">
                            ₹{product.price.toLocaleString()}
                          </span>
                        )}
                      </div>
                      {product.price > product.final_price && (
                        <Badge variant="secondary" className="text-xs px-1.5 py-0.5 hidden sm:inline-flex">
                          {Math.round(((product.price - product.final_price) / product.price) * 100)}% OFF
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && products.length > 0 && (
            <div className="flex justify-center mt-12 gap-2">
              <Button 
                variant="outline" 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button variant="default">{currentPage}</Button>
              <Button 
                variant="outline" 
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={products.length < limit}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
