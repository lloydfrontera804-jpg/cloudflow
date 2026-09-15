'use client';

// Next.js 16 auto-generates a default global-error page when this file
// doesn't exist, and that default has a known build-breaking bug: it
// renders completely outside app/layout.tsx (so AuthSessionProvider never
// wraps it) but still touches React context internally, which crashes
// during prerendering with "Cannot read properties of null (reading
// 'useContext')". Providing this file replaces Next's broken default.
//
// This component MUST be fully self-contained — no imports of anything
// that depends on context (no next-auth hooks, no other providers) since
// none of app/layout.tsx's wrapping exists when this actually renders.

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ background: '#09090b', color: '#e4e4e7', fontFamily: 'sans-serif' }}>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Something went wrong</h1>
          <p style={{ color: '#a1a1aa', marginBottom: '1.5rem' }}>An unexpected error occurred. You can try again below.</p>
          <button
            onClick={() => reset()}
            style={{ padding: '0.5rem 1.25rem', borderRadius: '0.5rem', background: '#2563eb', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
