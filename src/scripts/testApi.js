import http from 'http';

http.get('http://localhost:3000/api/dynamic-fields?target=lead&page=1&limit=50&scope=Industry&industry=6a6045c13b988c8b94377202', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data));
});
