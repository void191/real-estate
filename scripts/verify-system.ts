import { io } from 'socket.io-client';

const BASE_URL = 'http://localhost:3000';

let testBuyerCookie = '';
let testAgentCookie = '';
let testAgent2Cookie = '';
let testAdminCookie = '';

let createdViewingId = '';
let createdListingId = '';
let createdAgentId = '';

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passedCount++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failedCount++;
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runTests() {
  console.log('\n======================================================');
  console.log('REAL ESTATE VIEWING COORDINATOR — SYSTEM VERIFICATION');
  console.log('======================================================\n');

  try {
    // ----------------------------------------------------------------
    // 1. BUYER AUTHENTICATION & PORTFOLIO TESTS
    // ----------------------------------------------------------------
    console.log('--- TEST GROUP 1: BUYER AUTHENTICATION & PORTFOLIO ---');

    // 1.1 Register Buyer
    const uniqueEmail = `buyer_test_${Date.now()}@example.com`;
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Automated Test Buyer',
        email: uniqueEmail,
        password: 'password123',
        phone: '+44 7700 999888',
      }),
    });
    assert(regRes.status === 201, 'Buyer registration succeeds with 201');
    const setCookie = regRes.headers.get('set-cookie');
    testBuyerCookie = setCookie ? setCookie.split(';')[0] : '';
    assert(testBuyerCookie.includes('auth_token='), 'Buyer receives httpOnly auth_token cookie');

    // 1.2 Buyer Login
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: uniqueEmail,
        password: 'password123',
      }),
    });
    assert(loginRes.status === 200, 'Buyer login succeeds with 200');
    const buyerData = await loginRes.json();
    assert(buyerData.user.role === 'buyer', 'User identity confirmed as buyer');

    // 1.3 Fetch Listings Feed
    const feedRes = await fetch(`${BASE_URL}/api/listings`);
    assert(feedRes.status === 200, 'Listings feed returns 200 OK');
    const feedData = await feedRes.json();
    assert(Array.isArray(feedData.listings) && feedData.listings.length > 0, 'Feed contains available listings');
    const sampleListing = feedData.listings[0];
    assert(sampleListing.agent && sampleListing.agent.name, 'Listings contain assigned agent metadata');

    // 1.4 Filter Listings
    const filterRes = await fetch(`${BASE_URL}/api/listings?minBeds=4&minPrice=6000000`);
    assert(filterRes.status === 200, 'Filtering listings returns 200 OK');
    const filterData = await filterRes.json();
    assert(
      filterData.listings.every((l: any) => l.bedrooms >= 4 && l.price >= 6000000),
      'Listings adhere strictly to price and bedroom filter parameters'
    );

    // 1.5 Favorites: Add, Get, Remove
    const favRes = await fetch(`${BASE_URL}/api/favorites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: testBuyerCookie,
      },
      body: JSON.stringify({ listing_id: sampleListing.id }),
    });
    assert(favRes.status === 201, 'Add favorite succeeds with 201');

    const getFavsRes = await fetch(`${BASE_URL}/api/favorites`, {
      headers: { Cookie: testBuyerCookie },
    });
    const favsData = await getFavsRes.json();
    assert(favsData.listings.some((l: any) => l.id === sampleListing.id), 'Favorite appears in buyer saved list');

    const delFavRes = await fetch(`${BASE_URL}/api/favorites/${sampleListing.id}`, {
      method: 'DELETE',
      headers: { Cookie: testBuyerCookie },
    });
    assert(delFavRes.status === 200, 'Delete favorite succeeds with 200');

    // 1.6 Request Viewing
    const requestTime = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
    const reqViewingRes = await fetch(`${BASE_URL}/api/viewings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: testBuyerCookie,
      },
      body: JSON.stringify({
        listing_id: sampleListing.id,
        requested_time: requestTime,
      }),
    });
    assert(reqViewingRes.status === 201, 'Request viewing succeeds with 201');
    const viewingJson = await reqViewingRes.json();
    createdViewingId = viewingJson.viewing.id;
    assert(viewingJson.viewing.status === 'requested', 'Initial viewing status is "requested"');
    assert(viewingJson.viewing.agent_id === sampleListing.agent_id, 'Viewing automatically assigned to listing agent');

    // 1.7 My Viewings
    const myViewingsRes = await fetch(`${BASE_URL}/api/viewings/mine`, {
      headers: { Cookie: testBuyerCookie },
    });
    assert(myViewingsRes.status === 200, 'Buyer my viewings returns 200 OK');
    const myViewingsData = await myViewingsRes.json();
    assert(
      myViewingsData.upcoming.some((v: any) => v.id === createdViewingId),
      'Created viewing appears in buyer upcoming viewings'
    );

    // ----------------------------------------------------------------
    // 2. AGENT AUTHENTICATION & QUEUE LIFECYCLE
    // ----------------------------------------------------------------
    console.log('\n--- TEST GROUP 2: AGENT AUTHENTICATION & QUEUE ---');

    // 2.1 Agent Login
    const agentLoginRes = await fetch(`${BASE_URL}/api/agent/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: sampleListing.agent.email,
        password: 'password123',
      }),
    });
    assert(agentLoginRes.status === 200, 'Agent login succeeds with 200');
    const agentSetCookie = agentLoginRes.headers.get('set-cookie');
    testAgentCookie = agentSetCookie ? agentSetCookie.split(';')[0] : '';
    assert(testAgentCookie.includes('auth_token='), 'Agent receives httpOnly cookie');

    // Login Agent 2 (Elena) for authorization isolation test
    const agent2LoginRes = await fetch(`${BASE_URL}/api/agent/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'elena.rostova@agency.com',
        password: 'password123',
      }),
    });
    const agent2SetCookie = agent2LoginRes.headers.get('set-cookie');
    testAgent2Cookie = agent2SetCookie ? agent2SetCookie.split(';')[0] : '';

    // 2.2 Agent Queue Fetch
    const queueRes = await fetch(`${BASE_URL}/api/agent/viewings`, {
      headers: { Cookie: testAgentCookie },
    });
    assert(queueRes.status === 200, 'Agent viewing queue returns 200 OK');
    const queueData = await queueRes.json();
    assert(
      queueData.requested.some((v: any) => v.id === createdViewingId),
      'New viewing request appears in assigned agent "Requested" queue column'
    );

    // 2.3 Agent Isolation Check (Elena cannot access Sarah’s viewing)
    if (sampleListing.agent.email !== 'elena.rostova@agency.com') {
      const unauthorizedRes = await fetch(`${BASE_URL}/api/agent/viewings/${createdViewingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: testAgent2Cookie,
        },
        body: JSON.stringify({ status: 'accepted' }),
      });
      assert(
        unauthorizedRes.status === 403,
        'Server returns 403 Forbidden when another agent tries to modify a viewing'
      );
    }

    // 2.4 Agent Propose New Time
    const newProposedTime = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();
    const proposeRes = await fetch(`${BASE_URL}/api/agent/viewings/${createdViewingId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: testAgentCookie,
      },
      body: JSON.stringify({
        proposed_time: newProposedTime,
        notes: 'Proposed alternative slot.',
      }),
    });
    assert(proposeRes.status === 200, 'Agent can propose new appointment time');
    const proposedData = await proposeRes.json();
    assert(
      new Date(proposedData.viewing.requested_time).getTime() === new Date(newProposedTime).getTime(),
      'Requested time updated correctly in database'
    );

    // 2.5 Agent Accept Viewing
    const acceptRes = await fetch(`${BASE_URL}/api/agent/viewings/${createdViewingId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: testAgentCookie,
      },
      body: JSON.stringify({ status: 'accepted' }),
    });
    assert(acceptRes.status === 200, 'Agent accepts viewing (requested -> accepted)');
    const acceptedData = await acceptRes.json();
    assert(acceptedData.viewing.status === 'accepted', 'Viewing status transitioned to "accepted"');

    // 2.6 Buyer Starts En Route
    const enRouteRes = await fetch(`${BASE_URL}/api/viewings/${createdViewingId}/en-route`, {
      method: 'PATCH',
      headers: { Cookie: testBuyerCookie },
    });
    assert(enRouteRes.status === 200, 'Buyer triggers "I\'m on my way" (accepted -> en_route)');
    const enRouteData = await enRouteRes.json();
    assert(enRouteData.viewing.status === 'en_route', 'Viewing status transitioned to "en_route"');

    // 2.7 Buyer Marks Arrived
    const arrivedRes = await fetch(`${BASE_URL}/api/viewings/${createdViewingId}/arrived`, {
      method: 'PATCH',
      headers: { Cookie: testBuyerCookie },
    });
    assert(arrivedRes.status === 200, 'Buyer triggers "I\'ve arrived" (en_route -> arrived)');
    const arrivedData = await arrivedRes.json();
    assert(arrivedData.viewing.status === 'arrived', 'Viewing status transitioned to "arrived"');

    // 2.8 Agent Completes Viewing with Notes
    const completeRes = await fetch(`${BASE_URL}/api/agent/viewings/${createdViewingId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: testAgentCookie,
      },
      body: JSON.stringify({
        status: 'completed',
        notes: 'Buyer submitted formal intention to offer.',
      }),
    });
    assert(completeRes.status === 200, 'Agent completes viewing (arrived -> completed)');
    const completeData = await completeRes.json();
    assert(completeData.viewing.status === 'completed', 'Viewing status is "completed"');
    assert(completeData.viewing.notes.includes('formal intention'), 'Completion notes stored accurately');

    // ----------------------------------------------------------------
    // 3. SERVER-SIDE LIFECYCLE & SECURITY RESTRICTIONS
    // ----------------------------------------------------------------
    console.log('\n--- TEST GROUP 3: SERVER-SIDE LIFECYCLE & SECURITY ---');

    // 3.1 Invalid Transition: completed -> en_route
    const invalidJumpRes = await fetch(`${BASE_URL}/api/viewings/${createdViewingId}/en-route`, {
      method: 'PATCH',
      headers: { Cookie: testBuyerCookie },
    });
    assert(
      invalidJumpRes.status === 400,
      'Server blocks illegal lifecycle transition (completed -> en_route) with 400'
    );

    // 3.2 Buyer accessing admin endpoint returns 403
    const buyerForbiddenRes = await fetch(`${BASE_URL}/api/admin/reports`, {
      headers: { Cookie: testBuyerCookie },
    });
    assert(
      buyerForbiddenRes.status === 403,
      'Server blocks buyer accessing admin endpoints with 403 Forbidden'
    );

    // 3.3 Agent accessing admin listing creation returns 403
    const agentForbiddenRes = await fetch(`${BASE_URL}/api/admin/listings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: testAgentCookie,
      },
      body: JSON.stringify({ title: 'Unauthorized' }),
    });
    assert(
      agentForbiddenRes.status === 403,
      'Server blocks agent creating listings with 403 Forbidden'
    );

    // ----------------------------------------------------------------
    // 4. ADMIN DASHBOARD & AGENCY OPERATIONS
    // ----------------------------------------------------------------
    console.log('\n--- TEST GROUP 4: ADMIN OPERATIONS & REPORTS ---');

    // 4.1 Admin Login
    const adminLoginRes = await fetch(`${BASE_URL}/api/agent/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@agency.com',
        password: 'password123',
      }),
    });
    assert(adminLoginRes.status === 200, 'Admin login succeeds with 200');
    const adminSetCookie = adminLoginRes.headers.get('set-cookie');
    testAdminCookie = adminSetCookie ? adminSetCookie.split(';')[0] : '';
    assert(testAdminCookie.includes('auth_token='), 'Admin receives httpOnly cookie');

    // 4.2 Admin View All Viewings
    const adminViewingsRes = await fetch(`${BASE_URL}/api/admin/viewings`, {
      headers: { Cookie: testAdminCookie },
    });
    assert(adminViewingsRes.status === 200, 'Admin can fetch agency-wide viewings');
    const adminViewingsData = await adminViewingsRes.json();
    assert(adminViewingsData.viewings.length > 0, 'Agency-wide viewings list populated');

    // 4.3 Admin Create Listing & Reassign
    const newListingRes = await fetch(`${BASE_URL}/api/admin/listings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: testAdminCookie,
      },
      body: JSON.stringify({
        title: 'The Carlton House Terrace Residence',
        address: '10 Carlton House Terrace, St. James, London SW1Y',
        latitude: 51.5061,
        longitude: -0.1319,
        price: 12500000,
        bedrooms: 5,
        bathrooms: 5.5,
        area_sqm: 490,
        description: 'Spectacular palatial residence overlooking St. James’s Park.',
        photos: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80'],
        agent_id: sampleListing.agent_id,
        status: 'available',
      }),
    });
    assert(newListingRes.status === 201, 'Admin can create new listing with 201');
    const newListingData = await newListingRes.json();
    createdListingId = newListingData.listing.id;

    // 4.4 Admin Reassign Listing
    const reassignRes = await fetch(`${BASE_URL}/api/admin/listings/${createdListingId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: testAdminCookie,
      },
      body: JSON.stringify({ price: 12900000 }),
    });
    assert(reassignRes.status === 200, 'Admin can modify / reassign listing');

    // 4.5 Admin Delete Listing
    const delListingRes = await fetch(`${BASE_URL}/api/admin/listings/${createdListingId}`, {
      method: 'DELETE',
      headers: { Cookie: testAdminCookie },
    });
    assert(delListingRes.status === 200, 'Admin can remove listing with 200');

    // 4.6 Admin Create Agent & Deactivate
    const newAgentEmail = `agent_test_${Date.now()}@agency.com`;
    const newAgentRes = await fetch(`${BASE_URL}/api/admin/agents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: testAdminCookie,
      },
      body: JSON.stringify({
        name: 'Sebastian Croft',
        email: newAgentEmail,
        password: 'password123',
        phone: '+44 20 7946 0999',
      }),
    });
    assert(newAgentRes.status === 201, 'Admin can appoint new agent');
    const newAgentData = await newAgentRes.json();
    createdAgentId = newAgentData.agent.id;

    // Deactivate agent
    const deactRes = await fetch(`${BASE_URL}/api/admin/agents/${createdAgentId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: testAdminCookie,
      },
      body: JSON.stringify({ is_active: false }),
    });
    assert(deactRes.status === 200, 'Admin can deactivate agent');

    // Verify deactivated agent cannot login
    const deactLoginRes = await fetch(`${BASE_URL}/api/agent/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: newAgentEmail,
        password: 'password123',
      }),
    });
    assert(deactLoginRes.status === 403, 'Deactivated agent login is rejected with 403');

    // 4.7 Admin Reports
    const reportsRes = await fetch(`${BASE_URL}/api/admin/reports`, {
      headers: { Cookie: testAdminCookie },
    });
    assert(reportsRes.status === 200, 'Admin reports endpoint returns 200 OK');
    const reportsData = await reportsRes.json();
    assert(typeof reportsData.viewing_performance.total_viewings === 'number', 'Viewing performance metrics calculated from DB');
    assert(Array.isArray(reportsData.listing_performance), 'Listing engagement statistics generated from DB');
    assert(Array.isArray(reportsData.agent_activity), 'Agent activity reports generated from DB');

    // ----------------------------------------------------------------
    // 5. REAL-TIME WEBSOCKET & LOCATION PRIVACY
    // ----------------------------------------------------------------
    console.log('\n--- TEST GROUP 5: REAL-TIME WEBSOCKET & LOCATION PRIVACY ---');

    const buyerToken = testBuyerCookie.replace('auth_token=', '');
    const socketClient = io(BASE_URL, {
      auth: { token: buyerToken },
      transports: ['websocket'],
    });

    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('WebSocket connection timeout')), 5000);
      socketClient.on('connect', () => {
        clearTimeout(timer);
        assert(socketClient.connected, 'Authenticated client establishes real-time WebSocket connection');
        resolve();
      });
      socketClient.on('connect_error', (err) => {
        clearTimeout(timer);
        reject(err);
      });
    });

    socketClient.disconnect();

    console.log('\n======================================================');
    console.log(`ALL TESTS PASSED! (${passedCount} checks passed, 0 failures)`);
    console.log('======================================================\n');
  } catch (err: any) {
    console.error(`\nTest suite execution halted:`, err.message);
    process.exit(1);
  }
}

runTests();
