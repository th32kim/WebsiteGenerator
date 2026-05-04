"use client";

import React, { useRef, useState } from "react";
import {
  Image as ImageIcon,
  Crop,
  Expand,
  ImageUpscale,
  Loader2Icon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Props = {
  selectedEl: HTMLImageElement;
};

const transformOptions = [
  { label: "Resize", value: "resize", icon: Crop },
  { label: "Upscale", value: "upscale", icon: Expand },
  { label: "BG Remove", value: "bgremove", icon: ImageUpscale },
];

function ImageSettingSection({ selectedEl }: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [width, setWidth] = useState<number>(selectedEl.width || 300);
  const [height, setHeight] = useState<number>(selectedEl.height || 200);
  const [selectedImage, setSelectedImage] = useState<File>();
  const [loading, setLoading] = useState(false);
  const [borderRadius, setBorderRadius] = useState(
    selectedEl.style.borderRadius || "0px"
  );

  const [preview, setPreview] = useState<string>(
    selectedEl.src || ""
  );

  const [activeTransforms, setActiveTransforms] = useState<string[]>([]);

  const toggleTransform = (value: string) => {
    setActiveTransforms((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveUploadedFile = async () => {
    if (!selectedImage || !preview) return;

    setLoading(true);
    selectedEl.setAttribute("src", preview);
    selectedEl.setAttribute("alt", selectedImage.name);
    setLoading(false);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };


  return (
    <div className="w-96 shadow p-4 space-y-4">
      <h2 className="flex gap-2 items-center font-bold">
        <ImageIcon /> Image Settings
      </h2>

      {/* Preview */}
      <div className="flex justify-center">
        <img
          src={preview}
          alt="preview"
          className="h-48 object-contain border rounded cursor-pointer hover:opacity-80"
          onClick={openFileDialog}
          onLoad={() => setLoading(false)}
        />
        
      </div>

      {/* Hidden file input */}
      <Input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      {/* Upload button */}
      <Button
        type="button"
        variant="outline"
        onClick={saveUploadedFile}
        className="w-full"
        disabled={loading}
      >
        {loading && <Loader2Icon className="animate-spin"/>} Upload Image
      </Button>
    </div>
  );
}

export default ImageSettingSection;