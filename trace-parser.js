const fs = require('fs');

const lines = fs.readFileSync(process.argv[2] || 'trace_out/0-trace.network', 'utf8').split('\n').filter(Boolean);
for (const line of lines) {
  try {
    const data = JSON.parse(line);
    if (data.type === 'resource-snapshot') {
      const req = data.snapshot.request;
      const res = data.snapshot.response;
      if (req.url.includes('/api/leads')) {
        console.log(`${req.method} ${req.url} - ${res.status}`);
        if (req.postData && req.postData.text) {
          console.log(`  Req Body: ${req.postData.text}`);
        }
        if (res.content && res.content.text) {
          console.log(`  Res Body: ${res.content.text.substring(0, 200)}`);
        }
      }
    }
  } catch (e) {}
}
