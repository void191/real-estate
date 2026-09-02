import bcrypt from 'bcryptjs';
import { Role, ListingStatus, ViewingStatus } from '@prisma/client';

// Pre-hashed password for 'password123'
const DEFAULT_PASSWORD_HASH = bcrypt.hashSync('password123', 10);

export interface MockUser {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: Role;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: Date;
}

export interface MockListing {
  id: string;
  title: string;
  address: string;
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
  created_at: Date;
  updated_at: Date;
}

export interface MockViewing {
  id: string;
  listing_id: string;
  buyer_id: string;
  agent_id: string;
  requested_time: Date;
  status: ViewingStatus;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface MockFavorite {
  id: string;
  buyer_id: string;
  listing_id: string;
  created_at: Date;
}

export interface MockLocationPing {
  id: string;
  viewing_id: string;
  latitude: number;
  longitude: number;
  recorded_at: Date;
}

export class MockDataStore {
  users: MockUser[] = [
    {
      id: 'usr_admin',
      name: 'Eleanor Kensington (Admin)',
      email: 'admin@agency.com',
      password_hash: DEFAULT_PASSWORD_HASH,
      role: Role.admin,
      phone: '+44 20 7946 0001',
      avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      is_active: true,
      created_at: new Date('2026-01-01'),
    },
    {
      id: 'usr_alan',
      name: 'Alan Barzani',
      email: 'alan.barzan@agency.com',
      password_hash: DEFAULT_PASSWORD_HASH,
      role: Role.agent,
      phone: '+964 750 445 6789',
      avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
      is_active: true,
      created_at: new Date('2026-01-01'),
    },
    {
      id: 'usr_layla',
      name: 'Layla Hawrami',
      email: 'layla.erbil@agency.com',
      password_hash: DEFAULT_PASSWORD_HASH,
      role: Role.agent,
      phone: '+964 750 123 4567',
      avatar_url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&auto=format&fit=crop&q=80',
      is_active: true,
      created_at: new Date('2026-01-01'),
    },
    {
      id: 'usr_sarah',
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@agency.com',
      password_hash: DEFAULT_PASSWORD_HASH,
      role: Role.agent,
      phone: '+44 20 7946 0110',
      avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
      is_active: true,
      created_at: new Date('2026-01-01'),
    },
    {
      id: 'usr_marcus',
      name: 'Marcus Vance',
      email: 'marcus.vance@agency.com',
      password_hash: DEFAULT_PASSWORD_HASH,
      role: Role.agent,
      phone: '+44 20 7946 0111',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      is_active: true,
      created_at: new Date('2026-01-01'),
    },
    {
      id: 'usr_buyer1',
      name: 'Oliver Sterling',
      email: 'buyer1@example.com',
      password_hash: DEFAULT_PASSWORD_HASH,
      role: Role.buyer,
      phone: '+44 7700 900123',
      avatar_url: null,
      is_active: true,
      created_at: new Date('2026-01-01'),
    },
    {
      id: 'usr_buyer2',
      name: 'Sophia Montgomery',
      email: 'buyer2@example.com',
      password_hash: DEFAULT_PASSWORD_HASH,
      role: Role.buyer,
      phone: '+44 7700 900124',
      avatar_url: null,
      is_active: true,
      created_at: new Date('2026-01-01'),
    },
    {
      id: 'usr_buyer3',
      name: 'Julian Thorne',
      email: 'buyer3@example.com',
      password_hash: DEFAULT_PASSWORD_HASH,
      role: Role.buyer,
      phone: '+44 7700 900125',
      avatar_url: null,
      is_active: true,
      created_at: new Date('2026-01-01'),
    },
    {
      id: 'usr_buyer4',
      name: 'Amara Chen',
      email: 'buyer4@example.com',
      password_hash: DEFAULT_PASSWORD_HASH,
      role: Role.buyer,
      phone: '+44 7700 900126',
      avatar_url: null,
      is_active: true,
      created_at: new Date('2026-01-01'),
    },
    {
      id: 'usr_buyer5',
      name: 'Lord Henry Cavendish',
      email: 'buyer5@example.com',
      password_hash: DEFAULT_PASSWORD_HASH,
      role: Role.buyer,
      phone: '+44 7700 900127',
      avatar_url: null,
      is_active: true,
      created_at: new Date('2026-01-01'),
    },
  ];

