import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Birthday Pictures",
  description:
    "I no go studio at all, cuz i no like the color of the cam wey dem dey use. Twenty years of memories, reflections, and milestones.",
  openGraph: {
    title: "Birthday Pictures · samkiel turns 20",
    description:
      "A visual archive of the journey into Chapter 20. Twenty years of memories, reflections, and milestones.",
    url: "https://birthday.samkiel.dev/pictures",
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
    title: "Birthday Pictures · samkiel turns 20",
    description: "A visual archive of the journey into Chapter 20.",
    images: ["https://birthday.samkiel.dev/og-portrait.jpg"],
  },
};

export default function PicturesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
