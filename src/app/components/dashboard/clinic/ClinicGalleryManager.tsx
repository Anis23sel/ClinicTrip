"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Trash2, Upload } from "lucide-react";
import { createClient } from "@/app/utils/supabase/client";

const supabase = createClient();
const BUCKET_NAME = "clinic-images";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

type ClinicImage = {
  id: string;
  clinic_id: string;
  storage_path: string;
  caption: string | null;
  display_order: number;
  created_at: string;
  publicUrl: string;
};

type SelectedImage = {
  file: File;
  previewUrl: string;
};

function toClinicImage(row: {
  id: string;
  clinic_id: string;
  storage_path: string;
  caption: string | null;
  display_order: number;
  created_at: string;
}): ClinicImage {
  return {
    ...row,
    publicUrl: supabase.storage.from(BUCKET_NAME).getPublicUrl(row.storage_path).data.publicUrl,
  };
}

export default function ClinicGalleryManager({ clinicId }: { clinicId: string }) {
  const [images, setImages] = useState<ClinicImage[]>([]);
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedImagesRef = useRef<SelectedImage[]>([]);

  const loadImages = async () => {
    const { data, error: loadError } = await supabase
      .from("clinic_images")
      .select("id, clinic_id, storage_path, caption, display_order, created_at")
      .eq("clinic_id", clinicId)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (loadError) throw loadError;
    setImages((data || []).map(toClinicImage));
  };

  useEffect(() => {
    loadImages()
      .catch((loadError) => {
        console.error("Failed to load clinic images:", loadError);
        setError("We could not load your clinic photos.");
      })
      .finally(() => setLoading(false));
  }, [clinicId]);

  useEffect(() => {
    selectedImagesRef.current = selectedImages;
  }, [selectedImages]);

  useEffect(() => {
    return () => selectedImagesRef.current.forEach(({ previewUrl }) => URL.revokeObjectURL(previewUrl));
  }, []);

  const handleSelection = (files: FileList | null) => {
    if (!files) return;

    setError("");
    setSuccess("");
    const nextFiles: SelectedImage[] = [];

    for (const file of Array.from(files)) {
      if (!ALLOWED_TYPES.has(file.type)) {
        setError("Only JPEG, PNG, and WebP images are allowed.");
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError("Each image must be 5 MB or smaller.");
        continue;
      }
      nextFiles.push({ file, previewUrl: URL.createObjectURL(file) });
    }

    setSelectedImages((current) => [...current, ...nextFiles]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeSelected = (previewUrl: string) => {
    URL.revokeObjectURL(previewUrl);
    setSelectedImages((current) => current.filter((image) => image.previewUrl !== previewUrl));
  };

  const handleUpload = async () => {
    if (selectedImages.length === 0) return;

    setUploading(true);
    setError("");
    setSuccess("");

    const uploadedPaths: string[] = [];
    try {
      let displayOrder = images.reduce((highest, image) => Math.max(highest, image.display_order), 0) + 1;

      for (const selectedImage of selectedImages) {
        const extension = selectedImage.file.name.split(".").pop()?.toLowerCase() || "image";
        const storagePath = `${clinicId}/${crypto.randomUUID()}.${extension}`;
        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(storagePath, selectedImage.file, { contentType: selectedImage.file.type, upsert: false });

        if (uploadError) {
          throw new Error(`Storage upload failed: ${uploadError.message}`);
        }
        uploadedPaths.push(storagePath);

        const { error: insertError } = await supabase.from("clinic_images").insert({
          clinic_id: clinicId,
          storage_path: storagePath,
          caption: null,
          display_order: displayOrder,
        });

        if (insertError) {
          throw new Error(`Clinic image record failed: ${insertError.message}`);
        }

        displayOrder += 1;
      }

      selectedImages.forEach(({ previewUrl }) => URL.revokeObjectURL(previewUrl));
      setSelectedImages([]);
      await loadImages();
      setSuccess("Photos uploaded successfully.");
    } catch (uploadError) {
      if (uploadedPaths.length > 0) {
        const { error: cleanupStorageError } = await supabase.storage.from(BUCKET_NAME).remove(uploadedPaths);
        if (!cleanupStorageError) {
          await supabase.from("clinic_images").delete().in("storage_path", uploadedPaths).eq("clinic_id", clinicId);
        }
      }
      console.error("Failed to upload clinic images:", uploadError);
      setError(uploadError instanceof Error ? uploadError.message : "We could not upload the selected photos.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (image: ClinicImage) => {
    if (!window.confirm("Delete this clinic photo?")) return;

    setDeletingId(image.id);
    setError("");
    setSuccess("");

    try {
      const { error: storageError } = await supabase.storage.from(BUCKET_NAME).remove([image.storage_path]);
      if (storageError) throw storageError;

      const { error: deleteError } = await supabase.from("clinic_images").delete().eq("id", image.id).eq("clinic_id", clinicId);
      if (deleteError) throw deleteError;

      setImages((current) => current.filter((currentImage) => currentImage.id !== image.id));
      setSuccess("Photo deleted successfully.");
    } catch (deleteError) {
      console.error("Failed to delete clinic image:", deleteError);
      setError(deleteError instanceof Error ? deleteError.message : "We could not delete this photo.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Clinic Gallery</h2>
          <p className="mt-1 text-sm text-muted-foreground">Share photos of your facilities, rooms, and care environment.</p>
        </div>
        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50">
          <ImagePlus size={18} />
          Add photos
        </button>
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={(event) => handleSelection(event.target.files)} />
      </div>

      {selectedImages.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold">Selected photos ({selectedImages.length})</h3>
              <p className="text-sm text-muted-foreground">JPEG, PNG, or WebP up to 5 MB each.</p>
            </div>
            <button type="button" onClick={handleUpload} disabled={uploading} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50">
              <Upload size={16} />
              {uploading ? "Uploading..." : "Upload photos"}
            </button>
          </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {selectedImages.map((image) => (
              <div key={image.previewUrl} className="relative aspect-video overflow-hidden rounded-lg border border-border">
                <img src={image.previewUrl} alt={image.file.name} className="h-full w-full object-cover" />
                <button type="button" onClick={() => removeSelected(image.previewUrl)} disabled={uploading} className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-1 text-xs text-white disabled:opacity-50" aria-label={`Remove ${image.file.name}`}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {success && <p className="text-sm text-green-600">{success}</p>}

      {loading ? (
        <p className="text-muted-foreground">Loading your photos...</p>
      ) : images.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-10 text-center">
          <ImagePlus size={36} className="mx-auto mb-3 text-muted-foreground" />
          <h3 className="font-semibold">No clinic photos yet</h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">Add photos of your facilities, treatment rooms, and spaces to help patients get to know your clinic.</p>
          <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">Upload your first photos</button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image) => (
            <article key={image.id} className="overflow-hidden rounded-lg border border-border bg-card">
              <img src={image.publicUrl} alt={image.caption || "Clinic photo"} className="aspect-video w-full object-cover" />
              <div className="flex items-center justify-between gap-3 p-3">
                <p className="truncate text-sm text-muted-foreground">{image.caption || "Clinic photo"}</p>
                <button type="button" onClick={() => handleDelete(image)} disabled={deletingId === image.id || uploading} className="rounded-lg p-2 text-destructive hover:bg-destructive/10 disabled:opacity-50" aria-label="Delete clinic photo">
                  <Trash2 size={18} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
