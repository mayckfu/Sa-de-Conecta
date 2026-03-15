const fs = require('fs');
const path = 'C:/Users/Mayckfu/.gemini/antigravity/brain/a2078aff-8660-4725-be22-5f4a43b9b11b/.system_generated/steps/2310/output.txt';

try {
  const content = fs.readFileSync(path, 'utf8');
  const data = JSON.parse(content);
  const fileContent = data.files[0].content;
  const keyMatch = fileContent.match(/\"private_key\":\s*\"([^\"]*)\"/);
  if (keyMatch) {
    const raw = keyMatch[1];
    const b64 = raw.replace(/-----(BEGIN|END) PRIVATE KEY-----/g, '').replace(/\\n/g, '').replace(/\s+/g, '');
    console.log('CLEAN_B64:' + b64);
    console.log('LEN:' + b64.length);
  }
} catch (e) {
  console.error(e);
}