  listings: MockListing[] = [
    {
      id: 'lst_empire',
      title: 'Empire World Royal Sky Penthouse',
      address: 'Empire Diamond Tower, Gulan Street, Erbil, Kurdistan Region',
      latitude: 36.2085,
      longitude: 43.9854,
      price: 3200000,
      bedrooms: 4,
      bathrooms: 4.5,
      area_sqm: 420,
      description: 'Crown jewel penthouse in the heart of Erbil’s premier business district. Panoramic floor-to-ceiling glass wrapping around Sami Abdulrahman Park, private high-speed elevator, imported Italian Calacatta marble, and automated smart-residence systems.',
      photos: [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&auto=format&fit=crop&q=80',
      ],
      status: ListingStatus.available,
      agent_id: 'usr_alan',
      created_at: new Date('2026-01-01'),
      updated_at: new Date('2026-01-01'),
    },
    {
      id: 'lst_dreamcity',
      title: 'Dream City Executive Palace',
      address: 'Dream City Boulevard, 100 Meter Road, Erbil, Kurdistan Region',
      latitude: 36.2152,
      longitude: 43.9928,
      price: 2750000,
      bedrooms: 5,
      bathrooms: 5.5,
      area_sqm: 550,
      description: 'A distinguished palatial residence within Erbil’s premier gated enclave. Features a landscaped Mediterranean courtyard, private outdoor swimming pool, dedicated driver and staff quarters, and multi-vehicle garage.',
      photos: [
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&auto=format&fit=crop&q=80',
      ],
      status: ListingStatus.available,
      agent_id: 'usr_layla',
      created_at: new Date('2026-01-01'),
      updated_at: new Date('2026-01-01'),
    },
    {
      id: 'lst_english',
      title: 'English Village Diplomatic Residence',
      address: 'English Village, Gulan District, Erbil, Kurdistan Region',
      latitude: 36.2041,
      longitude: 43.9789,
      price: 1850000,
      bedrooms: 5,
      bathrooms: 4.0,
      area_sqm: 480,
      description: 'Classic standalone brick villa situated on a quiet tree-lined avenue within English Village. Manicured private gardens, bespoke solid oak cabinetry, modern security installations, and proximity to international schools and embassies.',
      photos: [
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=1200&auto=format&fit=crop&q=80',
      ],
      status: ListingStatus.available,
      agent_id: 'usr_alan',
      created_at: new Date('2026-01-01'),
      updated_at: new Date('2026-01-01'),
    },
    {
      id: 'lst_italian',
      title: 'Italian Village Contemporary Villa',
      address: 'Italian Village 1, 100 Meter Ring Road, Erbil, Kurdistan Region',
      latitude: 36.2210,
      longitude: 43.9815,
      price: 1250000,
      bedrooms: 4,
      bathrooms: 4.0,
      area_sqm: 380,
      description: 'Sleek architectural design boasting open-concept living, bespoke quartz island kitchen, sunlit bedrooms with en-suite baths, and an expansive rooftop entertainment deck offering city skyline vistas.',
      photos: [
        'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1200&auto=format&fit=crop&q=80',
      ],
      status: ListingStatus.available,
      agent_id: 'usr_layla',
      created_at: new Date('2026-01-01'),
      updated_at: new Date('2026-01-01'),
    },
    {
      id: 'lst_gulan',
      title: 'Gulan Park Panoramic Residence',
      address: 'Gulan Street opposite Sami Abdulrahman Park, Erbil, Kurdistan Region',
      latitude: 36.1985,
      longitude: 43.9912,
      price: 2100000,
      bedrooms: 3,
      bathrooms: 3.5,
      area_sqm: 310,
      description: 'Exclusive lateral residence fronting Erbil’s celebrated parkland. High-end fixtures, underground secure parking, 24/7 building concierge, and private balconies overlooking the park greenery.',
      photos: [
        'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=1200&auto=format&fit=crop&q=80',
      ],
      status: ListingStatus.available,
      agent_id: 'usr_alan',
      created_at: new Date('2026-01-01'),
      updated_at: new Date('2026-01-01'),
    },
    {
      id: 'lst_ankawa',
      title: 'Ankawa Historic Courtyard Estate',
      address: 'Mar Youhanna Street, Ankawa, Erbil, Kurdistan Region',
      latitude: 36.2312,
      longitude: 43.9985,
      price: 1650000,
      bedrooms: 4,
      bathrooms: 3.5,
      area_sqm: 400,
      description: 'Characterful private compound blending traditional Mosul-stone architecture with contemporary luxury comforts. Features a central fountain courtyard, private citrus arbor, and independent guest wing.',
      photos: [
        'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&auto=format&fit=crop&q=80',
      ],
      status: ListingStatus.available,
      agent_id: 'usr_layla',
      created_at: new Date('2026-01-01'),
      updated_at: new Date('2026-01-01'),
    },
    {
      id: 'lst_eaton',
      title: 'The Penthouse at Eaton Square',
      address: '42 Eaton Square, Belgravia, London SW1W 9BD',
      latitude: 51.4938,
      longitude: -0.1542,
      price: 8950000,
      bedrooms: 4,
      bathrooms: 4.5,
      area_sqm: 380,
      description: 'An exceptional crown duplex penthouse overlooking the private gardens of prestigious Eaton Square. Features 3.4m ceiling heights, private elevator access, and double-aspect grand reception room.',
      photos: [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop&q=80',
      ],
      status: ListingStatus.available,
      agent_id: 'usr_sarah',
      created_at: new Date('2026-01-01'),
      updated_at: new Date('2026-01-01'),
    },
    {
      id: 'lst_cadogan',
      title: 'Cadogan Gardens Georgian Townhouse',
      address: '18 Cadogan Gardens, Chelsea, London SW3 2RP',
      latitude: 51.4925,
      longitude: -0.1600,
      price: 6450000,
      bedrooms: 5,
      bathrooms: 4.0,
      area_sqm: 320,
      description: 'Meticulously restored Grade II listed Victorian red-brick townhouse. Retains original cornicing, period fireplaces, and chevron oak parquet flooring, paired with cutting-edge Lutron lighting.',
      photos: [
        'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&auto=format&fit=crop&q=80',
      ],
      status: ListingStatus.available,
      agent_id: 'usr_sarah',
      created_at: new Date('2026-01-01'),
      updated_at: new Date('2026-01-01'),
    },
    {
      id: 'lst_glasshouse',
      title: 'The Glasshouse Pavilion',
      address: '7 The Grove, Highgate, London N6 6JU',
      latitude: 51.5712,
      longitude: -0.1504,
      price: 5200000,
      bedrooms: 4,
      bathrooms: 3.5,
      area_sqm: 290,
      description: 'Architectural masterpiece crafted by RIBA award-winning architects. Full-height structural glazing dissolves the boundary between contemporary interior spaces and mature woodland gardens.',
      photos: [
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80',
      ],
      status: ListingStatus.available,
      agent_id: 'usr_marcus',
      created_at: new Date('2026-01-01'),
      updated_at: new Date('2026-01-01'),
    },
  ];

