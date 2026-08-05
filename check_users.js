import { db } from './server/config/db.js';

async function listAdmins() {
  const usersSnapshot = await db.ref('users').once('value');
  const users = usersSnapshot.val() || {};
  
  for (const [key, user] of Object.entries(users)) {
    console.log(`User: ${user.name}, Email: ${user.email}, Role: ${user.role}`);
  }
  process.exit(0);
}
listAdmins();
