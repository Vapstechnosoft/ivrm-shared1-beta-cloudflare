const fs = require('fs');
const path = require('path');

const basePath = 'D:/Vikas/OLD ARCHITECTURE/WORKING CODES/IVRM_Workingcode_Ganesh/IVRMStaging_141125/IVRMUX/wwwroot/app/modules/dashboard';

const dirs = [
  'controllers/Exam/OnlineExam',
  'controllers/NAAC/LP_OnlineExam',
  'controllers/registration/PAOnlineExam'
];

dirs.forEach(dir => {
  console.log('==============================================');
  console.log('=== ' + dir + ' ===');
  console.log('==============================================');
  const full = path.join(basePath, dir);
  if (fs.existsSync(full)) {
    fs.readdirSync(full).forEach(f => {
      if (!f.endsWith('.js')) return;
      const content = fs.readFileSync(path.join(full, f), 'utf-8');
      const lines = content.split('\n');
      const apiLines = lines.filter(l => l.includes('apiService.') || l.includes('api/'));
      console.log(`\n--- ${f} (${lines.length} lines) ---`);
      apiLines.slice(0, 15).forEach(l => console.log('  ' + l.trim()));
    });
  }
});