  viewings: MockViewing[] = [
    {
      id: 'vw_erbil_enroute_1',
      listing_id: 'lst_empire',
      buyer_id: 'usr_buyer1',
      agent_id: 'usr_alan',
      requested_time: new Date(Date.now() + 15 * 60 * 1000),
      status: ViewingStatus.en_route,
      notes: 'Buyer: On my way via Gulan Street from Sami Abdulrahman Park entrance.',
      created_at: new Date('2026-01-01'),
      updated_at: new Date('2026-01-01'),
    },
    {
      id: 'vw_erbil_enroute_2',
      listing_id: 'lst_dreamcity',
      buyer_id: 'usr_buyer2',
      agent_id: 'usr_layla',
      requested_time: new Date(Date.now() + 10 * 60 * 1000),
      status: ViewingStatus.en_route,
      notes: 'Buyer: Leaving English Village gate now. Looking forward to viewing the private grounds.',
      created_at: new Date('2026-01-01'),
      updated_at: new Date('2026-01-01'),
    },
    {
      id: 'vw_erbil_requested_1',
      listing_id: 'lst_english',
      buyer_id: 'usr_buyer3',
      agent_id: 'usr_alan',
      requested_time: new Date(Date.now() + 24 * 60 * 60 * 1000),
      status: ViewingStatus.requested,
      notes: 'Buyer inquiry: Please advise if private vehicle driveway can accommodate three diplomatic SUVs.',
      created_at: new Date('2026-01-01'),
      updated_at: new Date('2026-01-01'),
    },
    {
      id: 'vw_erbil_accepted_1',
      listing_id: 'lst_gulan',
      buyer_id: 'usr_buyer4',
      agent_id: 'usr_alan',
      requested_time: new Date(Date.now() + 4 * 60 * 60 * 1000),
      status: ViewingStatus.accepted,
      notes: 'Agent note: Appointment confirmed. Meeting at the Gulan Park VIP concierge desk.',
      created_at: new Date('2026-01-01'),
      updated_at: new Date('2026-01-01'),
    },
    {
      id: 'vw_erbil_completed_1',
      listing_id: 'lst_italian',
      buyer_id: 'usr_buyer5',
      agent_id: 'usr_layla',
      requested_time: new Date(Date.now() - 24 * 60 * 60 * 1000),
      status: ViewingStatus.completed,
      notes: 'Viewing concluded successfully. Buyer architectural team inspected the roof deck and marble finishes. Follow-up meeting scheduled.',
      created_at: new Date('2026-01-01'),
      updated_at: new Date('2026-01-01'),
    },
    {
      id: 'vw_london_accepted_1',
      listing_id: 'lst_eaton',
      buyer_id: 'usr_buyer1',
      agent_id: 'usr_sarah',
      requested_time: new Date(Date.now() + 72 * 60 * 60 * 1000),
      status: ViewingStatus.accepted,
      notes: 'Confirmed viewing for Belgravia penthouse.',
      created_at: new Date('2026-01-01'),
      updated_at: new Date('2026-01-01'),
    },
  ];

