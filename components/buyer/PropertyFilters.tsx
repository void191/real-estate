'use client';

import React from 'react';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';

export interface FilterState {
  minPrice: string;
  maxPrice: string;
  minBeds: string;
  minArea: string;
}

interface PropertyFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
}

export function PropertyFilters({ filters, onChange, onReset }: PropertyFiltersProps) {
  const handleChange = (key: keyof FilterState, value: string) => {
    onChange({
      ...filters,
      [key]: value,
    });
  };

  const hasActiveFilters =
    Boolean(filters.minPrice) ||
    Boolean(filters.maxPrice) ||
    Boolean(filters.minBeds) ||
    Boolean(filters.minArea);

  return (
    <section className="bg-stone/30 border border-stone-dim rounded-lg p-4 sm:p-5 mb-8 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-ink/80">
          <SlidersHorizontal className="w-3.5 h-3.5 text-brass" />
          <span>Refine Portfolio</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-xs text-muted hover:text-ink flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Reset Filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Min Price */}
        <div>
          <label className="block text-[11px] uppercase tracking-wider text-muted font-medium mb-1">
            Min Price
          </label>
          <select
            value={filters.minPrice}
            onChange={(e) => handleChange('minPrice', e.target.value)}
            className="w-full text-xs bg-white border border-stone-dim rounded px-2.5 py-2 text-ink focus:outline-none focus:border-brass"
          >
            <option value="">Any</option>
            <option value="3000000">£3,000,000</option>
            <option value="5000000">£5,000,000</option>
            <option value="7500000">£7,500,000</option>
            <option value="10000000">£10,000,000</option>
          </select>
        </div>

        {/* Max Price */}
        <div>
          <label className="block text-[11px] uppercase tracking-wider text-muted font-medium mb-1">
            Max Price
          </label>
          <select
            value={filters.maxPrice}
            onChange={(e) => handleChange('maxPrice', e.target.value)}
            className="w-full text-xs bg-white border border-stone-dim rounded px-2.5 py-2 text-ink focus:outline-none focus:border-brass"
          >
            <option value="">Any</option>
            <option value="5000000">£5,000,000</option>
            <option value="8000000">£8,000,000</option>
            <option value="12000000">£12,000,000</option>
            <option value="20000000">£20,000,000+</option>
          </select>
        </div>

        {/* Bedrooms */}
        <div>
          <label className="block text-[11px] uppercase tracking-wider text-muted font-medium mb-1">
            Bedrooms
          </label>
          <select
            value={filters.minBeds}
            onChange={(e) => handleChange('minBeds', e.target.value)}
            className="w-full text-xs bg-white border border-stone-dim rounded px-2.5 py-2 text-ink focus:outline-none focus:border-brass"
          >
            <option value="">Any</option>
            <option value="2">2+ Bedrooms</option>
            <option value="3">3+ Bedrooms</option>
            <option value="4">4+ Bedrooms</option>
            <option value="5">5+ Bedrooms</option>
          </select>
        </div>

        {/* Min Area sqm */}
        <div>
          <label className="block text-[11px] uppercase tracking-wider text-muted font-medium mb-1">
            Min Area (sqm)
          </label>
          <select
            value={filters.minArea}
            onChange={(e) => handleChange('minArea', e.target.value)}
            className="w-full text-xs bg-white border border-stone-dim rounded px-2.5 py-2 text-ink focus:outline-none focus:border-brass"
          >
            <option value="">Any</option>
            <option value="150">150+ sqm</option>
            <option value="250">250+ sqm</option>
            <option value="350">350+ sqm</option>
            <option value="500">500+ sqm</option>
          </select>
        </div>
      </div>
    </section>
  );
}
