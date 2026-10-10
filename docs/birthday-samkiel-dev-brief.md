# birthday.samkiel.dev: Build Brief

**Concept:** Another Year. Another Chapter.
**Owner:** samkiel (lowercase always). Birthday: October 11, 2026 (turning 20).
**Goal:** A personal, interactive digital journal. Not a conventional birthday site, not a portfolio with a birthday banner. Visitors should leave knowing more about samkiel than when they arrived.

---

## 0. Instructions for the coding agent (read first)

1. Build exactly what this brief describes. Do not invent personal content. All copy is in Section 5. Where it says `[TBD]`, leave a clearly marked placeholder.
2. Never use em dashes in any copy, comments or UI text. Use commas, periods or colons.
3. Never name specific people in the story chapters. samkiel asked for this.
4. Do not mention his first paid project or first role anywhere. samkiel asked for this.
5. Design rules: simple, premium, minimal. No gradients anywhere. No clutter. One accent color. Generous whitespace.
6. Ship in the order of Section 11. Wish wall and admin must be live before launch day starts, and the story chapters must be live first.

---

## 1. Stack

- Next.js (App Router), TypeScript, Tailwind CSS
- MongoDB Atlas (free tier) with the official `mongodb` driver or Mongoose
- Validation: `zod`
- Auth for admin: `jose` (signed JWT in an httpOnly, secure, sameSite=strict cookie)
- Motion: `framer-motion`
- Confetti: `canvas-confetti`
- PDF: `@react-pdf/renderer`
- Images: `next/image`
- Deploy: Vercel, domain `birthday.samkiel.dev` (CNAME on `samkiel.dev` DNS)

Environment variables (samkiel sets these himself in `.env.local` and Vercel, never in chat or git):
`MONGODB_URI`, `ADMIN_PASSWORD`, `ADMIN_JWT_SECRET`, `IP_HASH_SALT`

---

## 2. Design system

**Palette (light, default):**
- Paper background: `#F6F3EE`
- Ink text: `#17150F`
- Muted text: `#6B665C`
- Hairline borders: `#DDD6C8`
- Single accent: forest green `#1F4D3A` (swap to terracotta `#B4532A` if samkiel prefers; pick one only)

**Palette (dark):** background `#121210`, ink `#F1EDE4`, muted `#9A958A`, hairlines `#2A2924`, accent `#7FB69A`.
Respect `prefers-color-scheme` and offer a small manual toggle.

**Type:**
- Display: Fraunces or Instrument Serif
- Body/UI: Geist or Inter
- Labels and chapter numbers: Geist Mono or JetBrains Mono, small, uppercase, letter-spaced

**Layout and feel:**
- One idea per screen. Long, calm scroll. Max content width around 640px for reading, wider for the wall.
- Thin hairline dividers instead of cards. Avoid heavy boxes and shadows.
- Sticky slim chapter index (01 to 05) on the side for desktop, a small top progress line on mobile.
- Mobile first. Test at 360px width.

**Motion:**
- "Floating" lives in two places only: wish letters gently drifting on the wall, and a subtle parallax on the opening screen. Everything else is still.
- Fade and rise on scroll for chapter text, short and subtle.
- Respect `prefers-reduced-motion`: turn off drift, parallax and confetti.

**Confetti, three moments only:**
1. Tapping "Begin" on the opening screen
2. After a wish is successfully submitted
3. At the end of the manifesto (Next Chapter)

**Branding:** SAMKIEL ("Software with Intention"), used quietly in the footer. Do not clutter the page with logos.

---

## 3. Pages and routes

- `/` : single scroll page with five chapters (Section 5)
- `/pictures` : birthday picture gallery
- `/admin` : login and moderation dashboard (not linked publicly)
- `/api/wishes` : GET approved wishes, POST new wish
- `/api/wishes/pdf` : GET a PDF of approved wishes
- `/api/admin/*` : login, list, hide, delete (all protected)

---

## 4. Features

