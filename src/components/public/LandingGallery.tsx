import type { LandingImage } from "@/types";

/** Home-page image gallery — fully admin-managed (/admin/landing-images). Renders nothing if the admin hasn't added any active images, per the database-first "no hardcoded content" rule. */
export function LandingGallery({ images }: { images: LandingImage[] }) {
  if (images.length === 0) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {images.map((image) => {
        const card = (
          <div className="group relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-ink-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.imageUrl}
              alt={image.caption}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {image.caption && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-3">
                <p className="text-sm font-medium text-white">{image.caption}</p>
              </div>
            )}
          </div>
        );

        return image.linkUrl ? (
          <a key={image.id} href={image.linkUrl} target="_blank" rel="noopener noreferrer" className="block">
            {card}
          </a>
        ) : (
          <div key={image.id}>{card}</div>
        );
      })}
    </div>
  );
}
