'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, Bed, Bath, Maximize2 } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';

export interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area_sqm: number;
  photos: string[];
  is_favorite?: boolean;
  agent?: {
    id: string;
    name: string;
    avatar_url?: string | null;
    phone?: string | null;
  };
}

interface PropertyCardProps {
  property: Property;
  onFavoriteToggle?: (propertyId: string, isFav: boolean) => void;
}

import { formatPropertyPrice } from '@/lib/currency';

export function PropertyCard({ property, onFavoriteToggle }: PropertyCardProps) {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(Boolean(property.is_favorite));
  const [isToggling, setIsToggling] = useState(false);

  const formatPrice = (amount: number) => {
    return formatPropertyPrice(amount, property.address);
  };

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      window.location.href = '/login';
      return;
    }

    if (isToggling) return;
    setIsToggling(true);

    const nextState = !isFavorite;
    setIsFavorite(nextState);

    try {
      if (nextState) {
        await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ listing_id: property.id }),
        });
      } else {
        await fetch(`/api/favorites/${property.id}`, {
          method: 'DELETE',
        });
      }
      onFavoriteToggle?.(property.id, nextState);
    } catch (err) {
      // Revert on failure
      setIsFavorite(!nextState);
    } finally {
      setIsToggling(false);
    }
  };

  const primaryPhoto =
    property.photos && property.photos.length > 0
      ? property.photos[0]
      : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80';

  return (
    <article className="group bg-white rounded-lg overflow-hidden border border-stone shadow-sm hover:shadow-md transition-all duration-300">
      <Link href={`/listings/${property.id}`} className="block">
        {/* Large Property Image Container */}
        <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden bg-stone-dim">
          <img
            src={primaryPhoto}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            loading="lazy"
          />

          {/* Gradient subtle overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/30 via-transparent to-transparent opacity-60" />

          {/* Favorite Heart Button Overlay */}
          <button
            type="button"
            onClick={handleFavoriteClick}
            disabled={isToggling}
            aria-label={isFavorite ? 'Remove from saved properties' : 'Save property'}
            className="absolute top-3 right-3 p-2.5 rounded-full bg-white/90 backdrop-blur-sm text-ink hover:text-red-600 transition-colors shadow-sm focus:outline-none"
          >
            <Heart
              className={`w-5 h-5 transition-colors ${
                isFavorite ? 'fill-red-600 text-red-600' : 'text-ink/80 stroke-[1.75]'
              }`}
            />
          </button>
        </div>

        {/* Content Section */}
        <div className="p-5 sm:p-6 space-y-3">
          {/* Title in Fraunces */}
          <h2 className="font-headline text-xl sm:text-2xl font-medium text-ink tracking-tight line-clamp-1 group-hover:text-brass transition-colors">
            {property.title}
          </h2>

          {/* Brass Price in Fraunces */}
          <div className="font-headline text-2xl sm:text-3xl font-semibold text-brass">
            {formatPrice(property.price)}
          </div>

          {/* Address */}
          <p className="text-xs text-muted font-sans font-medium line-clamp-1">
            {property.address}
          </p>

          {/* Metadata: Beds · Baths · sqm */}
          <div className="pt-3 border-t border-stone-dim/60 flex items-center gap-5 text-xs text-ink/80 font-sans">
            <span className="flex items-center gap-1.5">
              <Bed className="w-4 h-4 text-muted" />
              <strong className="font-semibold text-ink">{property.bedrooms}</strong> beds
            </span>
            <span className="text-stone-dim">•</span>
            <span className="flex items-center gap-1.5">
              <Bath className="w-4 h-4 text-muted" />
              <strong className="font-semibold text-ink">{property.bathrooms}</strong> baths
            </span>
            <span className="text-stone-dim">•</span>
            <span className="flex items-center gap-1.5">
              <Maximize2 className="w-4 h-4 text-muted" />
              <strong className="font-semibold text-ink">{property.area_sqm}</strong> sqm
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