### 4.1 Wish wall ("Letters for this chapter")
- Form fields: name (required, max 60), message (required, max 280, live counter), relationship tag (optional select: Family, Friend, Colleague, Fellow developer, Other).
- Hidden honeypot field. Reject if filled.
- `zod` validation on client and server.
- Rate limit: max 3 submissions per hour per hashed IP (`sha256(ip + IP_HASH_SALT)`, store only the hash).
- Basic profanity filter before publishing.
- **Publishing mode (recommended default, samkiel to confirm):** auto-publish after the filter passes, and moderate after the fact. Reason: a pending-by-default wall would be empty on his birthday. Keep a single env flag `WISHES_REQUIRE_APPROVAL` so it can be flipped to pending-by-default.
- Wall displays approved wishes as soft floating letters on desktop (gentle drift) and a calm stacked list on mobile. Newest first, with a "load more" button.
- Persistent in MongoDB so samkiel can revisit them long after October 11.

Wish document:
```
{ _id, name, message, relationship, status: "approved" | "pending" | "hidden", createdAt, ipHash }
```

### 4.2 Admin dashboard (`/admin`)
- Password login against `ADMIN_PASSWORD`, sets a signed httpOnly cookie, expires in 7 days.
- List all wishes with filters (all, approved, pending, hidden).
- Actions: approve, hide, delete. Confirm before delete.
- Never expose ipHash in the UI.

### 4.3 Pictures (`/pictures`)
- Grid of birthday images from `/public/pictures`, optimized with `next/image`.
- Each image has: Download button, Share button (Web Share API with fallback to copy link), WhatsApp share link (`https://wa.me/?text=...`).
- Images sized for mobile and desktop. Lazy load. Alt text on all.
- samkiel supplies the images. Use clearly marked placeholders until then.

### 4.4 Downloadable wishes PDF
- Server route renders approved wishes with `@react-pdf/renderer`.
- Layout: cover page ("Another Year. Another Chapter."), then one wish per block with name, relationship (if given) and date.
- Cache the output and regenerate when wishes change. Button on the wall: "Download all letters (PDF)".

### 4.5 Security checklist
- Validate and sanitize everything server side. Escape output.
- No secrets in client code. `.env.local` in `.gitignore`.
- Secure, httpOnly, sameSite=strict admin cookie. Constant-time password compare.
- Rate limit the login endpoint too.
- Security headers via `next.config` (CSP, X-Frame-Options, Referrer-Policy).

---

## 5. Content (samkiel's own words, lightly edited)

### Chapter 01: The opening
- Label: `CHAPTER 01`
- Headline: **samkiel** 
- Line: *Another year older. Still becoming.*
- Sub: *October 11, 2026. Twenty.*
- Button: **Begin** (triggers confetti, scrolls to Chapter 02)
- Small hint under the button: *Scroll to read my story, leave me a letter at the end.*

### Chapter 02: The story so far
Format: a vertical timeline. Each moment has a small mono date label, a short title, and two to four sentences. Keep it personal, not a list of achievements.

