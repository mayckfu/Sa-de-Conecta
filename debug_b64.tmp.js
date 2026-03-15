const fs = require('fs');
const privateKey = fs.readFileSync('e:/agendamento/recovered_key.tmp.txt', 'utf8');

const binaryKey = privateKey
  .replace(/-----BEGIN [A-Z ]+-----/g, '')
  .replace(/-----END [A-Z ]+-----/g, '')
  .replace(/[^A-Za-z0-9+/=]/g, '');

console.log('binaryKey length:', binaryKey.length);
console.log('binaryKey mod 4:', binaryKey.length % 4);
console.log('first 20 chars:', binaryKey.substring(0, 20));
console.log('last 20 chars:', binaryKey.substring(binaryKey.length - 20));

try {
  const buf = Buffer.from(binaryKey, 'base64');
  console.log('Base64 decoded length:', buf.length);
} catch (e) {
  console.error('Base64 error:', e.message);
}
