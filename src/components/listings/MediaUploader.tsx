"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import type { MediaItem } from "@/app/actions/listings";

const MAX_PHOTOS = 8;
const ALLOWED_PHOTO = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_VIDEO = ["video/mp4", "video/quicktime"];

interface MediaUploaderProps {
  value: MediaItem[];
  onChange: (items: MediaItem[]) => void;
  error?: string;
}

interface UploadingItem {
  id: string;
  name: string;
  progress: number;
  error?: string;
}

export function MediaUploader({ value, onChange, error }: MediaUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<UploadingItem[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const photos = value.filter((m) => m.media_type === "photo");
  const video = value.find((m) => m.media_type === "video");

  async function uploadFile(file: File) {
    const id = Math.random().toString(36).slice(2);
    const isPhoto = ALLOWED_PHOTO.includes(file.type);
    const isVideo = ALLOWED_VIDEO.includes(file.type);

    if (!isPhoto && !isVideo) {
      setUploading((prev) => [
        ...prev,
        { id, name: file.name, progress: 0, error: "Formato no soportado" },
      ]);
      return;
    }

    if (isPhoto && photos.length >= MAX_PHOTOS) {
      setUploading((prev) => [
        ...prev,
        { id, name: file.name, progress: 0, error: `Máximo ${MAX_PHOTOS} fotos` },
      ]);
      return;
    }

    if (isVideo && video) {
      setUploading((prev) => [
        ...prev,
        { id, name: file.name, progress: 0, error: "Ya hay un video cargado" },
      ]);
      return;
    }

    const maxMb = isVideo ? 100 : 10;
    if (file.size > maxMb * 1024 * 1024) {
      setUploading((prev) => [
        ...prev,
        { id, name: file.name, progress: 0, error: `Máximo ${maxMb} MB` },
      ]);
      return;
    }

    setUploading((prev) => [...prev, { id, name: file.name, progress: 10 }]);

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading((prev) =>
        prev.map((u) => (u.id === id ? { ...u, progress: 50 } : u))
      );

      const res = await fetch("/api/listings/media", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const { error: err } = await res.json();
        setUploading((prev) =>
          prev.map((u) => (u.id === id ? { ...u, error: err ?? "Error" } : u))
        );
        return;
      }

      const { url, path, media_type } = await res.json();
      onChange([...value, { url, path, media_type }]);
      setUploading((prev) => prev.filter((u) => u.id !== id));
    } catch {
      setUploading((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, error: "Error de red" } : u
        )
      );
    }
  }

  function handleFiles(files: FileList | null) {
    if (!files) return;
    Array.from(files).forEach(uploadFile);
  }

  function removeItem(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function movePhoto(from: number, to: number) {
    const photos = value.filter((m) => m.media_type === "photo");
    const videos = value.filter((m) => m.media_type === "video");
    const reordered = [...photos];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    onChange([...reordered, ...videos]);
  }

  const borderColor = error ? "rgb(239 68 68)" : dragOver ? "var(--blue)" : "var(--border)";

  return (
    <div className="flex flex-col gap-3">
      {/* Drop zone */}
      <div
        className="relative rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors"
        style={{ borderColor, backgroundColor: dragOver ? "rgba(42,127,206,0.05)" : "var(--bg2)" }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={[...ALLOWED_PHOTO, ...ALLOWED_VIDEO].join(",")}
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <p className="text-3xl mb-2">📸</p>
        <p className="text-sm font-medium" style={{ color: "var(--muted)" }}>
          Arrastrá o hacé click para subir fotos/video
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--dim)" }}>
          JPG, PNG, WEBP hasta 10 MB · MP4/MOV hasta 100 MB · Máx {MAX_PHOTOS} fotos + 1 video
        </p>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      {/* Items en carga */}
      {uploading.length > 0 && (
        <div className="flex flex-col gap-2">
          {uploading.map((u) => (
            <div
              key={u.id}
              className="flex items-center gap-3 rounded-xl border px-3 py-2"
              style={{ borderColor: u.error ? "rgb(239 68 68)" : "var(--border)", backgroundColor: "var(--bg2)" }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs truncate" style={{ color: "var(--muted)" }}>
                  {u.name}
                </p>
                {u.error ? (
                  <p className="text-xs text-red-400">{u.error}</p>
                ) : (
                  <div className="mt-1 h-1 rounded-full overflow-hidden" style={{ backgroundColor: "var(--border)" }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${u.progress}%`, backgroundColor: "var(--blue)" }}
                    />
                  </div>
                )}
              </div>
              {u.error && (
                <button
                  onClick={() => setUploading((prev) => prev.filter((x) => x.id !== u.id))}
                  className="text-xs"
                  style={{ color: "var(--dim)" }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Preview grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {value.map((item, i) => {
            const isFirst = item.media_type === "photo" && i === 0;
            const photoIndex = value.filter((m, idx) => m.media_type === "photo" && idx < i).length;

            return (
              <div
                key={item.url}
                className="relative group aspect-square rounded-xl overflow-hidden border"
                style={{ borderColor: isFirst ? "var(--blue)" : "var(--border)" }}
              >
                {item.media_type === "photo" ? (
                  <Image
                    src={item.url}
                    alt={`Media ${i + 1}`}
                    fill
                    sizes="120px"
                    className="object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-2xl"
                    style={{ backgroundColor: "var(--bg)" }}
                  >
                    ▶️
                  </div>
                )}

                {/* Overlay con acciones */}
                <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
                >
                  {item.media_type === "photo" && photoIndex > 0 && (
                    <button
                      onClick={() => movePhoto(photoIndex, photoIndex - 1)}
                      className="w-7 h-7 rounded-full bg-white/20 text-white text-xs flex items-center justify-center hover:bg-white/30"
                    >
                      ←
                    </button>
                  )}
                  <button
                    onClick={() => removeItem(i)}
                    className="w-7 h-7 rounded-full bg-red-500/80 text-white text-xs flex items-center justify-center hover:bg-red-500"
                  >
                    ✕
                  </button>
                  {item.media_type === "photo" && photoIndex < photos.length - 1 && (
                    <button
                      onClick={() => movePhoto(photoIndex, photoIndex + 1)}
                      className="w-7 h-7 rounded-full bg-white/20 text-white text-xs flex items-center justify-center hover:bg-white/30"
                    >
                      →
                    </button>
                  )}
                </div>

                {/* Badge principal */}
                {isFirst && (
                  <span className="absolute bottom-1 left-1 text-xs px-1.5 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: "var(--blue)", color: "#fff" }}
                  >
                    Principal
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
