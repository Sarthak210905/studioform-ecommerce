import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

interface AdvancedFiltersProps {
  categories: string[];
  priceRange: [number, number];
  minPrice: number;
  maxPrice: number;
  selectedRating: number | null;
  onCategoryChange: (categories: string[]) => void;
  onPriceChange: (range: [number, number]) => void;
  onRatingChange: (rating: number | null) => void;
  selectedCategories: string[];
}

export default function AdvancedFilters({
  categories,
  priceRange,
  minPrice,
  maxPrice,
  selectedRating,
  onCategoryChange,
  onPriceChange,
  onRatingChange,
  selectedCategories,
}: AdvancedFiltersProps) {
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
    rating: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      onCategoryChange([...selectedCategories, category]);
    } else {
      onCategoryChange(selectedCategories.filter((c) => c !== category));
    }
  };

  const handleClearFilters = () => {
    onCategoryChange([]);
    onPriceChange([minPrice, maxPrice]);
    onRatingChange(null);
  };

  const hasActiveFilters = selectedCategories.length > 0 || selectedRating !== null;

  return (
    <div className="bg-card lg:border lg:rounded-lg p-2 sm:p-4 space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-base sm:text-lg lg:block hidden">Filters</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleClearFilters} className="text-xs touch-manipulation">
            Clear All
          </Button>
        )}
      </div>

      {/* Categories Filter */}
      <div>
        <button
          onClick={() => toggleSection('categories')}
          className="flex items-center justify-between w-full py-2 hover:bg-muted rounded px-2 transition touch-manipulation"
        >
          <span className="font-medium text-sm sm:text-base">Categories</span>
          {expandedSections.categories ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {expandedSections.categories && (
          <div className="space-y-2 sm:space-y-2.5 mt-2 sm:mt-3 pl-1 sm:pl-2">
            {categories.map((category) => (
              <div key={category} className="flex items-center space-x-2 py-1">
                <Checkbox
                  id={`category-${category}`}
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
                  className="touch-manipulation"
                />
                <label
                  htmlFor={`category-${category}`}
                  className="text-sm cursor-pointer hover:text-primary transition flex-1"
                >
                  {category}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Price Range Filter */}
      <div>
        <button
          onClick={() => toggleSection('price')}
          className="flex items-center justify-between w-full py-2 hover:bg-muted rounded px-2 transition touch-manipulation"
        >
          <span className="font-medium text-sm sm:text-base">Price Range</span>
          {expandedSections.price ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {expandedSections.price && (
          <div className="space-y-3 sm:space-y-4 mt-3 sm:mt-4 px-1 sm:px-2">
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Min Price: ₹{priceRange[0].toLocaleString()}</label>
                <input
                  type="range"
                  min={minPrice}
                  max={maxPrice}
                  step={100}
                  value={priceRange[0]}
                  onChange={(e) => {
                    const newMin = parseInt(e.target.value);
                    if (newMin < priceRange[1]) {
                      onPriceChange([newMin, priceRange[1]]);
                    }
                  }}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Max Price: ₹{priceRange[1].toLocaleString()}</label>
                <input
                  type="range"
                  min={minPrice}
                  max={maxPrice}
                  step={100}
                  value={priceRange[1]}
                  onChange={(e) => {
                    const newMax = parseInt(e.target.value);
                    if (newMax > priceRange[0]) {
                      onPriceChange([priceRange[0], newMax]);
                    }
                  }}
                  className="w-full"
                />
              </div>
            </div>
            <div className="flex items-center justify-between text-sm pt-2">
              <div>
                <label className="text-xs text-muted-foreground">Range</label>
                <div className="font-medium">₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Rating Filter */}
      <div>
        <button
          onClick={() => toggleSection('rating')}
          className="flex items-center justify-between w-full py-2 hover:bg-muted rounded px-2 transition touch-manipulation"
        >
          <span className="font-medium text-sm sm:text-base">Rating</span>
          {expandedSections.rating ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {expandedSections.rating && (
          <div className="space-y-1.5 sm:space-y-2 mt-2 sm:mt-3 pl-1 sm:pl-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <button
                key={rating}
                onClick={() => onRatingChange(selectedRating === rating ? null : rating)}
                className={`w-full text-left py-2 px-2 rounded transition flex items-center gap-2 touch-manipulation ${
                  selectedRating === rating ? 'bg-primary/10' : 'hover:bg-muted'
                }`}
              >
                <Checkbox checked={selectedRating === rating} className="pointer-events-none flex-shrink-0" />
                <div className="flex items-center gap-0.5 sm:gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`text-lg ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                      ★
                    </span>
                  ))}
                  <span className="text-xs text-muted-foreground ml-1">& up</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <>
          <Separator />
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Active Filters</p>
            <div className="flex flex-wrap gap-2">
              {selectedCategories.map((category) => (
                <Badge
                  key={category}
                  variant="secondary"
                  className="gap-1 cursor-pointer hover:bg-secondary/80"
                  onClick={() => onCategoryChange(selectedCategories.filter((c) => c !== category))}
                >
                  {category}
                  <X className="h-3 w-3" />
                </Badge>
              ))}
              {selectedRating && (
                <Badge
                  variant="secondary"
                  className="gap-1 cursor-pointer hover:bg-secondary/80"
                  onClick={() => onRatingChange(null)}
                >
                  {selectedRating}★+
                  <X className="h-3 w-3" />
                </Badge>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
