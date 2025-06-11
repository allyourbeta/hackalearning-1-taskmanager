'use client'; // Important: Mark this as a Client Component

import { useEffect } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared'; // A pre-built theme
import { useRouter } from 'next/navigation'; // For redirecting after login
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';

export default function LoginPage() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        // User is logged in, redirect to home page or dashboard
        router.push('/'); // Or any other page you want to redirect to
      }
    });

    // Cleanup subscription on unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase, router]);

  return (
    <div style={{ maxWidth: '420px', margin: '96px auto' }}>
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        providers={['google']} // Only show Google provider
        redirectTo={`${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`} // Your site's callback URL
        localization={{
            variables: {
              sign_in: {
                social_provider_text: 'Sign in with {{provider}}',
              },
            },
          }}
      />
    </div>
  );
}
