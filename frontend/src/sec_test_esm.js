import https from 'https';

function testEndpoint(path) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'xvmvhkdmudzwuwljmjgu.supabase.co',
      port: 443,
      path: '/rest/v1/' + path + '?select=*',
      method: 'GET',
      headers: {
        'apikey': 'sb_publishable_QRzQ54S9hYcmh8nz6NvUPg_6vIKfUOC',
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (d) => { body += d; });
      res.on('end', () => {
        console.log(`Endpoint: /${path}`);
        console.log(`Status: ${res.statusCode}`);
        try {
          const json = JSON.parse(body);
          console.log(`Result: ${Array.isArray(json) ? json.length + ' rows' : 'Error response'}`);
          if (res.statusCode === 200 && Array.isArray(json) && json.length === 0) {
            console.log('✅ PASS: RLS is active (0 rows returned)');
          } else if (res.statusCode >= 400) {
             console.log('✅ PASS: Access denied/Error');
          } else {
             console.log('❌ FAIL: Data leak detected! Received ' + JSON.stringify(json).substring(0, 50));
          }
        } catch (e) {
          console.log('✅ PASS: Non-JSON response (Access likely blocked)');
        }
        console.log('---');
        resolve();
      });
    });

    req.on('error', (e) => {
      console.error(e);
      resolve();
    });
    req.end();
  });
}

async function runTests() {
  console.log('🚀 PROVA DE SEGURANÇA (ACESSO NÃO AUTENTICADO)');
  await testEndpoint('eventos');
  await testEndpoint('profiles');
  await testEndpoint('documentos');
}

runTests();
