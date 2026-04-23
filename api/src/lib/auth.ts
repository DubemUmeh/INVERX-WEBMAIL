import 'dotenv/config';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { eq } from 'drizzle-orm';
import { db } from '../database/drizzle.js';
import * as schema from '../database/schema/index.js';
import { uuidv7 } from 'uuidv7';

const isProd = process.env.NODE_ENV === 'production';

function resolveCookieDomain() {
  const configuredDomain = process.env.AUTH_COOKIE_DOMAIN?.trim();
  if (configuredDomain) return configuredDomain;

  const baseUrl = process.env.BETTER_AUTH_URL?.trim();
  if (!baseUrl) return undefined;

  try {
    const { hostname } = new URL(baseUrl);
    if (
      hostname === 'inverx.pro' ||
      hostname === 'www.inverx.pro' ||
      hostname.endsWith('.inverx.pro')
    ) {
      return '.inverx.pro';
    }
  } catch {
    return undefined;
  }

  return undefined;
}

function resolveSecureCookie() {
  const explicit = process.env.AUTH_COOKIE_SECURE?.trim().toLowerCase();
  if (explicit === 'true') return true;
  if (explicit === 'false') return false;

  const baseUrl = process.env.BETTER_AUTH_URL?.trim();
  if (!baseUrl) return isProd;

  try {
    return new URL(baseUrl).protocol === 'https:';
  } catch {
    return isProd;
  }
}

const cookieDomain = resolveCookieDomain();
const secureCookie = resolveSecureCookie();

// Build trusted origins - must include all frontend domains for cross-domain auth
const trustedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((url) => url.trim())
  : [
      process.env.WEB_URL,
      process.env.APP_URL,
      process.env.NEXT_PUBLIC_WEB_ORIGIN,
      process.env.NEXT_PUBLIC_APP_ORIGIN,
      'https://inverx.pro',
      'https://www.inverx.pro',
      'https://app.inverx.pro',
    ]
      .filter(Boolean)
      .map((url) => String(url).trim()) as string[];

console.log('[Better Auth Init] baseURL:', process.env.BETTER_AUTH_URL);
console.log('[Better Auth Init] trustedOrigins:', trustedOrigins);
console.log('[Better Auth Init] NODE_ENV:', process.env.NODE_ENV);
console.log('[Better Auth Init] cookieDomain:', cookieDomain);
console.log('[Better Auth Init] secureCookie:', secureCookie);

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  advanced: {
    database: {
      generateId: () => uuidv7(),
    },
    defaultCookieAttributes: {
      // Share session cookie across inverx.pro, www.inverx.pro, app.inverx.pro and api.inverx.pro
      domain: cookieDomain,
      path: '/',
      // Subdomains are same-site; lax avoids unnecessary third-party cookie restrictions.
      sameSite: 'lax',
      secure: secureCookie,
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
