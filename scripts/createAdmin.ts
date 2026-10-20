import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });
dotenv.config({ path: resolve(process.cwd(), '.env') });

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import readline from 'readline';
import { Admin } from '../lib/models/Admin';
import { AuditLog } from '../lib/models/AuditLog';

async function promptInput(query: string, hidden = false): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    if (!hidden) {
      rl.question(query, (ans) => {
        rl.close();
        resolve(ans.trim());
      });
    } else {
      // Masking password input
      process.stdout.write(query);
      let text = '';
      process.stdin.setRawMode?.(true);
      process.stdin.resume();
      process.stdin.setEncoding('utf-8');

      const onData = (char: string) => {
        if (char === '\n' || char === '\r' || char === '\u0004') {
          process.stdin.setRawMode?.(false);
          process.stdin.pause();
          process.stdin.removeListener('data', onData);
          console.log('');
          rl.close();
          resolve(text.trim());
        } else if (char === '\u0003') {
          // Ctrl+C
          process.exit(1);
        } else if (char === '\b' || char === '\x7f') {
          if (text.length > 0) {
            text = text.slice(0, -1);
            process.stdout.write('\b \b');
          }
        } else {
          text += char;
          process.stdout.write('*');
        }
      };

      process.stdin.on('data', onData);
    }
  });
}

async function main() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('❌ MONGODB_URI environment variable is missing in .env.local');
    process.exit(1);
  }

  console.log('\n======================================================');
  console.log('🎞️  SHUTTERSCAPE // ADMIN CREATION & RECOVERY SUITE  🎞️');
  console.log('======================================================\n');

  // Positional arguments support: npx tsx scripts/createAdmin.ts <email> <password> <name>
  const args = process.argv.slice(2);
  let email = args[0] || process.env.ADMIN_INITIAL_EMAIL;
  let password = args[1] || process.env.ADMIN_INITIAL_PASSWORD;
  let name = args[2] || process.env.ADMIN_INITIAL_NAME;

  if (!email) {
    email = await promptInput('Enter Admin Email: ');
  }
  if (!name) {
    name = (await promptInput('Enter Admin Name (e.g. Master Curator): ')) || 'ShutterScape Curator';
  }
  if (!password) {
    password = await promptInput('Enter Admin Password (min 8 chars): ', true);
  }

  if (!email || !email.includes('@')) {
    console.error('❌ Invalid email address.');
    process.exit(1);
  }

  if (!password || password.length < 8) {
    console.error('❌ Password must be at least 8 characters long.');
    process.exit(1);
  }

  console.log('\n[1/3] Connecting to MongoDB Vault...');
  await mongoose.connect(mongoUri);
  console.log('✓ Database connected.');

  console.log('[2/3] Generating salted bcrypt hash (rounds = 12)...');
  const passwordHash = await bcrypt.hash(password, 12);

  console.log('[3/3] Saving admin credentials...');
  const normalizedEmail = email.toLowerCase().trim();

  let admin = await Admin.findOne({ email: normalizedEmail });

  if (admin) {
    console.log(`ℹ️ Admin with email "${normalizedEmail}" already exists. Updating password & clearing lockout...`);
    admin.name = name;
    admin.passwordHash = passwordHash;
    admin.failedAttempts = 0;
    admin.lockUntil = null;
    await admin.save();
    console.log('✓ Existing Admin credentials updated successfully.');
  } else {
    admin = await Admin.create({
      email: normalizedEmail,
      name,
      passwordHash,
      failedAttempts: 0,
      lockUntil: null,
    });
    console.log(`✓ New Admin created successfully: ID ${admin._id}`);
  }

  // Audit Log
  await AuditLog.create({
    adminId: admin._id,
    action: 'update',
    entity: 'Auth',
    entityId: admin._id.toString(),
    details: {
      action: 'admin_cli_provisioned',
      email: normalizedEmail,
      name,
    },
    ipAddress: '127.0.0.1 (CLI)',
  });

  console.log('\n======================================================');
  console.log('✅ ADMIN ACCESS PROVISIONED SUCCESSFULLY!');
  console.log(`   Email: ${normalizedEmail}`);
  console.log(`   Name:  ${name}`);
  console.log('   Status: Unlocked & Active');
  console.log('======================================================\n');

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Admin creation failed:', err);
  mongoose.disconnect();
  process.exit(1);
});
