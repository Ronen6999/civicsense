// Create an administrator account. There is no public admin sign-up.
//
// Interactive:      npm run create-admin
// Non-interactive:  ADMIN_NAME="..." ADMIN_EMAIL="..." ADMIN_PASSWORD="..." npm run create-admin
import readline from 'node:readline';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { connectDatabase, disconnectDatabase } from '../config/db.js';
import { Admin } from '../models/Admin.js';

function ask(question, { hidden = false } = {}) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) {
      // Mute echoed characters while the password is typed.
      rl._writeToOutput = (str) => {
        if (str.includes(question)) rl.output.write(str);
      };
    }
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write('\n');
      resolve(answer);
    });
  });
}

const inputSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.').max(100),
  email: z.string().trim().toLowerCase().email('Enter a valid email.'),
  password: z
    .string()
    .min(10, 'Password must be at least 10 characters.')
    .max(128, 'Password must be at most 128 characters.'),
});

async function main() {
  const raw = {
    name: process.env.ADMIN_NAME ?? (await ask('Name: ')),
    email: process.env.ADMIN_EMAIL ?? (await ask('Email: ')),
    password: process.env.ADMIN_PASSWORD ?? (await ask('Password (min 10 chars): ', { hidden: true })),
  };

  const parsed = inputSchema.safeParse(raw);
  if (!parsed.success) {
    console.error(parsed.error.issues.map((i) => `- ${i.message}`).join('\n'));
    process.exitCode = 1;
    return;
  }
  const { name, email, password } = parsed.data;

  await connectDatabase();
  try {
    if (await Admin.exists({ email })) {
      console.error(`An admin with email ${email} already exists.`);
      process.exitCode = 1;
      return;
    }
    const passwordHash = await bcrypt.hash(password, 12);
    await Admin.create({ name, email, passwordHash });
    console.log(`Admin created: ${email}`);
  } finally {
    await disconnectDatabase();
  }
}

main().catch((err) => {
  console.error('Failed to create admin:', err.message);
  process.exit(1);
});
