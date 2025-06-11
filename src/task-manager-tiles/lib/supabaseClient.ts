import { type CookieOptions, createBrowserClient, createServerClient } from '@supabase/ssr';
import { type ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'; // For server client
// We don't need NextRequest/NextResponse here anymore if createSupabaseMiddlewareClient is removed
// import { type NextRequest, type NextResponse } from 'next/server'; 

// Ensure environment variables are defined (only once)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Environment variable NEXT_PUBLIC_SUPABASE_URL is not set.");
}
if (!supabaseAnonKey) {
  throw new Error("Environment variable NEXT_PUBLIC_SUPABASE_ANON_KEY is not set.");
}

// --- Client for use in Client Components (Browser) ---
export const createSupabaseBrowserClient = () => {
  return createBrowserClient(
    supabaseUrl!,
    supabaseAnonKey!
  );
};

// --- Client for use in Server Components, Route Handlers, and Server Actions ---
export const createSupabaseServerClient = (cookieStore: ReadonlyRequestCookies) => {
  return createServerClient(
    supabaseUrl!,
    supabaseAnonKey!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set(name, value, options);
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set(name, '', options);
        },
      },
    }
  );
};

// Note: 
// - `createSupabaseMiddlewareClient` has been removed from this file. 
//   Middleware-specific client setup will be handled directly in the middleware file.
// - The original `export const supabase = createClient(...)` is removed.
// You will now import and use one of the functions above based on the context:
// - `createSupabaseBrowserClient()` in Client Components.
// - `createSupabaseServerClient(cookies())` in Server Components/Actions (where `cookies()` is from `next/headers`).