  favorites: MockFavorite[] = [
    { id: 'fav_1', buyer_id: 'usr_buyer1', listing_id: 'lst_empire', created_at: new Date() },
    { id: 'fav_2', buyer_id: 'usr_buyer1', listing_id: 'lst_dreamcity', created_at: new Date() },
    { id: 'fav_3', buyer_id: 'usr_buyer1', listing_id: 'lst_eaton', created_at: new Date() },
    { id: 'fav_4', buyer_id: 'usr_buyer2', listing_id: 'lst_english', created_at: new Date() },
  ];

  locationPings: MockLocationPing[] = [
    {
      id: 'ping_1',
      viewing_id: 'vw_erbil_enroute_1',
      latitude: 36.1995,
      longitude: 43.9895,
      recorded_at: new Date(),
    },
    {
      id: 'ping_2',
      viewing_id: 'vw_erbil_enroute_2',
      latitude: 36.2060,
      longitude: 43.9820,
      recorded_at: new Date(),
    },
  ];

  // ================= USER METHODS =================
  async findUserUnique(where: { email?: string; id?: string }) {
    if (where.id) {
      return this.users.find((u) => u.id === where.id) || null;
    }
    if (where.email) {
      return this.users.find((u) => u.email.toLowerCase() === where.email?.toLowerCase()) || null;
    }
    return null;
  }

  async findUsers(args?: any) {
    let result = [...this.users];
    if (args?.where?.role) {
      result = result.filter((u) => u.role === args.where.role);
    }
    return result;
  }

  async createUser(data: any) {
    const newUser: MockUser = {
      id: 'usr_' + Date.now(),
      name: data.name,
      email: data.email,
      password_hash: data.password_hash,
      role: data.role || Role.buyer,
      phone: data.phone || null,
      avatar_url: data.avatar_url || null,
      is_active: data.is_active !== undefined ? data.is_active : true,
      created_at: new Date(),
    };
    this.users.push(newUser);
    return newUser;
  }

  async updateUser(where: { id: string }, data: any) {
    const user = this.users.find((u) => u.id === where.id);
    if (!user) throw new Error('User not found');
    Object.assign(user, data);
    return user;
  }

