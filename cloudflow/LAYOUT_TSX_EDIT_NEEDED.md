# One manual edit needed: `app/layout.tsx`

I don't have this file, so I can't edit it directly — but the change is
small. Your root layout needs to wrap `{children}` in the
`AuthSessionProvider` from `components/AuthSessionProvider.tsx` (included in
this delivery), so `useSession()` in `page.tsx` actually works.

It should look something like this (adapt to whatever your actual
`layout.tsx` already has — just add the import and wrap the existing body
content):

```tsx
import { AuthSessionProvider } from '@/components/AuthSessionProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
```

If your `layout.tsx` already has other providers or wrappers in there
(theme providers, font setup, etc.), just nest `AuthSessionProvider` around
`{children}` alongside them — order relative to other providers doesn't
matter here.

Paste me your actual `layout.tsx` if you'd like me to make this edit
directly instead of doing it by hand.
