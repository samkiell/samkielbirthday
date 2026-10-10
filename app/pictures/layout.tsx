import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Birthday Pictures",
  description:
    "A visual archive of the journey into Chapter 20. Twenty years of memories, reflections, and milestones.",
  openGraph: {
    title: "Birthday Pictures · samkiel turns 20",
    description:
      "A visual archive of the journey into Chapter 20. Twenty years of memories, reflections, and milestones.",
    url: "https://birthday.samkiel.dev/pictures",
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
    title: "Birthday Pictures · samkiel turns 20",
    description: "A visual archive of the journey into Chapter 20.",
    images: ["/pictures/samkielbday01.jpg"],
  },
};

export default function PicturesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
