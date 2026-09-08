export type Role = 'buyer' | 'agent' | 'admin';

export type ListingStatus = 'available' | 'under_offer' | 'sold';

export type ViewingStatus =
  | 'requested'
  | 'accepted'
  | 'declined'
  | 'en_route'
  | 'arrived'
  | 'completed'
  | 'cancelled';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
}

export interface Listing {
  id: string;
  title: string;
  address: string;
  city: 'Erbil' | 'London';
  currency: 'USD' | 'GBP';
  latitude: number;
  longitude: number;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area_sqm: number;
  description: string;
  photos: string[];
  status: ListingStatus;
  agent_id: string;
  agent?: User;
}

export interface LocationPing {
  id: string;
  viewing_id: string;
  latitude: number;
  longitude: number;
  recorded_at: string;
}

export interface Viewing {
  id: string;
  listing_id: string;
  buyer_id: string;
  agent_id: string;
  requested_time: string;
  status: ViewingStatus;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  listing?: Listing;
  agent?: User;
  buyer?: User;
  current_location?: {
    latitude: number;
    longitude: number;
    distance_km?: number;
    eta_minutes?: number;
  };
}
