"use client";

import Image from "next/image";
import Link from "next/link";
import { ChapterNav } from "@/components/chapter-nav";
import { WishSection } from "@/components/wish-section";
import { triggerConfetti } from "@/lib/confetti";
import { ArrowDown, ArrowRight, ExternalLink, Sparkles } from "lucide-react";

export default function HomePage() {
  const handleBegin = () => {
    triggerConfetti();
    const target = document.getElementById("chapter-02");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleManifestoFinish = () => {
    triggerConfetti();
  };

  return (
    <div className="relative min-h-screen">
      {/* Chapter side index and top progress bar */}
      <ChapterNav />

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8 md:pl-16 md:pr-8 lg:pl-20 lg:pr-8 xl:pl-24 xl:pr-8 pt-1 sm:pt-4 md:pt-8 pb-16 md:pb-24 space-y-20 md:space-y-36">
        {/* CHAPTER 01: Hero Section */}
        <section
          id="chapter-01"
          className="flex flex-col justify-start pt-1 md:pt-4 scroll-mt-24"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-8 md:gap-8 items-center">
            {/* Left Column: Headlines & CTA */}
            <div className="md:col-span-7 space-y-3.5 sm:space-y-6 md:space-y-8 order-2 md:order-1">
              <div className="inline-block">
                <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.25em] uppercase text-muted font-semibold">
                  October 11
                </span>
              </div>

              <div className="space-y-1 sm:space-y-2">
                <h1 className="font-serif text-[32px] xs:text-[38px] sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-normal tracking-tight text-ink leading-[1.08] sm:leading-[1.05]">
                  two decades in. <br />
                  still{" "}
                  <span className="italic text-accent">dey on motion.</span>
                </h1>
              </div>

              <div className="space-y-0.5 font-sans text-xs sm:text-base md:text-lg text-muted max-w-md">
                <p>Grateful for the journey so far.</p>
                <p>Excited for what's ahead.</p>
              </div>

              <div className="pt-1 flex flex-wrap items-center gap-3 sm:gap-6">
                <button
                  data-track="begin"
                  onClick={handleBegin}
                  className="inline-flex items-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3.5 rounded-lg bg-accent text-paper text-xs sm:text-sm font-medium hover:bg-accent/90 transition-all cursor-pointer shadow-sm group"
                >
                  <span>Explore My Story</span>
                  <ArrowDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:translate-y-0.5" />
                </button>

                <Link
                  href="/wishes"
                  data-track="send-letter-hero"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-lg border border-hairline text-xs sm:text-sm font-medium text-ink hover:text-accent hover:border-accent/40 bg-paper/60 backdrop-blur-xs transition-all group"
                >
                  <span>Send a Letter</span>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-0.5 text-muted group-hover:text-accent" />
                </Link>
              </div>
            </div>

            {/* Right Column: Arched Portrait Photo + Chapter 20 Badge */}
            <div className="md:col-span-5 order-1 md:order-2 flex justify-center md:justify-end relative">
              <div className="relative w-[190px] xs:w-[220px] sm:w-[280px] md:w-[320px] lg:w-[340px]">
                {/* Botanical leaf decorations */}
                <svg
                  className="absolute -top-8 -left-8 w-24 h-24 text-accent/25 pointer-events-none -rotate-12 hidden sm:block"
                  viewBox="0 0 100 100"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M50 10 C30 30, 20 60, 50 90 C80 60, 70 30, 50 10 Z" />
                  <path d="M25 40 C10 50, 10 70, 35 80 C40 60, 35 50, 25 40 Z" />
                </svg>

                <svg
                  className="absolute -bottom-6 -right-6 w-28 h-28 text-accent/20 pointer-events-none rotate-45 hidden sm:block"
                  viewBox="0 0 100 100"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M50 10 C30 30, 20 60, 50 90 C80 60, 70 30, 50 10 Z" />
                  <path d="M75 40 C90 50, 90 70, 65 80 C60 60, 65 50, 75 40 Z" />
                </svg>

                {/* Arched Photo Frame */}
                <div className="relative aspect-[3/4] w-full rounded-t-[100px] xs:rounded-t-[120px] sm:rounded-t-[160px] md:rounded-t-[190px] rounded-b-2xl border border-hairline overflow-hidden bg-[#EFEAE1] dark:bg-[#1C1B17] shadow-sm">
                  <Image
                    src="/pictures/samkielbday01.jpg"
                    alt="samkiel portrait for chapter 20"
                    fill
                    priority
                    quality={95}
                    sizes="(max-width: 640px) 240px, (max-width: 1024px) 340px, 420px"
                    className="object-cover object-top"
                  />
                  {/* Subtle inner border */}
                  <div className="absolute inset-0 rounded-t-[100px] xs:rounded-t-[120px] sm:rounded-t-[160px] md:rounded-t-[190px] rounded-b-2xl ring-1 ring-inset ring-black/5 dark:ring-white/10 pointer-events-none" />
                </div>

                {/* Floating Chapter 20 Badge */}
                <div className="absolute top-1/2 -right-3 sm:-right-6 -translate-y-1/2 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full border border-hairline bg-paper/95 backdrop-blur-xs flex flex-col items-center justify-center shadow-md">
                  <span className="text-[8px] sm:text-[9px] font-mono tracking-widest uppercase text-muted">
                    CHAPTER
                  </span>
                  <span className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-accent leading-none my-0.5">
                    20
                  </span>
                  <span className="text-[8px] sm:text-[9px] font-mono tracking-widest text-muted">
                    2026
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Focused Reading Column for Chapters 02 & 03 */}
        <div className="max-w-[680px] mx-auto space-y-28 md:space-y-40">
          {/* CHAPTER 02: The story so far */}
          <section id="chapter-02" className="space-y-12 scroll-mt-24">
            <div className="space-y-2 border-b border-hairline pb-4">
              <span className="text-xs font-mono tracking-widest uppercase text-muted">
                Chapter 02
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-ink font-normal">
                The story so far
              </h2>
            </div>

            <div className="relative border-l border-hairline pl-6 sm:pl-8 space-y-12 ml-2">
              {/* Timeline Item 1 */}
              <article className="space-y-2 relative">
                <span className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-3 h-3 rounded-full border-2 border-paper bg-accent" />
                <div className="text-[11px] font-mono uppercase tracking-wider text-muted">
                  2021 to 2023
                </div>
                <h3 className="font-serif text-lg text-ink font-medium">
                  The button phone years
                </h3>
                <p className="text-sm leading-relaxed text-ink/90">
                  I wanted to be a doctor. Then in SS1 something about computers got
                  hold of me. I didn't have a smartphone, just a button Tecno, so I
                  wrote HTML and CSS on it through Wapkiz, learning from W3Schools. No
                  bootcamp, no YouTube. In SS3 I built a Facebook clone and shared it
                  with my classmates. Seeing my code open on their phones is still one
                  of my favourite feelings.
                </p>
                <div className="pt-1">
                  <a
                    href="https://samkiel.wapkizs.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline font-mono"
                  >
                    <span>Open my first ever site</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </article>

              {/* Timeline Item 2 */}
              <article className="space-y-2 relative">
                <span className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-3 h-3 rounded-full border-2 border-paper bg-accent" />
                <div className="text-[11px] font-mono uppercase tracking-wider text-muted">
                  2023
                </div>
                <h3 className="font-serif text-lg text-ink font-medium">
                  The first smartphone
                </h3>
                <p className="text-sm leading-relaxed text-ink/90">
                  I got my first smartphone around the time I was about to enter
                  university. It was a big push. I tried Sololearn briefly, then
                  went back to W3Schools, which is where I really learned HTML, CSS
                  and JavaScript, before moving on to React, Next.js and Node.js.
                </p>
              </article>

              {/* Timeline Item 3 */}
              <article className="space-y-2 relative">
                <span className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-3 h-3 rounded-full border-2 border-paper bg-muted" />
                <div className="text-[11px] font-mono uppercase tracking-wider text-muted">
                  Practice
                </div>
                <h3 className="font-serif text-lg text-ink font-medium">
                  Practice
                </h3>
                <p className="text-sm leading-relaxed text-ink/90">
                  I never only studied. I learned something, built something, and
                  repeated. On my first laptop that meant a stopwatch, a timer, a
                  calculator, the classic beginner set, plus my portfolio. It was
                  practice, and I knew it. All still on my GitHub.
                </p>
                <div className="pt-1 flex items-center gap-4 text-xs font-mono">
                  <a
                    href="https://samkiel.dev/#activity"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-accent hover:underline"
                  >
                    <span>See the activity</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href="https://github.com/samkiell"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-muted hover:text-ink hover:underline"
                  >
                    <span>GitHub samkiell</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </article>

              {/* Timeline Item 4 */}
              <article className="space-y-2 relative">
                <span className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-3 h-3 rounded-full border-2 border-paper bg-muted" />
                <div className="text-[11px] font-mono uppercase tracking-wider text-muted">
                  Getting real
                </div>
                <h3 className="font-serif text-lg text-ink font-medium">
                  Getting real
                </h3>
                <p className="text-sm leading-relaxed text-ink/90">
                  My second laptop changed things. That's when I started building
                  production-grade applications. Watching strangers use something I
                  built is a different feeling from getting a tutorial to run.
                </p>
              </article>

              {/* Timeline Item 5 */}
              <article className="space-y-2 relative">
                <span className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-3 h-3 rounded-full border-2 border-paper bg-accent" />
                <div className="text-[11px] font-mono uppercase tracking-wider text-muted">
                  First year at OAU
                </div>
                <h3 className="font-serif text-lg text-ink font-medium">
                  Leading before I knew I could
                </h3>
                <p className="text-sm leading-relaxed text-ink/90">
                  I started by leading Dev++, a developer community, in my first year
                  on campus. I didn't know I had it in me until I tried. I just love
                  watching people learn and grow. The lesson that stuck: not everyone
                  will be active or cooperative, and you can't force them. You bring
                  everyone along as far as you can, then you build with the ones who
                  show up.
                </p>
              </article>

              {/* Timeline Item 6 */}
              <article className="space-y-2 relative">
                <span className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-3 h-3 rounded-full border-2 border-paper bg-accent" />
                <div className="text-[11px] font-mono uppercase tracking-wider text-muted">
                  Reflection
                </div>
                <h3 className="font-serif text-lg text-ink font-medium">
                  The stretches that tested me
                </h3>
                <p className="text-sm leading-relaxed text-ink/90">
                  I've never reached the point of deciding to quit. But I've come
                  close to running out of energy. Building a startup solo is lonely,
                  and right now a Meta API webhook still refuses to work after
                  everything I've tried. I've gone into hackathons expecting top 10
                  and finished nowhere close. In school, lightning hit while my
                  first laptop was charging in my hostel and killed the charging IC,
                  so I spent a long time using it only while plugged in. What brings
                  me back is looking around and seeing other people building.
                </p>
              </article>
            </div>
          </section>

          {/* CHAPTER 03: Things I'm learning */}
          <section id="chapter-03" className="space-y-12 scroll-mt-24">
            <div className="space-y-2 border-b border-hairline pb-4">
              <span className="text-xs font-mono tracking-widest uppercase text-muted">
                Chapter 03
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-ink font-normal">
                Things I'm learning
              </h2>
            </div>

            <div className="space-y-10">
              <article className="space-y-3 pb-8 border-b border-hairline/60">
                <h3 className="font-serif text-xl text-ink font-medium">
                  What I got wrong about success
                </h3>
                <p className="text-sm leading-relaxed text-ink/90">
                  I used to think success meant working hard every single day. Then
                  came the night I spent hours on a chat feature that wouldn't receive
                  messages. Socket.IO, PHP, HTML, back and forth until morning.
                  Plenty of energy, wrong direction. In the end I texted a senior
                  dev I know on WhatsApp. Three lines from him and everything
                  worked. Effort isn't the scarce thing, direction is. Sometimes the
                  smartest move is asking the right person.
                </p>
              </article>

              <article className="space-y-3 pb-8 border-b border-hairline/60">
                <h3 className="font-serif text-xl text-ink font-medium">
                  The rooms I walked into
                </h3>
                <p className="text-sm leading-relaxed text-ink/90">
                  Coming to OAU put me around ambitious people, the kind who make you
                  rethink what's possible. Being near them changed how I think. I aim
                  higher now, and I see myself as someone who can achieve a lot.
                  Leaving my own corner to travel, meet new people and build a
                  network widened that further. The right people don't just help your
                  work, they raise your ceiling.
                </p>
                <p className="text-sm leading-relaxed text-ink/90">
                  Tech events do this too. At DevFest in Osogbo, I shared a car from
                  Ife with people from my own GDG community I'd never really talked
                  to. We'd been in the same room for months and only met on that
                  road. The NACOS event in Ibadan did the same.
                </p>
              </article>

              <article className="space-y-3">
                <h3 className="font-serif text-xl text-ink font-medium">
                  On pride
                </h3>
                <p className="text-sm leading-relaxed text-ink/90">
                  I have pride. People have told me, and I know it. I want to be as
                  humble as I can in every situation.
                </p>
              </article>
            </div>
          </section>
        </div>

        {/* CHAPTER 04: Letters for this chapter */}
        <section id="chapter-04" className="space-y-10 max-w-4xl mx-auto pt-8 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-hairline pb-4">
            <div className="space-y-2">
              <span className="text-xs font-mono tracking-widest uppercase text-muted">
                Chapter 04
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-ink font-normal">
                Letters for this chapter
              </h2>
            </div>

            <Link
              href="/wishes"
              className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-accent hover:underline pb-1"
            >
              <span>Open Full Floating Wall →</span>
            </Link>
          </div>

          <WishSection />
        </section>

        {/* CHAPTER 05: The next chapter (Focused Manifesto) */}
        <div className="max-w-[680px] mx-auto space-y-28 md:space-y-40">
          <section id="chapter-05" className="space-y-12 scroll-mt-24">
            <div className="space-y-2 border-b border-hairline pb-4">
              <span className="text-xs font-mono tracking-widest uppercase text-muted">
                Chapter 05
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-ink font-normal">
                The next chapter
              </h2>
            </div>

            <div className="space-y-8">
              <div className="space-y-2">
                <h3 className="font-serif text-2xl text-ink font-medium">
                  Learn.
                </h3>
                <p className="text-sm leading-relaxed text-ink/90">
                  DSA properly, because it has cost me twice: once in a hackathon
                  where my team was advancing and then dropped out, and once in an
                  application. Mobile development, which I barely know. And AI,
                  deeply.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-serif text-2xl text-ink font-medium">
                  Change.
                </h3>
                <p className="text-sm leading-relaxed text-ink/90">
                  Be more humble, starting with admitting I have pride.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-serif text-2xl text-ink font-medium">
                  Build.
                </h3>
                <p className="text-sm leading-relaxed text-ink/90">
                  My startup: a parent company with several companies under it. I'm
                  building the parent now and one company under it alongside.
                </p>
              </div>

              <div className="pt-8 border-t border-hairline space-y-4">
                <p className="font-serif italic text-lg sm:text-xl text-ink">
                  Two decades in. Still becoming. Let's see what I do with it.
                </p>
                <button
                  onClick={handleManifestoFinish}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-hairline bg-paper text-xs font-mono uppercase tracking-wider text-muted hover:text-ink hover:border-ink transition-colors cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                  <span>Celebrate chapter 20</span>
                </button>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="pt-16 pb-20 border-t border-hairline text-center space-y-3">
            <div className="font-mono text-xs tracking-widest text-ink font-medium">
              <span className="lowercase">samkiel</span> · <span className="lowercase">One push at a time</span>
            </div>
            <div className="text-xs text-muted font-mono flex items-center justify-center gap-3">
              <a
                href="https://samkiel.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-ink transition-colors"
              >
                samkiel.dev
              </a>
              <span>·</span>
              <a
                href="https://github.com/samkiell"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-ink transition-colors"
              >
                GitHub samkiell
              </a>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
