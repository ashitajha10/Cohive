const http = require('http');

http.get('http://localhost:5173/src/components/Sidebar.jsx', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    if (res.statusCode === 500) {
      console.log('Error Body:', data);
    } else {
      console.log('Success Body prefix:', data.substring(0, 200));
    }
  });
}).on('error', (err) => {
  console.error('Request failed:', err.message);
});
