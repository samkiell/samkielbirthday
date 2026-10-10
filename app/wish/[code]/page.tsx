import type { Metadata } from "next";
import Link from "next/link";
import { getWishByCode } from "@/lib/wishes-service";
import { SingleWishView } from "@/components/single-wish-view";
import { ArrowLeft, PenLine } from "lucide-react";

interface PageProps {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { code } = await params;
  const wish = await getWishByCode(code);

  if (!wish) {
    return {
      title: "letter not found · samkiel turns 20",
      description: "this birthday letter could not be found.",
    };
  }

  const title = `letter from ${wish.name} · samkiel turns 20`;
  const description = `"${wish.message}" — birthday letter for samkiel at 20.`;
  const url = `https://birthday.samkiel.dev/wish/${wish.code}`;
  const image = "https://birthday.samkiel.dev/pictures/samkielbday01.jpg";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: "samkiel at 20",
      type: "article",
      images: [
        {
          url: image,
          width: 1200,
          height: 1500,
          alt: "samkiel - chapter 20 portrait",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function WishPage({ params }: PageProps) {
  const { code } = await params;
  const wish = await getWishByCode(code);

  if (!wish) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
        <div className="space-y-2">
          <span className="text-xs font-mono uppercase tracking-widest text-muted">
            404 · not found
          </span>
          <h1 className="font-serif text-3xl font-medium text-ink">
            letter not found
          </h1>
          <p className="text-muted text-sm leading-relaxed">
            couldn&apos;t find a letter at <span className="font-mono text-ink">/wish/{code}</span>. it might have been moved or removed.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/wishes"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-paper text-xs font-mono uppercase tracking-wider hover:bg-accent/90 transition-colors shadow-xs"
          >
            <PenLine className="w-3.5 h-3.5" />
            <span>write a letter</span>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-hairline text-muted hover:text-ink text-xs font-mono uppercase tracking-wider transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>back home</span>
          </Link>
        </div>
      </div>
    );
  }

  return <SingleWishView wish={wish} />;
}
