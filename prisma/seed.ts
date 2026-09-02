import { PrismaClient, Role, ListingStatus, ViewingStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning database...');
  await prisma.locationPing.deleteMany();
  await prisma.viewing.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding executive admin and agents...');
  const passwordHash = await bcrypt.hash('password123', 10);

  // Admin
  const admin = await prisma.user.create({
    data: {
      name: 'Eleanor Kensington (Admin)',
      email: 'admin@agency.com',
      password_hash: passwordHash,
      role: Role.admin,
      phone: '+44 20 7946 0001',
      avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    },
  });

  // Agents (UK & Erbil Regional Specialists)
  const agentSarah = await prisma.user.create({
    data: {
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@agency.com',
      password_hash: passwordHash,
      role: Role.agent,
      phone: '+44 20 7946 0110',
      avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
    },
  });

  const agentMarcus = await prisma.user.create({
    data: {
      name: 'Marcus Vance',
      email: 'marcus.vance@agency.com',
      password_hash: passwordHash,
      role: Role.agent,
      phone: '+44 20 7946 0111',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    },
  });

  const agentElena = await prisma.user.create({
    data: {
      name: 'Elena Rostova',
      email: 'elena.rostova@agency.com',
      password_hash: passwordHash,
      role: Role.agent,
      phone: '+44 20 7946 0112',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    },
  });

  const agentWilliam = await prisma.user.create({
    data: {
      name: 'William Thornbury',
      email: 'william.thornbury@agency.com',
      password_hash: passwordHash,
      role: Role.agent,
      phone: '+44 20 7946 0114',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    },
  });

  const agentCharlotte = await prisma.user.create({
    data: {
      name: 'Charlotte Sinclair',
      email: 'charlotte.sinclair@agency.com',
      password_hash: passwordHash,
      role: Role.agent,
      phone: '+44 20 7946 0115',
      avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    },
  });

  // Erbil Regional Specialists
  const agentAlan = await prisma.user.create({
    data: {
      name: 'Alan Barzani',
      email: 'alan.barzan@agency.com',
      password_hash: passwordHash,
      role: Role.agent,
      phone: '+964 750 445 6789',
      avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
    },
  });

  const agentLayla = await prisma.user.create({
    data: {
      name: 'Layla Hawrami',
      email: 'layla.erbil@agency.com',
      password_hash: passwordHash,
      role: Role.agent,
      phone: '+964 750 123 4567',
      avatar_url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&auto=format&fit=crop&q=80',
    },
  });

  console.log('Seeding client buyers...');
  // Buyers
  const buyerOliver = await prisma.user.create({
    data: {
      name: 'Oliver Sterling',
      email: 'buyer1@example.com',
      password_hash: passwordHash,
      role: Role.buyer,
      phone: '+44 7700 900123',
    },
  });

  const buyerSophia = await prisma.user.create({
    data: {
      name: 'Sophia Montgomery',
      email: 'buyer2@example.com',
      password_hash: passwordHash,
      role: Role.buyer,
      phone: '+44 7700 900124',
    },
  });

  const buyerJulian = await prisma.user.create({
    data: {
      name: 'Julian Thorne',
      email: 'buyer3@example.com',
      password_hash: passwordHash,
      role: Role.buyer,
      phone: '+44 7700 900125',
    },
  });

  const buyerAmara = await prisma.user.create({
    data: {
      name: 'Amara Chen',
      email: 'buyer4@example.com',
      password_hash: passwordHash,
      role: Role.buyer,
      phone: '+44 7700 900126',
    },
  });

  const buyerHenry = await prisma.user.create({
    data: {
      name: 'Lord Henry Cavendish',
      email: 'buyer5@example.com',
      password_hash: passwordHash,
      role: Role.buyer,
      phone: '+44 7700 900127',
    },
  });

  const buyerEvangeline = await prisma.user.create({
    data: {
      name: 'Evangeline Vance',
      email: 'buyer6@example.com',
      password_hash: passwordHash,
      role: Role.buyer,
      phone: '+44 7700 900128',
    },
  });

  const buyerAlexander = await prisma.user.create({
    data: {
      name: 'Alexander Wright',
      email: 'buyer7@example.com',
      password_hash: passwordHash,
      role: Role.buyer,
      phone: '+44 7700 900129',
    },
  });

  const buyerIsabella = await prisma.user.create({
    data: {
      name: 'Isabella Fontaine',
      email: 'buyer8@example.com',
      password_hash: passwordHash,
      role: Role.buyer,
      phone: '+44 7700 900130',
    },
  });

  console.log('Seeding portfolio of residences (Erbil & London Prime)...');

  // ==========================================
  // ERBIL LUXURY RESIDENCES (GPS: ~36.20, 43.99)
  // ==========================================
  const listingEmpire = await prisma.listing.create({
    data: {
      title: 'Empire World Royal Sky Penthouse',
      address: 'Empire Diamond Tower, Gulan Street, Erbil, Kurdistan Region',
      latitude: 36.2085,
      longitude: 43.9854,
      price: 3200000,
      bedrooms: 4,
      bathrooms: 4.5,
      area_sqm: 420,
      description: 'Crown jewel penthouse in the heart of Erbil’s premier business and luxury district. Panoramic floor-to-ceiling glass wrapping around Sami Abdulrahman Park, private high-speed elevator access, imported Italian Calacatta marble, and automated smart-residence systems.',
      photos: [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&auto=format&fit=crop&q=80',
      ],
      status: ListingStatus.available,
      agent_id: agentAlan.id,
    },
  });

  const listingDreamCity = await prisma.listing.create({
    data: {
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
      agent_id: agentLayla.id,
    },
  });

  const listingEnglishVillage = await prisma.listing.create({
    data: {
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
      agent_id: agentAlan.id,
    },
  });

  const listingItalianVillage = await prisma.listing.create({
    data: {
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
      agent_id: agentLayla.id,
    },
  });

  const listingGulan = await prisma.listing.create({
    data: {
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
      agent_id: agentAlan.id,
    },
  });

  const listingAnkawa = await prisma.listing.create({
    data: {
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
      agent_id: agentLayla.id,
    },
  });

  // ==========================================
  // LONDON RESIDENCES
  // ==========================================
  const listingEaton = await prisma.listing.create({
    data: {
      title: 'The Penthouse at Eaton Square',
      address: '42 Eaton Square, Belgravia, London SW1W 9BD',
      latitude: 51.4938,
      longitude: -0.1542,
      price: 8950000,
      bedrooms: 4,
      bathrooms: 4.5,
      area_sqm: 380,
      description: 'An exceptional crown duplex penthouse overlooking the private gardens of prestigious Eaton Square. Features 3.4m ceiling heights, private elevator access, double-aspect grand reception room, and an expansive wraparound terrace.',
      photos: [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop&q=80',
      ],
      status: ListingStatus.available,
      agent_id: agentSarah.id,
    },
  });

  const listingCadogan = await prisma.listing.create({
    data: {
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
      agent_id: agentSarah.id,
    },
  });

  const listingGlasshouse = await prisma.listing.create({
    data: {
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
      agent_id: agentMarcus.id,
    },
  });

  console.log('Seeding client favorites...');
  await prisma.favorite.createMany({
    data: [
      { buyer_id: buyerOliver.id, listing_id: listingEmpire.id },
      { buyer_id: buyerOliver.id, listing_id: listingDreamCity.id },
      { buyer_id: buyerOliver.id, listing_id: listingEaton.id },
      { buyer_id: buyerSophia.id, listing_id: listingEnglishVillage.id },
      { buyer_id: buyerSophia.id, listing_id: listingCadogan.id },
      { buyer_id: buyerJulian.id, listing_id: listingGulan.id },
      { buyer_id: buyerJulian.id, listing_id: listingItalianVillage.id },
      { buyer_id: buyerAmara.id, listing_id: listingAnkawa.id },
      { buyer_id: buyerHenry.id, listing_id: listingEmpire.id },
      { buyer_id: buyerEvangeline.id, listing_id: listingDreamCity.id },
      { buyer_id: buyerAlexander.id, listing_id: listingEnglishVillage.id },
      { buyer_id: buyerIsabella.id, listing_id: listingGulan.id },
    ],
  });

  console.log('Seeding Erbil and London viewing pipeline with communication notes and GPS...');

  // ==========================================
  // VIEWINGS: ERBIL WITH LIVE GPS
  // ==========================================

  // 1. Oliver Sterling is EN ROUTE to Empire World Royal Penthouse in Erbil!
  // Target: 36.2085, 43.9854
  const enRouteErbil1 = await prisma.viewing.create({
    data: {
      listing_id: listingEmpire.id,
      buyer_id: buyerOliver.id,
      agent_id: agentAlan.id,
      requested_time: new Date(Date.now() + 15 * 60 * 1000), // in 15 mins
      status: ViewingStatus.en_route,
      notes: 'Buyer: On my way via Gulan Street from Sami Abdulrahman Park entrance.',
    },
  });

  await prisma.locationPing.create({
    data: {
      viewing_id: enRouteErbil1.id,
      latitude: 36.1995, // Approaching Empire World from the south along Gulan Street (~1.1 km away)
      longitude: 43.9895,
      recorded_at: new Date(),
    },
  });

  // 2. Sophia Montgomery is EN ROUTE to Dream City Executive Palace in Erbil!
  // Target: 36.2152, 43.9928
  const enRouteErbil2 = await prisma.viewing.create({
    data: {
      listing_id: listingDreamCity.id,
      buyer_id: buyerSophia.id,
      agent_id: agentLayla.id,
      requested_time: new Date(Date.now() + 10 * 60 * 1000),
      status: ViewingStatus.en_route,
      notes: 'Buyer: Leaving English Village gate now. Looking forward to viewing the private grounds.',
    },
  });

  await prisma.locationPing.create({
    data: {
      viewing_id: enRouteErbil2.id,
      latitude: 36.2060, // Near 100m Road (~1.2 km from Dream City)
      longitude: 43.9820,
      recorded_at: new Date(),
    },
  });

  // 3. Julian Thorne requested English Village
  await prisma.viewing.create({
    data: {
      listing_id: listingEnglishVillage.id,
      buyer_id: buyerJulian.id,
      agent_id: agentAlan.id,
      requested_time: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      status: ViewingStatus.requested,
      notes: 'Buyer inquiry: Please advise if private vehicle driveway can accommodate three diplomatic SUVs.',
    },
  });

  // 4. Amara Chen accepted Gulan Park
  await prisma.viewing.create({
    data: {
      listing_id: listingGulan.id,
      buyer_id: buyerAmara.id,
      agent_id: agentAlan.id,
      requested_time: new Date(Date.now() + 4 * 60 * 60 * 1000), // in 4 hours
      status: ViewingStatus.accepted,
      notes: 'Agent note: Appointment confirmed. Meeting at the Gulan Park VIP concierge desk.',
    },
  });

  // 5. Lord Henry completed Italian Village
  await prisma.viewing.create({
    data: {
      listing_id: listingItalianVillage.id,
      buyer_id: buyerHenry.id,
      agent_id: agentLayla.id,
      requested_time: new Date(Date.now() - 24 * 60 * 60 * 1000),
      status: ViewingStatus.completed,
      notes: 'Viewing concluded successfully. Buyer architectural team inspected the roof deck and marble finishes. Follow-up meeting scheduled.',
    },
  });

  // 6. Alexander Wright requested Ankawa
  await prisma.viewing.create({
    data: {
      listing_id: listingAnkawa.id,
      buyer_id: buyerAlexander.id,
      agent_id: agentLayla.id,
      requested_time: new Date(Date.now() + 48 * 60 * 60 * 1000),
      status: ViewingStatus.requested,
      notes: 'Buyer inquiry: Requesting daytime viewing to inspect the historic stone masonry in natural light.',
    },
  });

  // 7. London Viewing
  await prisma.viewing.create({
    data: {
      listing_id: listingEaton.id,
      buyer_id: buyerOliver.id,
      agent_id: agentSarah.id,
      requested_time: new Date(Date.now() + 72 * 60 * 60 * 1000),
      status: ViewingStatus.accepted,
      notes: 'Confirmed viewing for Belgravia penthouse.',
    },
  });

  console.log('\nErbil and London database seed complete!');
  console.log('Statistics:');
  console.log(' - Users: 1 Admin, 7 Agents (including Erbil specialists Alan & Layla), 8 Buyers');
  console.log(' - Residences: 6 Erbil Luxury Properties + London Portfolio');
  console.log(' - Active Erbil En-Route Viewings: 2 with live Erbil GPS pins around Gulan St & Dream City');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
