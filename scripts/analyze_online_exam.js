const fs = require('fs');
const path = require('path');

const OLD_BASE = 'D:/Vikas/OLD ARCHITECTURE/WORKING CODES/IVRM_Workingcode_Ganesh/IVRMStaging_141125';
const dashApp = path.join(OLD_BASE, 'IVRMUX/wwwroot/app/modules/dashboard/dashboardApplication.js');

const content = fs.readFileSync(dashApp, 'utf-8');
const lines = content.split('\n');

console.log('=== ONLINE EXAM STATES IN DASHBOARD APPLICATION ===');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("$stateProvider.state('app.OnlineExam'") || 
      lines[i].includes("$stateProvider.state('app.MasterQuestion'") ||
      lines[i].includes("$stateProvider.state('app.OnlineExamConfig'") ||
      lines[i].includes("$stateProvider.state('app.OnlineExamReport'") ||
      lines[i].includes("$stateProvider.state('app.OnlineExamReport_New'") ||
      lines[i].includes("$stateProvider.state('app.MasterQuestionCollege'") ||
      lines[i].includes("$stateProvider.state('app.OnlineExamCollege'")) {
    console.log(`\nState at Line ${i + 1}:`);
    for (let j = i; j <= Math.min(i + 14, lines.length - 1); j++) {
      console.log('  ' + lines[j].trim());
    }
  }
}
