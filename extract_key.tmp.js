const fs = require('fs');
const path = 'C:/Users/Mayckfu/.gemini/antigravity/brain/a2078aff-8660-4725-be22-5f4a43b9b11b/.system_generated/steps/2310/output.txt';

try {
  const content = fs.readFileSync(path, 'utf8');
  const data = JSON.parse(content);
  const fileContent = data.files[0].content;
  
  const keyMatch = fileContent.match(/\"private_key\":\s*\"([^\"]*)\"/);
  if (keyMatch) {
    fs.writeFileSync('e:/agendamento/recovered_key.tmp.txt', keyMatch[1]);
    console.log('Key saved to recovered_key.tmp.txt');
  } else {
    console.log('Key not found');
  }
} catch (e) {
  console.error(e);
}
