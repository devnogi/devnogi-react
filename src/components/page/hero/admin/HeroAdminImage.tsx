import Image from "next/image";

export default function HeroAdminImage({
  imageUrl,
  altText,
}: {
  imageUrl: string;
  altText: string;
}) {
  return (
    <div className="relative aspect-[3/1] w-full overflow-hidden rounded-md border bg-background">
      <Image
        src={imageUrl}
        alt={altText}
        fill
        unoptimized
        sizes="(max-width: 768px) 100vw, 500px"
        className="object-contain"
      />
    </div>
  );
}
