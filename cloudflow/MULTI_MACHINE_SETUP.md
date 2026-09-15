# Multi-Machine Support

## What changed conceptually

Every session, transaction, and tunnel host is now scoped to a specific
`machineId` instead of there being one global "the VM." A `machines`
collection holds each laptop's name, status (`active`/`disabled`), current
tunnel host, and its own unique `tunnelReportKey`.

**The old shared `TUNNEL_REPORT_KEY` env var is gone.** Each machine gets
its own key, generated once when an admin creates it through the UI (via
the new `MachineSelector` component's admin panel), shown exactly once at
creation time, and never retrievable again afterward — same principle as a
cloud provider showing you an API key once. If a laptop's key is lost, the
fix is deleting that machine record and creating a new one (with a new
key), not trying to recover the old one.

## New environment variable

```
ADMIN_EMAILS=you@gmail.com
```

Separate from `ALLOWED_EMAILS` — being on `ALLOWED_EMAILS` lets someone use
the app; being on `ADMIN_EMAILS` additionally lets them add/rename/disable/
delete machines. An admin should also be on `ALLOWED_EMAILS`, or they can
manage machines but never actually start a session themselves.

**Caveat worth knowing:** admin status is baked into the login JWT at
sign-in time, not re-checked on every request. If you add someone to
`ADMIN_EMAILS` after they've already logged in, they won't see admin
controls until they sign out and back in. (Same caveat already existed for
`ALLOWED_EMAILS` — it's re-checked at login, not per-request either.)

## Each laptop's reporter script needs its own key now

`run-cloudflared-tunnel.ps1`'s `$TunnelKey` variable should be set to the
key shown when that specific machine was created in the admin panel — not
a shared value copied across all laptops. Each laptop identifies itself to
the backend purely by which key it sends; there's no separate machine ID to
configure on the laptop side at all.

## What I could NOT safely finish: wiring this into `page.tsx`

`page.tsx` has been edited many times over this conversation, and a
previous round already showed my copy and your actual file drifting out of
sync in a way that wasted a build cycle. Rather than repeat that with a
change this structural (adding a whole new "pick a machine" step before the
existing landing/workspace views), **please paste me your current actual
`page.tsx`** and I'll do the integration directly against what's really on
disk, rather than handing you instructions to apply by hand against a file
I can't see.

Conceptually, what needs to happen there:
- A new piece of state, `selectedMachineId`, set by `<MachineSelector
  onSelect={...} />` before the existing landing/workspace flow applies.
- Every call to `fetchSession`, `startSession`, `extendSession`,
  `debugSession`, and `fetchTunnelHost` needs `selectedMachineId` passed in
  as the first argument now (their signatures changed — see the updated
  `lib/api.ts`).
- A way to go back to the machine picker (e.g. a "Switch machine" button),
  since a classmate might want to check other machines' availability.
