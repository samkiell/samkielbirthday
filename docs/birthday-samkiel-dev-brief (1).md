# birthday.samkiel.dev: Build Brief

**Concept:** another year. another chapter. (internal name only, all site copy is lowercase)
**Owner:** samkiel (lowercase always). Birthday: October 11, 2026 (turning 20).
**Goal:** A personal, interactive digital journal. Not a conventional birthday site, not a portfolio with a birthday banner. Visitors should leave knowing more about samkiel than when they arrived.

---

## 0. Instructions for the coding agent (read first)

0. **The site already exists in the repo (`samkielbirthday`).** Do not rebuild it. Replace all user-facing copy with Section 5 verbatim and keep layout, components and logic as they are unless this brief says otherwise.
1. Build exactly what this brief describes. Do not invent personal content. All copy is in Section 5. Where it says `[TBD]`, leave a clearly marked placeholder.
2. **Voice rule: all user-facing copy is lowercase and casual, never professional.** That includes headings, buttons, labels, placeholders, error and success messages, metadata and the footer. Write the lowercase literally in the text. Do not rely on CSS `text-transform` for it. Keep the lowercase "i" too. samkiel, oau, gdg, devfest, nacos and tech names stay lowercase as well.
3. Never use em dashes in any copy, comments or UI text. Use commas, periods or colons.
4. Never name specific people in the story chapters. samkiel asked for this.
5. Do not mention his first paid project or first role anywhere. samkiel asked for this.
6. Design rules: simple, premium, minimal. No gradients anywhere. No clutter. One accent color. Generous whitespace.
7. Ship in the order of Section 11. Wish wall and admin must be live before launch day starts, and the story chapters must be live first.

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

## 5. Content (samkiel's own words, casual, all lowercase)

Any copy elsewhere on the site (navbar, pictures page, wishes page, footer, toasts, errors, empty states) must be rewritten in this same voice: lowercase, casual, short sentences, no corporate tone. The admin dashboard is private, so its labels can stay as they are.

### chapter 01: the opening
- label: `chapter 01`
- headline: **samkiel**
- line: *another year older. still becoming.*
- sub: *october 11, 2026. twenty.*
- button: **begin** (triggers confetti, scrolls to chapter 02)
- hint under the button: *scroll through the story, then drop me a letter at the end.*

### chapter 02: the story so far
Format: a vertical timeline. Each moment has a small mono date label, a short title, and a few sentences.

**2021 to 2023: the button phone years**
i wanted to be a doctor, lol. then in ss1 computers caught me. no smartphone, just a button tecno, so i wrote html and css on it using wapkiz and learned from w3schools. no bootcamp, no youtube, just me. in ss3 i built a facebook clone and shared it with my classmates. seeing my code open on their phones is still one of my favourite feelings ever.
link: *open my first ever site* (https://samkiel.wapkizs.com/), still live.

**2023: the first smartphone**
got my first smartphone right before uni and things sped up. tried sololearn for a bit, went back to w3schools, and that's where html, css and javascript really clicked. after that it was react, next.js and node.js.

**[date tbd]: practice**
i never just studied. i'd learn something, build something, repeat. on my first laptop that was stopwatches, timers, calculators, the classic beginner stuff, plus my portfolio. it was practice and i knew it. it's all still on my github.
link: *see the activity* (https://samkiel.dev/#activity) and github `samkiell`. `[samkiel to confirm the activity link]`

**[date tbd]: getting real**
my second laptop changed things. that's when i started building production grade apps. watching real people use something you built hits different from getting a tutorial to run.

**first year at oau: leading before i knew i could**
in my first year on campus i started leading dev++, a developer community. i had no idea i could lead until i tried. i just love watching people learn and grow. biggest lesson: not everyone will be active or cooperative, and you can't force them. bring everyone along as far as you can, then build with the ones who show up.

**the stretches that tested me**
i've never hit a point where i wanted to quit. but i've definitely run low on energy. building a startup solo is lonely, and right now a meta api webhook still won't work no matter what i try. i've gone into hackathons expecting top 10 and finished nowhere close. my first laptop also got fried when lightning struck while it was charging in my hostel. the charging ic died and i used it plugged in for a long time. what pulls me back is seeing the people around me building.

### chapter 03: things i'm learning

**what i got wrong about success**
i used to think success meant working hard every single day. then one night i spent hours on a chat feature that wouldn't receive messages. socket.io, php, html, back and forth till morning. loads of energy, wrong direction. then i texted a senior dev i know on whatsapp. three lines from him and it just worked. effort isn't the rare thing, direction is. sometimes the smartest move is asking the right person.

**the rooms i walked into**
coming to oau put me around ambitious people who made me rethink what's possible. being around them changed how i think. i aim higher now, and i actually see myself as someone who can achieve a lot. leaving my own corner to travel, meet people and network pushed that even further. the right people don't just help your work, they raise your ceiling.
events do this too. at devfest in osogbo i shared a car from ife with people from my own gdg community i'd never really talked to. we'd been in the same room for months and only properly met on that road. the nacos event in ibadan did the same.

**on pride**
i have pride. people have told me and i know it. i want to be as humble as i can in every situation. `[samkiel to confirm: standalone reflection or only inside the manifesto]`

**faith:** `[optional, samkiel decides. leave out by default.]`

### chapter 04: letters for this chapter
- intro: *leave me a note for this chapter. i'll be reading these long after october 11.*
- form labels and placeholders: `your name`, `write something nice (280 characters max)`, `who are you to me?`, button `send letter`
- relationship options: `family`, `friend`, `colleague`, `fellow developer`, `other`
- success message (with confetti): *thank you. this one's going in the journal.*
- error messages, lowercase and casual: `name is required`, `message is required`, `keep it under 280 characters`, `easy, max 3 letters an hour`, `that has some flagged words in it, try rephrasing`
- under the wall: `download all letters (pdf)` and `birthday pictures to share`
- empty wall: *no letters yet. be the first.*
- load more button: `load more`

### chapter 05: the next chapter
**learn.** dsa properly, because it has cost me twice: once in a hackathon where my team was moving through the stages and then dropped out, and once in an application. mobile development, which i barely know. and ai, properly deep.

**change.** be more humble, starting with admitting i have pride.

**build.** my startup. a parent company with several companies under it. i'm building the parent now and one company under it at the same time.

closing line (with confetti): *another year. another chapter. let's see what i do with it.*

footer: `samkiel · software with intention` · samkiel.dev · github `samkiell`

---

## 6. SEO and sharing
- Title: `samkiel turns 20 · another year. another chapter.`
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
