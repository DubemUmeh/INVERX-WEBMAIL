import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '../database/drizzle.js';
import * as schema from '../database/schema/index.js';
import { v7 as uuidv7 } from 'uuid';

const { APP_URL, WEB_URL } = process.env;

export const auth = betterAuth({
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
  trustedOrigins: [`${WEB_URL}`, `${APP_URL}`],
});
