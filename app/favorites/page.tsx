'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BuyerNav } from '@/components/navigation/BuyerNav';
import { PropertyCard, Property } from '@/components/buyer/PropertyCard';
import { useAuth } from '@/components/auth/AuthProvider';
import { Heart, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function BuyerFavoritesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFavorites = async () => {
    try {
      const res = await fetch('/api/favorites');
      if (res.ok) {
        const data = await res.json();
        setFavorites(data.listings || []);
      }
    } catch (err) {
      console.error('Error fetching favorites:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else {
        fetchFavorites();
      }
    }
  }, [user, authLoading]);

  const handleFavoriteToggle = (propertyId: string, isFav: boolean) => {
    if (!isFav) {
      // Remove from list
      setFavorites((prev) => prev.filter((p) => p.id !== propertyId));
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <BuyerNav />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-8 space-y-1">
          <span className="text-[11px] uppercase tracking-widest text-brass font-semibold">
            Saved Collection
          </span>
          <h1 className="font-headline text-3xl sm:text-4xl font-medium text-ink">
            Saved Residences
          </h1>
          <p className="text-xs text-muted">
            Properties you have marked for future review and viewing requests.
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            {[1, 2].map((n) => (
              <div
                key={n}
                className="bg-white rounded-lg overflow-hidden border border-stone animate-pulse"
              >
                <div className="aspect-[16/10] bg-stone-dim/50 w-full" />
                <div className="p-6 space-y-2">
                  <div className="h-6 bg-stone-dim/40 rounded w-1/2" />
                  <div className="h-6 bg-stone-dim/30 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <div className="py-16 text-center space-y-4 border border-dashed border-stone-dim rounded-xl p-8 bg-stone/20">
            <Heart className="w-10 h-10 text-muted mx-auto stroke-[1.5]" />
            <h3 className="font-headline text-2xl font-medium text-ink">
              No Saved Residences
            </h3>
            <p className="text-xs text-muted max-w-sm mx-auto">
              You have not saved any properties yet. Explore our portfolio and tap the heart icon on any residence you wish to track.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold px-4 py-2 bg-ink text-white rounded hover:bg-ink/90 transition-colors"
            >
              <span>Explore Residences</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {favorites.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onFavoriteToggle={handleFavoriteToggle}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
