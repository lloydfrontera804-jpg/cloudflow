# Email + Password Auth Setup (with password reset)

No external OAuth console needed for login itself — that's entirely
self-contained in your own Mongo database. Password reset is the one part
that needs an external service, because proving someone owns an email
address requires actually emailing them something.

## 1. Environment variables

Add to `.env.local` (and later Render):

```
AUTH_SECRET=<random string — generate with: npx auth secret>
ALLOWED_EMAILS=you@gmail.com,classmate1@gmail.com,classmate2@gmail.com
RESEND_API_KEY=<from resend.com — see step 2 below>
RESEND_FROM_EMAIL=onboarding@resend.dev
APP_URL=http://localhost:3000
```

`ALLOWED_EMAILS` is the access gate — checked both when someone tries to
**register** (`/api/auth/register`) and again every time they **log in**
(`auth.ts`'s `authorize()`). Removing an email from this list and
redeploying revokes that person's access on their next login attempt, even
if they already have an account.

`APP_URL` is used to build the actual reset link sent in the email
(`${APP_URL}/reset-password?token=...`) — set it to
`https://your-app.onrender.com` once deployed, or emailed links will point
at localhost and nobody but you can click them.

## 2. Resend setup (for password reset emails)

1. Sign up at https://resend.com (free, no card required — 3,000
   emails/month, 100/day, plenty for a handful of classmates).
2. **API Keys > Create API Key** — copy it into `RESEND_API_KEY`.
3. You do NOT need to verify your own domain to get started —
   `onboarding@resend.dev` (Resend's own test sender) works out of the box
   for `RESEND_FROM_EMAIL`. It may land in spam for some recipients since
   it's a shared sender; verifying your own domain later (Resend >
   Domains > Add, then adding the DNS records they show) fixes that if it
   becomes a real problem.
4. That's it — no inbound email setup, no webhook config. This app only
   ever sends, never receives.

## 3. How accounts actually get created

There's no admin panel — classmates create their own account by using the
"Need an account?" toggle in the sign-in bar, entering an email that's on
`ALLOWED_EMAILS`, and picking a password (min 8 characters). Passwords are
hashed with bcrypt before storage — the plaintext password is never saved
anywhere.

If someone tries to register with an email not on the list, they get a
deliberately vague "not authorized" error — it doesn't confirm or deny
whether that specific email is expected, so this endpoint can't be used to
figure out who else is on the allow-list.

## 4. How password reset works

1. Classmate clicks "Forgot password?" in the sign-in bar, enters their
   email.
2. Backend generates a random token, stores only its SHA-256 hash in a
   `passwordResetTokens` collection (so a database leak alone can't be used
   to reset anyone's password), and emails a link containing the plaintext
   token.
3. The response to the "forgot password" request is identical whether or
   not that email has an account — this prevents using the endpoint to
   check who's registered.
4. The link goes to `/reset-password?token=...`, a standalone page where
   they set a new password. The token is single-use and expires after 30
   minutes; Mongo automatically deletes expired token documents via a TTL
   index, so there's no cleanup job to run.

## 5. What's genuinely NOT covered by this

- **No email verification at signup.** The `ALLOWED_EMAILS` check is the
  only gate at registration time — nobody has to click a confirmation link
  to prove they own the email they signed up with. Acceptable given you
  already personally know who's on that list; if someone typos their own
  email at signup, they simply won't be able to receive a password reset
  later, which is a self-correcting problem (they'd just re-register).
- **No rate limiting on login/register/forgot-password attempts.** Not a
  real concern for a small trusted group, but worth knowing if this ever
  got a public link shared somewhere it shouldn't be — someone could spam
  the forgot-password endpoint and burn through your Resend daily quota.
- **If `RESEND_API_KEY` is wrong or missing, forgot-password fails
  silently from the user's perspective** — they still see "check your
  email," and the actual error only shows up in your server logs (Render's
  dashboard, or your terminal in dev). This is intentional for the
  legitimate "email doesn't exist" case, but means a broken Resend key
  looks identical to normal behavior unless you're watching logs. Worth
  actually checking your logs the first time you test this end to end.
