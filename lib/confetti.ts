import confetti from "canvas-confetti";

export function triggerConfetti() {
  if (typeof window === "undefined") return;

  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (mediaQuery.matches) {
    return;
  }

  // Forest green, ink, paper and gold accents
  const colors = ["#1F4D3A", "#7FB69A", "#DDD6C8", "#17150F", "#C89D42"];

  confetti({
    particleCount: 70,
    spread: 60,
    origin: { y: 0.8 },
    colors,
    disableForReducedMotion: true,
  });
}
