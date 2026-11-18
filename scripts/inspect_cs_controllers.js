const fs = require('fs');
const path = require('path');

const dir = 'D:/Vikas/OLD ARCHITECTURE/WORKING CODES/IVRM_Workingcode_Ganesh/IVRMStaging_141125/IVRMUX/Controllers/OnlineExam';
fs.readdirSync(dir).forEach(file => {
  if (file.endsWith('.cs')) {
    console.log('====================================');
    console.log('FILE:', file);
    console.log('====================================');
    const content = fs.readFileSync(path.join(dir, file), 'utf-8');
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      if (line.includes('[Route') || line.includes('[HttpPost') || line.includes('[HttpGet') || line.includes('[HttpDelete') || line.includes('[HttpPut') || line.includes('public ') && line.includes('(')) {
        console.log(`L${idx+1}: ${line.trim()}`);
      }
    });
  }
});
