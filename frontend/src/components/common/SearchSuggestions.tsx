import { useState, useEffect, useRef } from 'react';
import { Search, TrendingUp, Clock, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/axios';

interface SearchSuggestionsProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (value: string) => void;
}

interface SearchResult {
  id: string;
  name: string;
  category?: string;
  price?: number;
}

export default function SearchSuggestions({ value, onChange, onSelect }: SearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recentSearches');
    if (stored) {
      setRecentSearches(JSON.parse(stored).slice(0, 5));
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (value.trim().length > 1) {
        fetchSuggestions(value);
        setIsOpen(true);
      } else {
        setSuggestions([]);
        if (value.trim().length === 0) {
          setIsOpen(true);
        } else {
          setIsOpen(false);
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [value]);

  const fetchSuggestions = async (query: string) => {
    setIsLoading(true);
    try {
      const response = await api.get('/products', {
        params: {
          search: query,
          limit: 8,
        },
      });

      let products: SearchResult[] = [];
      if (Array.isArray(response.data)) {
        products = response.data;
      } else if (response.data.products) {
        products = response.data.products;
      } else if (response.data.items) {
        products = response.data.items;
      }

      setSuggestions(products.slice(0, 8));
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSuggestion = (productName: string) => {
    onChange(productName);
    onSelect(productName);
    
    // Save to recent searches
    const updated = [productName, ...recentSearches.filter(s => s !== productName)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
    
    setIsOpen(false);
  };

  const handleClearSearch = () => {
    onChange('');
    setSuggestions([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleRecentSearch = (search: string) => {
    onChange(search);
    onSelect(search);
    setIsOpen(false);
  };

  const handleRemoveRecent = (search: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recentSearches.filter(s => s !== search);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex-1 relative" ref={searchContainerRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search products..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => {
            if (value.trim() === '' && recentSearches.length > 0) {
              setIsOpen(true);
            }
          }}
          className="pl-10 pr-10"
          autoComplete="off"
        />
        {value && (
          <button
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition p-1 z-10"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-r-transparent" />
            </div>
          ) : value.trim().length > 1 ? (
            <>
              {suggestions.length > 0 ? (
                <div className="py-2">
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Products
                  </div>
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() => handleSelectSuggestion(suggestion.name)}
                      className="w-full px-4 py-2 text-left hover:bg-accent transition flex items-center gap-3 group"
                    >
                      <Search className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{suggestion.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {suggestion.category && <span>{suggestion.category}</span>}
                          {suggestion.price && <span> • ₹{suggestion.price?.toLocaleString()}</span>}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No products found for "{value}"
                </div>
              )}
            </>
          ) : (
            <>
              {recentSearches.length > 0 && (
                <div className="py-2">
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Recent Searches
                  </div>
                  {recentSearches.map((search) => (
                    <button
                      key={search}
                      onClick={() => handleRecentSearch(search)}
                      className="w-full px-4 py-2 text-left hover:bg-accent transition flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Clock className="h-4 w-4 text-muted-foreground group-hover:text-foreground flex-shrink-0" />
                        <span className="text-sm truncate">{search}</span>
                      </div>
                      <button
                        onClick={(e) => handleRemoveRecent(search, e)}
                        className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition flex-shrink-0"
                        aria-label={`Remove ${search} from recent searches`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </button>
                  ))}
                </div>
              )}
              {recentSearches.length === 0 && (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Start typing to search for products</p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
