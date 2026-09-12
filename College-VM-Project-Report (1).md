# College Project Report: Remote AI Workspace (GPT Astra VM Access)

## 1. What This Project Is

A website that lets classmates remotely control a real laptop over the internet through their browser, use it for a set amount of time, and get warned/locked out when their time is up — with an option to "pay" to extend. This is a **college project for testing among classmates**, not a public commercial service.

## 2. Plain-English Explanation of How It Works

Think of it like this: your friend's laptop is the "computer for rent." Your website is the "front desk" that manages who gets to use it and for how long. The two are connected by a chain of small tools, each doing one job:

| Piece | Plain-English job |
|---|---|
| **TightVNC** | Software installed on the laptop that lets another computer see and control its screen, mouse, and keyboard — like a lock that only opens with a password. |
| **websockify** | A translator. Web browsers can't speak the VNC "language" directly, so this converts VNC's signal into a format browsers understand (called WebSocket). |
| **Cloudflare Tunnel (cloudflared)** | Since the laptop sits behind a home Wi-Fi router with no public address, this creates a secure outbound "tunnel" from the laptop to the internet, generating a public web link that reaches it — without needing to open ports on the router (which would be a real security risk). |
| **noVNC** | The actual on-screen viewer/controller that runs inside the website itself, so classmates see and use the remote laptop's screen right there in the browser — no extra software needed on their end. |
| **Next.js** | The framework the website itself (front-end) is built with. |

**The chain, in order:** Browser (classmate) → website (Next.js) → noVNC viewer embedded in the page → Cloudflare Tunnel → websockify → TightVNC → the actual laptop screen.

## 3. Step-by-Step: What We Actually Set Up

