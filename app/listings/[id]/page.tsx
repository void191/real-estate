'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BuyerNav } from '@/components/navigation/BuyerNav';
import { RequestViewingModal } from '@/components/buyer/RequestViewingModal';
import { Heart, Bed, Bath, Maximize2, MapPin, Phone, Mail, ChevronLeft, Calendar } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { formatPropertyPrice } from '@/lib/currency';

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { user } = useAuth();

  const [listing, setListing] = useState<any>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isViewingModalOpen, setIsViewingModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchListing = async () => {
      try {
        const res = await fetch(`/api/listings/${id}`);
        if (!res.ok) throw new Error('Listing not found');
        const data = await res.json();
        setListing(data.listing);
        setIsFavorite(Boolean(data.listing.is_favorite));
      } catch (err: any) {
        setError(err.message || 'Error loading listing');
      } finally {
        setIsLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  const handleFavoriteToggle = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    const nextState = !isFavorite;
    setIsFavorite(nextState);

    try {
      if (nextState) {
        await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ listing_id: id }),
        });
      } else {
        await fetch(`/api/favorites/${id}`, {
          method: 'DELETE',
        });
      }
    } catch {
      setIsFavorite(!nextState);
    }
  };

  const formatPrice = (amount: number) => {
    return formatPropertyPrice(amount, listing?.address);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <BuyerNav />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center text-muted animate-pulse">
          Loading residence particulars...
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-white">
        <BuyerNav />
        <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
          <h2 className="font-headline text-2xl text-ink">Residence Not Found</h2>
          <p className="text-sm text-muted">{error || 'The requested property could not be located.'}</p>
          <button
            onClick={() => router.push('/')}
            className="text-xs uppercase tracking-wider font-semibold px-4 py-2 bg-ink text-white rounded"
          >
            Return to Portfolio
          </button>
        </div>
      </div>
    );
  }

  const photos = listing.photos && listing.photos.length > 0 ? listing.photos : [];
  const currentPhoto = photos[selectedPhotoIndex] || photos[0];

  return (
    <div className="min-h-screen bg-white pb-20">
      <BuyerNav />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-8">
        {/* Back Link */}
        <button
          onClick={() => router.back()}
          className="text-xs text-muted hover:text-ink flex items-center gap-1.5 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Portfolio</span>
        </button>

        {/* Photo Gallery */}
        <section className="space-y-3">
          <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden rounded-xl bg-stone-dim shadow-md">
            <img
              src={currentPhoto}
              alt={listing.title}
              className="w-full h-full object-cover transition-all duration-500"
            />
            {/* Favorite Control */}
            <button
              onClick={handleFavoriteToggle}
              aria-label={isFavorite ? 'Remove from saved' : 'Save property'}
              className="absolute top-4 right-4 p-3 rounded-full bg-white/90 backdrop-blur-sm text-ink hover:text-red-600 transition-colors shadow-sm"
            >
              <Heart
                className={`w-5 h-5 ${
                  isFavorite ? 'fill-red-600 text-red-600' : 'text-ink/80 stroke-[1.75]'
                }`}
              />
            </button>
          </div>

          {/* Thumbnail Selector */}
          {photos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {photos.map((photo: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedPhotoIndex(index)}
                  className={`relative w-20 h-14 sm:w-24 sm:h-16 rounded-md overflow-hidden shrink-0 border-2 transition-all ${
                    selectedPhotoIndex === index ? 'border-brass scale-95' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Property Particulars & Primary Action */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4 border-t border-stone">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <span className="text-[11px] uppercase tracking-widest text-brass font-semibold">
                Private Offering
              </span>
              <h1 className="font-headline text-3xl sm:text-4xl font-medium text-ink tracking-tight mt-1">
                {listing.title}
              </h1>
              <div className="flex items-center gap-1.5 text-xs text-muted font-sans mt-2">
                <MapPin className="w-3.5 h-3.5 text-brass shrink-0" />
                <span>{listing.address}</span>
              </div>
            </div>

            {/* Brass Price */}
            <div className="font-headline text-3xl sm:text-4xl font-semibold text-brass">
              {formatPrice(listing.price)}
            </div>

            {/* Key Specs */}
            <div className="flex items-center gap-6 py-4 border-y border-stone text-xs text-ink/90 font-sans">
              <div className="flex items-center gap-2">
                <Bed className="w-4 h-4 text-brass" />
                <div>
                  <div className="font-bold text-sm text-ink">{listing.bedrooms}</div>
                  <div className="text-[10px] text-muted uppercase tracking-wider">Bedrooms</div>
                </div>
              </div>
              <div className="h-8 w-px bg-stone-dim" />
              <div className="flex items-center gap-2">
                <Bath className="w-4 h-4 text-brass" />
                <div>
                  <div className="font-bold text-sm text-ink">{listing.bathrooms}</div>
                  <div className="text-[10px] text-muted uppercase tracking-wider">Bathrooms</div>
                </div>
              </div>
              <div className="h-8 w-px bg-stone-dim" />
              <div className="flex items-center gap-2">
                <Maximize2 className="w-4 h-4 text-brass" />
                <div>
                  <div className="font-bold text-sm text-ink">{listing.area_sqm}</div>
                  <div className="text-[10px] text-muted uppercase tracking-wider">Square Metres</div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <h2 className="font-headline text-lg font-medium text-ink">
                Architectural Overview
              </h2>
              <p className="text-sm text-ink/80 leading-relaxed whitespace-pre-line font-sans">
                {listing.description}
              </p>
            </div>
          </div>

          {/* Assigned Agent Card & Booking Trigger */}
          <div className="space-y-6">
            <div className="bg-stone/30 rounded-xl p-6 border border-stone-dim space-y-5">
              <div className="text-xs uppercase tracking-wider font-semibold text-muted">
                Listing Agent
              </div>

              <div className="flex items-center gap-4">
                {listing.agent?.avatar_url && (
                  <img
                    src={listing.agent.avatar_url}
                    alt={listing.agent.name}
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-brass/30"
                  />
                )}
                <div>
                  <div className="font-medium text-ink text-sm">{listing.agent?.name}</div>
                  <div className="text-xs text-muted">Senior Property Consultant</div>
                </div>
              </div>

              {listing.agent?.phone && (
                <div className="flex items-center gap-2 text-xs text-ink/80 pt-2 border-t border-stone-dim/60">
                  <Phone className="w-3.5 h-3.5 text-brass" />
                  <span className="font-mono">{listing.agent.phone}</span>
                </div>
              )}

              {listing.agent?.email && (
                <div className="flex items-center gap-2 text-xs text-ink/80">
                  <Mail className="w-3.5 h-3.5 text-brass" />
                  <span className="truncate">{listing.agent.email}</span>
                </div>
              )}

              {/* Request Viewing Button */}
              <button
                onClick={() => setIsViewingModalOpen(true)}
                className="w-full py-3 px-4 rounded-lg bg-ink text-white font-sans text-xs uppercase tracking-wider font-semibold hover:bg-ink/90 transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4 text-brass" />
                <span>Request Viewing</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Request Viewing Modal */}
      {isViewingModalOpen && (
        <RequestViewingModal
          listingId={listing.id}
          listingTitle={listing.title}
          agentName={listing.agent?.name || 'Assigned Agent'}
          isOpen={isViewingModalOpen}
          onClose={() => setIsViewingModalOpen(false)}
        />
      )}
    </div>
  );
}
