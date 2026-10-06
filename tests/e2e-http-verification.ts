async function verifyHttpRoutes() {
  console.log('--- TESTING HTTP ROUTES VIA FETCH ---');
  const baseUrl = 'http://localhost:3000';

  const routes = [
    { url: `${baseUrl}/`, name: 'Home / Root' },
    { url: `${baseUrl}/apply`, name: 'Public Executive Form' },
    { url: `${baseUrl}/executive/enroll`, name: 'Executive Enrollment' },
    { url: `${baseUrl}/auth/login`, name: 'Auth Login Page' },
    { url: `${baseUrl}/admin/login`, name: 'Dedicated Admin Login Page' },
    { url: `${baseUrl}/admin/self-enroll`, name: 'Self Enroll Higher Cadre' },
    { url: `${baseUrl}/admin/dashboard`, name: 'Admin Dashboard Route' },
    { url: `${baseUrl}/icon.png`, name: 'Favicon' },
    { url: `${baseUrl}/logo.png`, name: 'Company Logo' },
    { url: `${baseUrl}/verify/JB20261001`, name: 'Verification Certificate' },
  ];

  for (const route of routes) {
    try {
      const res = await fetch(route.url);
      console.log(`[${res.status}] ${route.name} (${route.url})`);
    } catch (e: any) {
      console.error(`FAILED ${route.name}:`, e.message);
    }
  }

  console.log('--- HTTP ROUTE VERIFICATION FINISHED ---');
}

verifyHttpRoutes();
