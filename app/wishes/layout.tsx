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
        url: "/pictures/samkielbday01.jpg",
        width: 1200,
        height: 1500,
        alt: "samkiel - Chapter 20 portrait",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Birthday Wishes · samkiel turns 20",
    description: "Leave a birthday wish for samkiel as he enters Chapter 20.",
    images: ["/pictures/samkielbday01.jpg"],
  },
};

export default function WishesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
