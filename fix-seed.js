const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, 'backend/prisma/seed.js');
let code = fs.readFileSync(seedPath, 'utf8');

// Replace array properties
code = code.replace(/specializations:\s+(\[[^\]]+\]),/g, 'specializations: JSON.stringify($1),');
code = code.replace(/languages:\s+(\[[^\]]+\]),/g, 'languages: JSON.stringify($1),');
code = code.replace(/session_types:\s+(\[[^\]]+\]),/g, 'session_types: JSON.stringify($1),');

// Replace availability_json
code = code.replace(/availability_json:\s+({[\s\S]*?})\s*[\n\r]*\s*\},/g, 'availability_json: JSON.stringify($1),\n    },');

fs.writeFileSync(seedPath, code);
console.log('Seed file successfully patched for SQLite!');
