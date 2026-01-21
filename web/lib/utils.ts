import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function setAuthCookie(token: string) {
  // Set cookie for localhost: (covers both port 1000 and 2000)
  document.cookie = `auth_token=${token}; path=/; domain=localhost:; samesite=Lax; max-age=86400`;
}