**2021 to 2023: The button phone years**
I wanted to be a doctor. Then in SS1 something about computers got hold of me. I didn't have a smartphone, just a button Tecno, so I wrote HTML and CSS on it through Wapkiz, learning from W3Schools. No bootcamp, no YouTube. In SS3 I built a Facebook clone and shared it with my classmates. Seeing my code open on their phones is still one of my favourite feelings.
Link: *Open my first ever site* (https://samkiel.wapkizs.com/), still live.

**2023: The first smartphone**
I got my first smartphone around the time I was about to enter university. It was a big push. I tried Sololearn briefly, then went back to W3Schools, which is where I really learned HTML, CSS and JavaScript, before moving on to React, Next.js and Node.js.

**[Date TBD]: Practice**
I never only studied. I learned something, built something, and repeated. On my first laptop that meant a stopwatch, a timer, a calculator, the classic beginner set, plus my portfolio. It was practice, and I knew it. All still on my GitHub.
Link: *See the activity* (https://samkiel.dev/#activity) and GitHub `samkiell`. `[samkiel to confirm the activity link]`

**[Date TBD]: Getting real**
My second laptop changed things. That's when I started building production-grade applications. Watching strangers use something I built is a different feeling from getting a tutorial to run.

**First year at OAU: Leading before I knew I could**
I started by leading Dev++, a developer community, in my first year on campus. I didn't know I had it in me until I tried. I just love watching people learn and grow. The lesson that stuck: not everyone will be active or cooperative, and you can't force them. You bring everyone along as far as you can, then you build with the ones who show up.

**The stretches that tested me**
I've never reached the point of deciding to quit. But I've come close to running out of energy. Building a startup solo is lonely, and right now a Meta API webhook still refuses to work after everything I've tried. I've gone into hackathons expecting top 10 and finished nowhere close. In school, lightning hit while my first laptop was charging in my hostel and killed the charging IC, so I spent a long time using it only while plugged in. What brings me back is looking around and seeing other people building.

### Chapter 03: Things I'm learning

**What I got wrong about success**
I used to think success meant working hard every single day. Then came the night I spent hours on a chat feature that wouldn't receive messages. Socket.IO, PHP, HTML, back and forth until morning. Plenty of energy, wrong direction. In the end I texted a senior dev I know on WhatsApp. Three lines from him and everything worked. Effort isn't the scarce thing, direction is. Sometimes the smartest move is asking the right person.

**The rooms I walked into**
Coming to OAU put me around ambitious people, the kind who make you rethink what's possible. Being near them changed how I think. I aim higher now, and I see myself as someone who can achieve a lot. Leaving my own corner to travel, meet new people and build a network widened that further. The right people don't just help your work, they raise your ceiling.
Tech events do this too. At DevFest in Osogbo, I shared a car from Ife with people from my own GDG community I'd never really talked to. We'd been in the same room for months and only met on that road. The NACOS event in Ibadan did the same.

**On pride**
I have pride. People have told me, and I know it. I want to be as humble as I can in every situation. `[samkiel to confirm he wants this as a standalone reflection or only inside the manifesto]`

**Faith:** `[optional, samkiel decides whether to include. Leave out by default.]`

### Chapter 04: Letters for this chapter
- Intro line: *Leave me a note for this chapter. I'll be reading these long after October 11.*
- Form and wall as in Section 4.1.
- Under the wall: *Download all letters (PDF)* and a link to `/pictures`: *Birthday pictures to share.*
- Success message after submit: *Thank you. This one is going in the journal.* (confetti)

### Chapter 05: The next chapter (manifesto)
**Learn.** DSA properly, because it has cost me twice: once in a hackathon where my team was advancing and then dropped out, and once in an application. Mobile development, which I barely know. And AI, deeply.

**Change.** Be more humble, starting with admitting I have pride.

**Build.** My startup: a parent company with several companies under it. I'm building the parent now and one company under it alongside.

Closing line: *Another year. Another chapter. Let's see what I do with it.* (confetti)

Footer: `SAMKIEL · Software with Intention` · samkiel.dev · GitHub `samkiell`

---

## 6. SEO and sharing
- Title: `samkiel turns 20 · Another Year. Another Chapter.`
- Open Graph image: simple text-only card in the paper/ink palette (no gradient).
- Favicon: a small mark, one emoji is acceptable as a stopgap.

---

## 7. Accessibility and performance
- Semantic headings, visible focus states, AA contrast in both themes.
- All interactive elements keyboard reachable. Form errors announced.
- Lighthouse target: 90+ on mobile for performance and accessibility.

---

## 8. Open decisions (samkiel to settle)
1. Accent color: forest green (default) or terracotta.
2. Wish publishing: auto-publish with filter (default) or pending-by-default.
3. Dates for the "Practice" and "Getting real" timeline entries.
4. Whether to include a faith reflection.
5. Confirm the activity link `https://samkiel.dev/#activity`.
6. Picture files for `/pictures`.

---

## 9. Out of scope for launch
Comments threads, user accounts, email notifications, analytics beyond Vercel defaults.

---

## 10. Testing before launch
- Submit a wish on mobile and desktop, confirm it persists after refresh.
- Honeypot and rate limit work. Profanity filter works.
- Admin login, hide, delete work. Unauthenticated access to `/api/admin/*` returns 401.
- PDF downloads and opens correctly, names and dates present.
- `/pictures` download and share work on a phone.
- Dark mode, reduced motion and 360px width all look right.

---

## 11. Build order (time-boxed, birthday is Oct 11)
1. **Phase 1:** design tokens, layout, chapter index, Chapters 01, 02, 03, 05 with the copy above. Deploy to `birthday.samkiel.dev`.
2. **Phase 2:** MongoDB, wish form and wall, admin dashboard. Live before people start wishing him.
3. **Phase 3:** `/pictures` gallery with download and share.
4. **Phase 4:** wishes PDF export.
5. **Phase 5:** polish, accessibility pass, security headers, final testing.
