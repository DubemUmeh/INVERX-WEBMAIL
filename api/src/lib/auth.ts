import 'dotenv/config';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { eq } from 'drizzle-orm';
import { db } from '../database/drizzle.js';
import * as schema from '../database/schema/index.js';
import { uuidv7 } from 'uuidv7';

const trustedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((url) => url.trim())
  : ([process.env.WEB_URL, process.env.APP_URL].filter(Boolean) as string[]);

console.log('[Better Auth Init] baseURL:', process.env.BETTER_AUTH_URL);
console.log('[Better Auth Init] trustedOrigins:', trustedOrigins);
console.log('[Better Auth Init] CORS_ORIGIN env:', process.env.CORS_ORIGIN);

// check the state of the NODE enviroment
const isProd = process.env.NODE_ENV === 'production';

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  advanced: {
    database: {
      generateId: () => uuidv7(),
    },
    defaultCookieAttributes: {
      ...(isProd && {
        domain: '.inverx.pro',
      }), // Share cookies across subdomains
      sameSite: isProd ? 'none' : 'lax',
      secure: isProd, // HTTPS only
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
    session: {
      create: {
        after: async (session) => {
          // Fire-and-forget login notification
          try {
            const userId = session.userId;
            // Look up user email
            const userResult = await db
              .select({ email: schema.users.email })
              .from(schema.users)
              .where(eq(schema.users.id, userId))
              .limit(1);

            const userEmail = userResult[0]?.email;
            if (!userEmail) return;

            const apiKey = process.env.BREVO_API_KEY;
            const senderEmail = process.env.BREVO_SENDER_EMAIL;
            const senderName = process.env.BREVO_SENDER_NAME || 'INVERX MAIL';

            if (!apiKey || !senderEmail) return;

            // Send login notification via Brevo API directly
            fetch('https://api.brevo.com/v3/smtp/email', {
              method: 'POST',
              headers: {
                'api-key': apiKey,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                sender: { email: senderEmail, name: senderName },
                to: [{ email: userEmail }],
                subject: 'New Sign-In to Your Account',
                htmlContent: `<h2>New Sign-In Detected</h2>
<p>Hello,</p>
<p>We detected a new sign-in to your INVERX account (<strong>${userEmail}</strong>).</p>
<p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
<p>If this wasn't you, please change your password immediately.</p>
<a href="https://inverx.pro/login" style="display:inline-block;padding:14px 32px;background-color:#111827;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;">Review Account</a>`,
              }),
            }).catch((err) =>
              console.error('[Auth] Login notification failed:', err.message),
            );
          } catch (err: any) {
            console.error('[Auth] Login notification hook error:', err.message);
          }
        },
      },
    },
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