1. Installed **TightVNC Server** on the laptop and set a password.
2. Installed **websockify** (a Python package: `pip install websockify`) and ran it to bridge VNC to WebSocket: `websockify 6080 localhost:5900`
3. Installed **cloudflared** (not a Python package — a standalone program downloaded directly from Cloudflare's GitHub releases) and ran a tunnel to make the VNC connection reachable from anywhere: `cloudflared tunnel --url http://localhost:6080`
4. Downloaded **noVNC** and placed it in the website's `public/novnc/` folder, so the browser-based viewer is served directly by the website.
5. Connected the website's "VM Viewer" panel to that noVNC page via an iframe, passing in the tunnel address and VNC password through environment variables (`.env.local`) rather than hardcoding them in the code.
6. Fixed a Next.js 16 config warning (`allowedDevOrigins`) so the site works correctly when opened from other devices on the network, not just the laptop itself.
7. Added `resize=scale` so the remote screen fills the viewing window fully instead of showing a cropped section.
8. Tested successfully: connected from the laptop itself, from another device on the same Wi-Fi, and from a phone on mobile data via a second Cloudflare tunnel exposing the website itself.

## 4. Exact Commands to Set This Up on Another Laptop (e.g., a Friend's)

This section is written so someone can follow it without needing to understand *why* each step works — just do them in order.

### Step 1 — Install these three things first
- **TightVNC** — download from tightvnc.com, install the "Server" component, and set a VNC password when prompted (password should be 123).
open the program and go to "Access Control" and enable "Allow loopback connection" > click apply and okay
- **Python** — download from python.org if not already installed (needed for websockify).
- **Node.js** — download from nodejs.org if not already installed (needed to run the website).

### Step 2 — Install websockify
Open one terminal (PowerShell or Command Prompt) and run:
```
pip install websockify
```

### Step 3 — Get the project files
Unzip the project folder you received. Open a terminal inside that folder and run:
```
npm install
```
This downloads all the website's code dependencies (takes a minute or two).

### Step 4 — Open a NEW terminal window (Terminal #1 of 3)
This one stays open the whole time you're using the site — don't close it.
```
websockify 6080 localhost:5900
```
Leave this running. You should see a message saying it's proxying to `localhost:5900`.

### Step 5 — Open ANOTHER new terminal window (Terminal #2 of 3)
Also stays open the whole time.
```
.\cloudflared.exe tunnel --url http://localhost:6080
```
This will print a box containing a link that looks like:
```
https://some-random-words.trycloudflare.com
```
**Copy just the part after `https://`** — you don't need the `https://` itself for the next step.

### Step 6 — Create the `.env.local` file
Inside the project folder, create a new file named exactly `.env.local` (this file will not already exist — you're creating it fresh). Put this inside it, replacing the host with what you copied in Step 5:
```
NEXT_PUBLIC_VNC_HOST=some-random-words.trycloudflare.com
NEXT_PUBLIC_VNC_PASSWORD=123
```
Note: no `https://` in front of the host — just the plain address. The password `123` should match whatever password was actually set on TightVNC in Step 1 (change this value if a different password was used).

### Step 7 — Open a THIRD new terminal window (Terminal #3 of 3)
Also stays open the whole time.
```
npm run dev
```
Wait for it to say "Ready," then open the link it shows (usually `http://localhost:3000`) in a browser.

**Summary: you will have 3 terminal windows open at the same time, all left running:**
1. `websockify 6080 localhost:5900`
2. `.\cloudflared.exe tunnel --url http://localhost:6080`
3. `npm run dev`

If any one of these three is closed, that part of the system stops working — the site may still load, but the remote laptop screen won't show up.

## 5. Software/Services Used (Full List)

- **Next.js** (React framework) — the website itself
- **TightVNC** — remote screen control on the host laptop
- **websockify** (Python) — VNC-to-WebSocket bridge
- **noVNC** — browser-based VNC viewer, embedded in the site
- **Cloudflare Tunnel (cloudflared)** — free public tunnel, no account required for testing (downloaded directly as a standalone .exe, not via pip)
- **VS Code + Antigravity** — code editor and AI coding assistant used to build the site

## 6. Known Limitations (Current State — Be Aware Before Wider Testing)

- **Only one person can be connected to the laptop at a time.** TightVNC's free version allows a single viewer connection. Two classmates trying to use it simultaneously will conflict.
- **Two of the tabs in the VM viewer ("Desktop GUI" and "Linux Shell") are currently fake demo content** — hardcoded text, not a real connection. Only the "External VNC" tab shows the real laptop.
- **Payment when a session ends is fully simulated** — clicking "Extend" doesn't charge any real money yet; it just pretends to succeed.
- **The VNC password is currently visible in the website's public code** (anyone who inspects the page can find it). This is an acceptable shortcut for a small trusted group of classmates, but should not be used at any larger scale.
- **Session countdown timers currently live only in the browser**, not on a server — there's no backend yet actually enforcing anything.
- **Scope reminder:** this should stay a small, trusted, college-only test. Sharing access to a single AI account/service with many people, and exposing chat history between users, both carry real privacy and terms-of-service considerations that get more serious the more people use this.

## 7. What's Needed Next (Roadmap)

To turn this from a working demo into something more robust, in rough priority order:

1. **A real backend** (e.g., hosted on Render) to track sessions, enforce timers server-side, and manage a proper queue — so the countdown can't be bypassed or faked by editing the browser, and the "one person at a time" rule is actually enforced by the system instead of just by TightVNC's limitation.
2. **Real payment integration** (e.g., Razorpay in test mode is free to experiment with) to replace the currently-simulated "Extend Session" button.
3. **User profiles/accounts** — real login instead of one hardcoded fake profile, so usage and payments can be tracked per person.
4. **Move the VNC password server-side** — instead of it living in the website's public code, have the backend generate the connection link per session so the password itself is never exposed to the browser.
5. **Decide on the fake demo tabs** — either remove "Desktop GUI"/"Linux Shell," or clearly label them as decorative/demo so nobody mistakes them for real system data.
6. **Consider a VNC solution that supports multiple simultaneous sessions**, if more than one classmate needs access at the same time — this would likely mean isolated virtual sessions per user rather than one shared physical laptop.
