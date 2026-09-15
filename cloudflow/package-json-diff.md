Add these to your existing `package.json` `dependencies` block
(everything else stays exactly as it is):

```json
"mongodb": "^6.9.0",
"next-auth": "^5.0.0-beta.25",
"bcryptjs": "^2.4.3",
"resend": "^4.0.0"
```

Install with:

```
npm install mongodb next-auth@beta bcryptjs resend
```

Note the explicit `@beta` tag on next-auth — `next-auth@latest` still
resolves to the older v4, which doesn't work the way `auth.ts` here is
written.

`bcryptjs` (pure JS) rather than `bcrypt` (native, needs a C++ build step)
— avoids Windows node-gyp build issues, which matter given you're
developing directly on the Windows laptop.

You do NOT need express, cors, pg, or a separate tsconfig for a backend —
those all go away. The Route Handlers below run inside Next.js's existing
build/runtime.
