const fs = require('fs');
const path = require('path');

const OLD_DIR = 'D:/Vikas/OLD ARCHITECTURE/WORKING CODES/IVRM_Workingcode_Ganesh/IVRMStaging_141125/IVRMUX/wwwroot/app/modules/dashboard';

function analyzeFile(name) {
  const html = fs.readFileSync(path.join(OLD_DIR, `views/Exam/OnlineExam/${name}.html`), 'utf-8');
  const js = fs.readFileSync(path.join(OLD_DIR, `controllers/Exam/OnlineExam/${name}.js`), 'utf-8');

  console.log(`==================== ${name} ====================`);
  console.log('--- HTML Sections & Inputs ---');
  const inputMatches = html.match(/<(input|select|textarea)[^>]*>/g) || [];
  inputMatches.forEach(tag => {
    const nameMatch = tag.match(/name="([^"]+)"/);
    const modelMatch = tag.match(/ng-model="([^"]+)"/);
    const typeMatch = tag.match(/type="([^"]+)"/);
    const reqMatch = tag.includes('required');
    console.log(`  TAG: ${tag.substring(0, tag.indexOf(' '))} | name: ${nameMatch ? nameMatch[1] : ''} | model: ${modelMatch ? modelMatch[1] : ''} | type: ${typeMatch ? typeMatch[1] : ''} | required: ${reqMatch}`);
  });

  console.log('\n--- JS Scope Variables & Initial Setup ---');
  const jsLines = js.split('\n');
  jsLines.forEach(line => {
    if (line.includes('$scope.') && (line.includes('= function') || line.includes('apiService.'))) {
      console.log('  ' + line.trim());
    }
  });
}

['MasterQuestion', 'OnlineExamConfig', 'OnlineExam', 'OnlineExamReport', 'OnlineExamReport_New', 'MasterQuestionCollege', 'OnlineExamCollege'].forEach(analyzeFile);
