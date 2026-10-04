require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const fs = require('fs'), path = require('path');
const { migrate } = require('./db');
migrate(fs.readFileSync(path.join(__dirname, '../../database/schema.sql'), 'utf8'))
  .then(() => { console.log('Schema applied.'); process.exit(0); })
  .catch(e => { console.error('Migration failed:', e.message); process.exit(1); });
