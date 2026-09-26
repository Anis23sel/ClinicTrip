"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Images, X } from "lucide-react";

export type ClinicGalleryImage = {
  id: string;
  caption: string | null;
  publicUrl: string;
};

export default function ClinicGallery({ images }: { images: ClinicGalleryImage[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const selectedImage = images[selectedIndex];

  const selectPrevious = () => {
    setSelectedIndex((current) => (current === 0 ? images.length - 1 : current - 1));
  };

  const selectNext = () => {
    setSelectedIndex((current) => (current + 1) % images.length);
  };

  return (
    <section className="border-t border-border pt-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Images size={20} className="text-primary" />
          <h3 className="text-xl font-semibold">Clinic Photos</h3>
        </div>
        {images.length > 0 && (
          <span className="text-sm text-muted-foreground">
            {images.length} {images.length === 1 ? "photo" : "photos"}
          </span>
        )}
      </div>

      {images.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
          No photos are available for this clinic yet.
        </p>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="group relative block w-full overflow-hidden rounded-xl border border-border bg-accent text-left"
            aria-label="Open clinic photo gallery"
          >
            <div className="aspect-[16/9] w-full">
              <img
                src={selectedImage.publicUrl}
                alt={selectedImage.caption || "Clinic photo"}
                className="block h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
            </div>
            {selectedImage.caption && (
              <span className="absolute inset-x-0 bottom-0 bg-black/65 px-4 py-3 text-sm text-white">
                {selectedImage.caption}
              </span>
            )}
          </button>

          {images.length > 1 && (
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => setSelectedIndex(index)}
                  className={`overflow-hidden rounded-lg border-2 bg-accent text-left ${index === selectedIndex ? "border-primary" : "border-transparent opacity-80 hover:opacity-100"}`}
                  aria-label={`Show clinic photo ${index + 1}`}
                >
                  <img src={image.publicUrl} alt={image.caption || `Clinic photo ${index + 1}`} className="aspect-video block h-full w-full object-cover" />
                  {image.caption && <span className="block truncate px-2 py-1.5 text-xs text-muted-foreground">{image.caption}</span>}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {lightboxOpen && selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Clinic photo viewer"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            aria-label="Close photo viewer"
          >
            <X size={24} />
          </button>
          {images.length > 1 && (
            <button
              type="button"
              onClick={(event) => { event.stopPropagation(); selectPrevious(); }}
              className="absolute left-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
              aria-label="Previous clinic photo"
            >
              <ChevronLeft size={28} />
            </button>
          )}
          <figure className="max-h-full max-w-5xl" onClick={(event) => event.stopPropagation()}>
            <img src={selectedImage.publicUrl} alt={selectedImage.caption || "Clinic photo"} className="max-h-[80vh] max-w-full object-contain" />
            {(selectedImage.caption || images.length > 1) && (
              <figcaption className="mt-3 text-center text-sm text-white">
                {selectedImage.caption || "Clinic photo"}{images.length > 1 && ` - ${selectedIndex + 1} of ${images.length}`}
              </figcaption>
            )}
          </figure>
          {images.length > 1 && (
            <button
              type="button"
              onClick={(event) => { event.stopPropagation(); selectNext(); }}
              className="absolute right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
              aria-label="Next clinic photo"
            >
              <ChevronRight size={28} />
            </button>
          )}
        </div>
      )}
    </section>
  );
}
