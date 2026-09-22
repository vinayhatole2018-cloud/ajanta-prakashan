import path from "node:path";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  outputFileTracingRoot: path.join(__dirname),

  eslint: {
    ignoreDuringBuilds: false,
  },

  // Static export: every route in this app is a client component that
  // fetches its own data at runtime (Firestore), including the two former
  // dynamic routes (now ?id=-based — see /conferences/view and
  // /admin/conferences/edit) — so a plain static export works with no
  // server needed. This is what lets the app deploy to Firebase's free
  // Spark plan; Next.js SSR on Firebase requires the paid Blaze plan
  // (Cloud Functions/Cloud Run), which this project doesn't need.
  //
  // Static export can't run next.config's headers()/redirects()/rewrites()
  // (no server to run them on) — the admin no-cache headers this used to
  // set here now live in firebase.json's hosting.headers instead.
  output: "export",
};

export default nextConfig;
