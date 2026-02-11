import 'dotenv/config';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '../database/drizzle.js';
import * as schema from '../database/schema/index.js';
import { uuidv7 } from 'uuidv7';

const trustedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((url) => url.trim())
  : ([process.env.WEB_URL, process.env.APP_URL].filter(Boolean) as string[]);

console.log('[Better Auth Init] baseURL:', process.env.BETTER_AUTH_URL);
console.log('[Better Auth Init] trustedOrigins:', trustedOrigins);
console.log('[Better Auth Init] CORS_ORIGIN env:', process.env.CORS_ORIGIN);

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  advanced: {
    database: {
      generateId: () => uuidv7(),
    },
    cookieOptions: {
      domain: process.env.COOKIE_DOMAIN,
    },
  },

  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      users: schema.users,
      sessions: schema.sessions,
      authAccounts: schema.authAccounts,
      verifications: schema.verifications,
    },
  }),
  user: {
    modelName: 'users',
    fields: {
      emailVerified: 'isVerified',
      image: 'avatarUrl',
      name: 'fullName',
    },
  },
  session: {
    modelName: 'sessions',
  },
  account: {
    modelName: 'authAccounts',
  },
  verification: {
    modelName: 'verifications',
  },
  emailAndPassword: {
    enabled: true,
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // Create a default account for the new user
          const [account] = await db
            .insert(schema.accounts)
            .values({
              name: `${user.fullName || (user as any).name || 'My'}'s Account`,
              slug: `${String(user.fullName || (user as any).name || 'personal')
                .toLowerCase()
                .replace(/\s+/g, '-')}-${uuidv7().slice(0, 8)}`,
              ownerId: user.id,
            })
            .returning();

          // Add user as owner member
          await db.insert(schema.accountMembers).values({
            accountId: account.id,
            userId: user.id,
            role: 'owner',
          });
        },
      },
    },
  },
  trustedOrigins,
});
