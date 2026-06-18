"use client";

import { useRef, useState } from "react";
import { Camera, Upload, X, User } from "lucide-react";

interface PhotoUploadProps {
  photo: string | null;
  onPhotoChange: (photo: string | null) => void;
}

export default function PhotoUpload({ photo, onPhotoChange }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    if (file.size > 10 * 1024 * 1024) {
      alert("Image must be under 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      onPhotoChange(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  if (photo) {
    return (
      <div className="relative w-full aspect-[3/4] max-h-[420px] rounded-2xl overflow-hidden shadow-lg ring-2 ring-violet-200">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo}
          alt="Your full body photo"
          className="w-full h-full object-cover"
        />
        <button
          onClick={() => onPhotoChange(null)}
          className="absolute top-3 right-3 p-2 bg-black/60 backdrop-blur-sm rounded-full text-white hover:bg-black/80 transition-colors"
          aria-label="Remove photo"
        >
          <X size={18} />
        </button>
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <p className="text-white text-sm font-medium">Full body photo uploaded</p>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`w-full aspect-[3/4] max-h-[420px] rounded-2xl border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center gap-4 p-6 ${
        dragOver
          ? "border-violet-500 bg-violet-50 scale-[1.02]"
          : "border-gray-300 bg-gray-50 hover:border-violet-400 hover:bg-violet-50/50"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      <div className="w-20 h-20 rounded-full bg-violet-100 flex items-center justify-center">
        <User size={36} className="text-violet-600" />
      </div>

      <div className="text-center">
        <p className="text-lg font-semibold text-gray-800">
          Upload Full Body Photo
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Stand straight, good lighting, full body visible
        </p>
      </div>

      <div className="flex gap-3 mt-2">
        <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-full">
          <Upload size={16} />
          Choose Photo
        </span>
        <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-full border border-gray-200">
          <Camera size={16} />
          Take Photo
        </span>
      </div>
    </div>
  );
}
