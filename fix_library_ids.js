const fs = require('fs');
let file = fs.readFileSync('server/common.ts', 'utf8');

// Find the index of name: 'Library' and then the next name: 'Transport' to bounds the replacement.
const startIdx = file.indexOf(`name: 'Library',`);
const endIdx = file.indexOf(`name: 'Transport',`, startIdx);

if (startIdx !== -1 && endIdx !== -1) {
    let block = file.substring(startIdx, endIdx);

    // Within this block, replace the specific sub_menu ids
    block = block.replace(/id:\s*3000,/g, 'id: 7000,\n');
    block = block.replace(/id:\s*2,\s*name:\s*'Transactions'/g, `id: 7001,\n                                    name: 'Transactions'`);
    block = block.replace(/id:\s*3,\s*name:\s*'Reports'/g, `id: 7002,\n                                    name: 'Reports'`);
    // replace page ids: 300XX -> 700XX
    block = block.replace(/id:\s*300(\d\d),/g, 'id: 700$1,');

    // fix spelling
    block = block.replace(/name:\s*'masters',/g, "name: 'Masters',");

    file = file.substring(0, startIdx) + block + file.substring(endIdx);
    fs.writeFileSync('server/common.ts', file, 'utf8');
    console.log('Successfully updated Library module IDs in common.ts');
} else {
    console.log('Could not find bounds');
}
