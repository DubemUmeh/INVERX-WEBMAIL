import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL, // Points to NestJS API
});

export const { signIn, signUp, useSession } = authClient;