  // ================= LISTING METHODS =================
  async findListings(args?: any) {
    let result = [...this.listings];
    const where = args?.where;
    if (where) {
      if (where.status) {
        result = result.filter((l) => l.status === where.status);
      }
      if (where.agent_id) {
        result = result.filter((l) => l.agent_id === where.agent_id);
      }
      if (where.price?.gte) {
        result = result.filter((l) => l.price >= where.price.gte);
      }
      if (where.price?.lte) {
        result = result.filter((l) => l.price <= where.price.lte);
      }
      if (where.bedrooms?.gte) {
        result = result.filter((l) => l.bedrooms >= where.bedrooms.gte);
      }
      if (where.area_sqm?.gte) {
        result = result.filter((l) => l.area_sqm >= where.area_sqm.gte);
      }
    }

    // Attach agent object
    return result.map((l) => ({
      ...l,
      agent: this.users.find((u) => u.id === l.agent_id) || null,
    }));
  }

  async findListingUnique(where: { id: string }) {
    const l = this.listings.find((item) => item.id === where.id);
    if (!l) return null;
    return {
      ...l,
      agent: this.users.find((u) => u.id === l.agent_id) || null,
    };
  }

  async countListings(args?: any) {
    const res = await this.findListings(args);
    return res.length;
  }

