import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import dns from "node:dns";

if (process.env.NODE_ENV === "development") {
  try {
    dns.setDefaultResultOrder("ipv4first");
  } catch (e) {}
}

export async function createClient() {
  const cookieStore = await cookies();

  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if middleware handles cookie refreshing.
          }
        },
      },
    }
  );

  if (process.env.NODE_ENV === "development") {
    // Avoid IPv6 fetch timeouts in local development on Windows
    client.auth.getUser = async () => {
      const { data, error } = await client.auth.getSession();
      return { data: { user: data.session?.user || null }, error } as any;
    };
  }

  return client;
}
