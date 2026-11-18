const fs = require('fs');
const path = require('path');

const OLD_DIR = 'D:/Vikas/OLD ARCHITECTURE/WORKING CODES/IVRM_Workingcode_Ganesh/IVRMStaging_141125/IVRMUX/wwwroot/app/modules/dashboard';
const viewsDir = path.join(OLD_DIR, 'views/Exam/OnlineExam');
const ctrlDir = path.join(OLD_DIR, 'controllers/Exam/OnlineExam');

console.log('=== ANALYZING EXAM ONLINE EXAM VIEWS & CONTROLLERS ===\n');

const files = [
  'MasterQuestion',
  'OnlineExamConfig',
  'OnlineExam',
  'OnlineExamReport',
  'OnlineExamReport_New',
  'MasterQuestionCollege',
  'OnlineExamCollege'
];

files.forEach(name => {
  console.log(`\n================== ${name} ==================`);
  const htmlPath = path.join(viewsDir, `${name}.html`);
  const jsPath = path.join(ctrlDir, `${name}.js`);

  if (fs.existsSync(htmlPath)) {
    const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
    console.log(`HTML size: ${htmlContent.length} bytes, lines: ${htmlContent.split('\n').length}`);
    
    // Check form fields and tabs
    const tabs = htmlContent.match(/<uib-tab[^>]*heading="([^"]+)"/g) || htmlContent.match(/<md-tab[^>]*label="([^"]+)"/g) || [];
    console.log('Tabs:', tabs.map(t => t.replace(/<[^>]+heading="([^"]+)"/g, '$1')));
    
    // Form names
    const forms = htmlContent.match(/<form[^>]+name="([^"]+)"/g) || [];
    console.log('Forms:', forms);

    // Inputs/Selects
    const models = [...new Set((htmlContent.match(/ng-model="([^"]+)"/g) || []).map(m => m.replace('ng-model="', '').replace('"', '')))];
    console.log('Models count:', models.length, 'Sample models:', models.slice(0, 15));
  }

  if (fs.existsSync(jsPath)) {
    const jsContent = fs.readFileSync(jsPath, 'utf-8');
    console.log(`JS size: ${jsContent.length} bytes, lines: ${jsContent.split('\n').length}`);
    
    // Scope functions
    const funcs = [...new Set((jsContent.match(/\$scope\.([a-zA-Z0-9_]+)\s*=\s*function/g) || []).map(f => f.replace(/\$scope\./, '').replace(/\s*=\s*function/, '')))];
    console.log('Scope functions:', funcs);
  }
});
