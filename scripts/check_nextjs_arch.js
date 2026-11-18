const fs = require('fs');
const path = require('path');

console.log('=== CHECKING NEXT.JS PROJECT ARCHITECTURE ===');

// Check server directory structure
const serverDir = path.join(__dirname, '../server');
console.log('Server directories:', fs.existsSync(serverDir) ? fs.readdirSync(serverDir) : 'None');

const examServerDir = path.join(serverDir, 'exam');
if (fs.existsSync(examServerDir)) {
  console.log('Exam server directories:', fs.readdirSync(examServerDir));
}

// Check types directory
const typesDir = path.join(__dirname, '../types');
console.log('Types directories:', fs.existsSync(typesDir) ? fs.readdirSync(typesDir) : 'None');

const examTypesDir = path.join(typesDir, 'exam');
if (fs.existsSync(examTypesDir)) {
  console.log('Exam types directories:', fs.readdirSync(examTypesDir));
}

// Check hooks directory
const hooksDir = path.join(__dirname, '../hooks');
console.log('Hooks directories:', fs.existsSync(hooksDir) ? fs.readdirSync(hooksDir) : 'None');

const examHooksDir = path.join(hooksDir, 'exam');
if (fs.existsSync(examHooksDir)) {
  console.log('Exam hooks directories:', fs.readdirSync(examHooksDir));
}

// Check existing Exam app routes
const examAppDir = path.join(__dirname, '../app/(root)/Exam/exam-module');
if (fs.existsSync(examAppDir)) {
  console.log('Exam app directories:', fs.readdirSync(examAppDir));
}
