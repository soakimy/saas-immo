"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";

type Photo = { id: string; storage_path: string; position: number };

export default function PropertyPhotos({
  propertyId,
  initialPhotos,
}: {
  propertyId: string;
  initialPhotos: Photo[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function publicUrl(path: string) {
    return supabase.storage.from("property-photos").getPublicUrl(path).data.publicUrl;
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    for (const file of Array.from(files)) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${propertyId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("property-photos")
        .upload(fileName, file);

      if (uploadError) {
        setError(`Échec de l'envoi de ${file.name} : ${uploadError.message}`);
        continue;
      }

      await supabase.from("property_photos").insert({
        property_id: propertyId,
        storage_path: fileName,
        position: initialPhotos.length,
      });
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    router.refresh();
  }

  async function handleDelete(photo: Photo) {
    await supabase.storage.from("property-photos").remove([photo.storage_path]);
    await supabase.from("property_photos").delete().eq("id", photo.id);
    router.refresh();
  }

  return (
    <div>
      {initialPhotos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
          {initialPhotos.map((photo) => (
            <div key={photo.id} className="relative group aspect-square rounded-md overflow-hidden bg-line">
              <img
                src={publicUrl(photo.storage_path)}
                alt=""
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => handleDelete(photo)}
                className="absolute top-1 right-1 bg-ink/70 text-paper text-xs rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                title="Supprimer cette photo"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        id="photo-upload"
      />
      <label
        htmlFor="photo-upload"
        className="inline-block text-sm font-medium text-clay hover:underline cursor-pointer"
      >
        {uploading ? "Envoi en cours..." : "+ Ajouter des photos"}
      </label>

      {error && <p className="text-sm text-clay mt-2">{error}</p>}
    </div>
  );
}