  async createListing(data: any) {
    const newListing: MockListing = {
      id: 'lst_' + Date.now(),
      title: data.title,
      address: data.address,
      latitude: data.latitude || 36.2085,
      longitude: data.longitude || 43.9854,
      price: data.price || 1000000,
      bedrooms: data.bedrooms || 3,
      bathrooms: data.bathrooms || 2,
      area_sqm: data.area_sqm || 200,
      description: data.description || '',
      photos: data.photos || [],
      status: data.status || ListingStatus.available,
      agent_id: data.agent_id || this.users[1].id,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.listings.push(newListing);
    return {
      ...newListing,
      agent: this.users.find((u) => u.id === newListing.agent_id) || null,
    };
  }

  async updateListing(where: { id: string }, data: any) {
    const listing = this.listings.find((l) => l.id === where.id);
    if (!listing) throw new Error('Listing not found');
    Object.assign(listing, data, { updated_at: new Date() });
    return {
      ...listing,
      agent: this.users.find((u) => u.id === listing.agent_id) || null,
    };
  }

  async deleteListing(where: { id: string }) {
    const idx = this.listings.findIndex((l) => l.id === where.id);
    if (idx !== -1) {
      const removed = this.listings.splice(idx, 1)[0];
      return removed;
    }
    return null;
  }

  // ================= VIEWING METHODS =================
  async findViewings(args?: any) {
    let result = [...this.viewings];
    const where = args?.where;
    if (where) {
      if (where.agent_id) {
        result = result.filter((v) => v.agent_id === where.agent_id);
      }
      if (where.buyer_id) {
        result = result.filter((v) => v.buyer_id === where.buyer_id);
      }
      if (where.status) {
        if (typeof where.status === 'string') {
          result = result.filter((v) => v.status === where.status);
        } else if (where.status.in) {
          result = result.filter((v) => where.status.in.includes(v.status));
        }
      }
    }

    return result.map((v) => ({
      ...v,
      listing: this.listings.find((l) => l.id === v.listing_id) || null,
      agent: this.users.find((u) => u.id === v.agent_id) || null,
      buyer: this.users.find((u) => u.id === v.buyer_id) || null,
      location_pings: this.locationPings
        .filter((p) => p.viewing_id === v.id)
        .sort((a, b) => b.recorded_at.getTime() - a.recorded_at.getTime()),
    }));
  }

  async findViewingUnique(where: { id: string }) {
    const v = this.viewings.find((item) => item.id === where.id);
    if (!v) return null;
    return {
      ...v,
      listing: this.listings.find((l) => l.id === v.listing_id) || null,
      agent: this.users.find((u) => u.id === v.agent_id) || null,
      buyer: this.users.find((u) => u.id === v.buyer_id) || null,
      location_pings: this.locationPings
        .filter((p) => p.viewing_id === v.id)
        .sort((a, b) => b.recorded_at.getTime() - a.recorded_at.getTime()),
    };
  }

  async countViewings(args?: any) {
    const res = await this.findViewings(args);
    return res.length;
  }

  async createViewing(data: any) {
    const newViewing: MockViewing = {
      id: 'vw_' + Date.now(),
      listing_id: data.listing_id,
      buyer_id: data.buyer_id,
      agent_id: data.agent_id,
      requested_time: new Date(data.requested_time),
      status: data.status || ViewingStatus.requested,
      notes: data.notes || null,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.viewings.push(newViewing);
    return {
      ...newViewing,
      listing: this.listings.find((l) => l.id === newViewing.listing_id) || null,
      agent: this.users.find((u) => u.id === newViewing.agent_id) || null,
      buyer: this.users.find((u) => u.id === newViewing.buyer_id) || null,
      location_pings: [],
    };
  }

  async updateViewing(where: { id: string }, data: any) {
    const viewing = this.viewings.find((v) => v.id === where.id);
    if (!viewing) throw new Error('Viewing not found');
    Object.assign(viewing, data, { updated_at: new Date() });
    return {
      ...viewing,
      listing: this.listings.find((l) => l.id === viewing.listing_id) || null,
      agent: this.users.find((u) => u.id === viewing.agent_id) || null,
      buyer: this.users.find((u) => u.id === viewing.buyer_id) || null,
      location_pings: this.locationPings
        .filter((p) => p.viewing_id === viewing.id)
        .sort((a, b) => b.recorded_at.getTime() - a.recorded_at.getTime()),
    };
  }

  // ================= FAVORITE METHODS =================
  async findFavorites(where: { buyer_id?: string; listing_id?: string }) {
    let result = [...this.favorites];
    if (where.buyer_id) {
      result = result.filter((f) => f.buyer_id === where.buyer_id);
    }
    if (where.listing_id) {
      result = result.filter((f) => f.listing_id === where.listing_id);
    }
    return result.map((f) => ({
      ...f,
      listing: this.listings.find((l) => l.id === f.listing_id) || null,
    }));
  }

  async createFavorite(data: { buyer_id: string; listing_id: string }) {
    const existing = this.favorites.find(
      (f) => f.buyer_id === data.buyer_id && f.listing_id === data.listing_id
    );
    if (existing) return existing;
    const newFav: MockFavorite = {
      id: 'fav_' + Date.now(),
      buyer_id: data.buyer_id,
      listing_id: data.listing_id,
      created_at: new Date(),
    };
    this.favorites.push(newFav);
    return newFav;
  }

  async deleteFavorite(where: any) {
    let idx = -1;
    if (where.buyer_id_listing_id) {
      idx = this.favorites.findIndex(
        (f) =>
          f.buyer_id === where.buyer_id_listing_id.buyer_id &&
          f.listing_id === where.buyer_id_listing_id.listing_id
      );
    } else if (where.id) {
      idx = this.favorites.findIndex((f) => f.id === where.id);
    }
    if (idx !== -1) {
      return this.favorites.splice(idx, 1)[0];
    }
    return null;
  }

  // ================= LOCATION PING METHODS =================
  async createLocationPing(data: any) {
    const newPing: MockLocationPing = {
      id: 'ping_' + Date.now(),
      viewing_id: data.viewing_id,
      latitude: data.latitude,
      longitude: data.longitude,
      recorded_at: new Date(),
    };
    this.locationPings.push(newPing);
    return newPing;
  }

  async findFirstLocationPing(where: { viewing_id?: string }) {
    const pings = this.locationPings
      .filter((p) => (where.viewing_id ? p.viewing_id === where.viewing_id : true))
      .sort((a, b) => b.recorded_at.getTime() - a.recorded_at.getTime());
    return pings[0] || null;
  }
}

// Global in-memory singleton that persists across API calls in the same container/serverless instance
const globalForStore = globalThis as unknown as {
  mockDataStore: MockDataStore | undefined;
};

export const mockStore = globalForStore.mockDataStore ?? new MockDataStore();
if (process.env.NODE_ENV !== 'production') globalForStore.mockDataStore = mockStore;
