import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ALL_PICTURES, getPictureById } from "@/lib/pictures-data";
import { SinglePictureView } from "@/components/single-picture-view";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return ALL_PICTURES.map((pic) => ({
    id: pic.id,
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const pic = getPictureById(id);

  if (!pic) {
    return {
      title: "picture not found · samkiel turns 20",
      description: "this picture could not be found in the chapter 20 archive.",
    };
  }

  const title = `samkiel turns 20 · ${pic.title}`;
  const description = `celebrating samkiel's 20th birthday: two decades in. still dey on motion.`;
  const imageUrl = `https://birthday.samkiel.dev/share-images/${pic.id}.jpg`;
  const pageUrl = `https://birthday.samkiel.dev/pictures/${pic.id}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: "samkiel at 20",
      type: "website",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 1200,
          type: "image/jpeg",
          alt: `samkiel - ${pic.title}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function PictureDetailPage({ params }: PageProps) {
  const { id } = await params;
  const pic = getPictureById(id);

  if (!pic) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-canvas px-4 sm:px-6 py-8 sm:py-12">
      <SinglePictureView pic={pic} />
    </main>
  );
}
