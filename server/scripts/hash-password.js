const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password || password.length < 10) {
  console.error('Usage: npm run hash-password -- "a password of 10+ characters"');
  process.exit(1);
}

// Put the output in ADMIN_PASSWORD_HASH. Wrap it in single quotes in .env: the hash contains $ characters.
console.log(bcrypt.hashSync(password, 12));
