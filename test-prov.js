const fetch = require('node-fetch');

async function run() {
  const res = await fetch('http://localhost:3000/api/companies', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Dynamic Test Co 2', adminEmail: 'testprov2@example.com' })
  });
  const data = await res.json();
  console.log(data);
}
run();
