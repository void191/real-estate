'use client';

import React, { useEffect, useState } from 'react';
import { BuyerNav } from '@/components/navigation/BuyerNav';
import { PropertyCard, Property } from '@/components/buyer/PropertyCard';
import { PropertyFilters, FilterState } from '@/components/buyer/PropertyFilters';
import { Building2, SearchX } from 'lucide-react';

export default function BuyerFeedPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    minPrice: '',
    maxPrice: '',
    minBeds: '',
    minArea: '',
  });

  const fetchProperties = async (currentFilters: FilterState) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (currentFilters.minPrice) params.set('minPrice', currentFilters.minPrice);
      if (currentFilters.maxPrice) params.set('maxPrice', currentFilters.maxPrice);
      if (currentFilters.minBeds) params.set('minBeds', currentFilters.minBeds);
      if (currentFilters.minArea) params.set('minArea', currentFilters.minArea);

      const res = await fetch(`/api/listings?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load properties');
      const data = await res.json();
      setProperties(data.listings || []);
    } catch (err: any) {
      setError(err.message || 'Error fetching properties');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties(filters);
  }, [filters]);

  const handleResetFilters = () => {
    const emptyFilters: FilterState = {
      minPrice: '',
      maxPrice: '',
      minBeds: '',
      minArea: '',
    };
    setFilters(emptyFilters);
  };

  return (
    <div className="min-h-screen bg-white">
      <BuyerNav />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header Introduction */}
        <div className="text-center mb-8 sm:mb-10 space-y-2">
          <span className="text-[11px] uppercase tracking-[0.25em] text-brass font-semibold">
            Curated Portfolio
          </span>
          <h1 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-medium text-ink tracking-tight">
            Distinguished London Residences
          </h1>
          <p className="text-xs sm:text-sm text-muted max-w-md mx-auto">
            An exclusive collection of period villas, garden square townhouses, and architectural penthouses.
          </p>
        </div>

        {/* Filter Controls */}
        <PropertyFilters
          filters={filters}
          onChange={setFilters}
          onReset={handleResetFilters}
        />

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 text-center mb-8">
            {error}
          </div>
        )}

        {/* Listings Feed - Image First, Single Column */}
        {isLoading ? (
          <div className="space-y-8">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white rounded-lg overflow-hidden border border-stone animate-pulse"
              >
                <div className="aspect-[16/10] bg-stone-dim/50 w-full" />
                <div className="p-6 space-y-3">
                  <div className="h-6 bg-stone-dim/40 rounded w-3/4" />
                  <div className="h-8 bg-stone-dim/30 rounded w-1/3" />
                  <div className="h-4 bg-stone-dim/20 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : properties.length === 0 ? (
          /* Empty State */
          <div className="py-16 text-center space-y-4 border border-dashed border-stone-dim rounded-xl p-8 bg-stone/20">
            <SearchX className="w-10 h-10 text-muted mx-auto" />
            <h3 className="font-headline text-2xl font-medium text-ink">
              No Residences Found
            </h3>
            <p className="text-xs text-muted max-w-sm mx-auto">
              We couldn’t find any properties matching your current filters. Adjust your criteria or reset to view our full collection.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-2 text-xs uppercase tracking-wider font-semibold px-4 py-2 bg-ink text-white rounded hover:bg-ink/90 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
