import 'dotenv/config';
import bcrypt from 'bcrypt';
import db, { newId } from '../db.js';

async function run() {
  const email = process.argv[2];
  const password = process.argv[3];
  if (!email || !password) {
    console.log('Usage: npm run create-admin -- you@example.com strong_password');
    process.exit(1);
  }

  const id = newId();
  const password_hash = await bcrypt.hash(password, 12);

  try {
    db.prepare('INSERT INTO users (id, email, password_hash, role, status, created_at) VALUES (?, ?, ?, ?, ?, ?)')
      .run(id, email.toLowerCase(), password_hash, 'admin', 'approved', new Date().toISOString());
    console.log('Admin created:', email);
  } catch (e) {
    console.error('Failed to create admin:', e.message);
    process.exit(1);
  }
}

run();import 'dotenv/config';
import bcrypt from 'bcrypt';
import db, { newId } from '../db.js';

async function run() {
  const email = process.argv[2];
  const password = process.argv[3];
  if (!email || !password) {
    console.log('Usage: npm run create-admin -- you@example.com strong_password');
    process.exit(1);
  }

  const id = newId();
  const password_hash = await bcrypt.hash(password, 12);

  try {
    db.prepare('INSERT INTO users (id, email, password_hash, role, status, created_at) VALUES (?, ?, ?, ?, ?, ?)')
      .run(id, email.toLowerCase(), password_hash, 'admin', 'approved', new Date().toISOString());
    console.log('Admin created:', email);
  } catch (e) {
    console.error('Failed to create admin:', e.message);
    process.exit(1);
  }
}

run();import 'dotenv/config';
import bcrypt from 'bcrypt';
import db, { newId } from '../db.js';

async function run() {
  const email = process.argv[2];
  const password = process.argv[3];
  if (!email || !password) {
    console.log('Usage: npm run create-admin -- you@example.com strong_password');
    process.exit(1);
  }

  const id = newId();
  const password_hash = await bcrypt.hash(password, 12);

  try {
    db.prepare('INSERT INTO users (id, email, password_hash, role, status, created_at) VALUES (?, ?, ?, ?, ?, ?)')
      .run(id, email.toLowerCase(), password_hash, 'admin', 'approved', new Date().toISOString());
    console.log('Admin created:', email);
  } catch (e) {
    console.error('Failed to create admin:', e.message);
    process.exit(1);
  }
}

run();