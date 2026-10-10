import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Birthday Wishes",
  description:
    "Leave a birthday wish for samkiel as he enters Chapter 20. Read notes from friends, mentors, and family.",
  openGraph: {
    title: "Birthday Wishes · samkiel turns 20",
    description:
      "Leave a birthday wish for samkiel as he enters Chapter 20. Read notes from friends, mentors, and family.",
    url: "https://birthday.samkiel.dev/wishes",
    images: [
      {
        url: "https://birthday.samkiel.dev/og-portrait.jpg",
        width: 1080,
        height: 1350,
        type: "image/jpeg",
        alt: "samkiel - Chapter 20 portrait",
      },
      {
        url: "https://birthday.samkiel.dev/og-square.jpg",
        width: 1000,
        height: 1000,
        type: "image/jpeg",
        alt: "samkiel - Chapter 20 square portrait",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Birthday Wishes · samkiel turns 20",
    description: "Leave a birthday wish for samkiel as he enters Chapter 20.",
    images: ["https://birthday.samkiel.dev/og-portrait.jpg"],
  },
};

export default function WishesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
