import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";

const authBaseURL =
  typeof window !== "undefined"
    ? `${window.location.origin}/api/auth`
    : process.env.NEXT_PUBLIC_SITE_URL
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}/api/auth`
        : "http://localhost:3000/api/auth";

export const authClient = createAuthClient({
  baseURL: authBaseURL,
  plugins: [emailOTPClient()],
});
