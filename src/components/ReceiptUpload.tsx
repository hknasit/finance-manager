/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, X, Camera } from "lucide-react";
import Image from "next/image";
import { CloudinaryAsset } from "@/types/cloudinary";
import { cloudinaryConfig } from "@/lib/config/cloudinary";

interface ReceiptUploadProps {
  onChange: (asset: CloudinaryAsset | null) => void;
  value?: CloudinaryAsset | null;
  disabled?: boolean;
}

export function ReceiptUpload({
  onChange,
  value,
  disabled,
}: ReceiptUploadProps) {
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkMobile();
    
    // Listen for resize events
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const handleRemove = () => {
    onChange(null);
  };

  const handleUploadSuccess = (result: any) => {
    console.log("Upload success:", result);
    try {
      // Create a thumbnail URL using Cloudinary transformations
      const thumbnailUrl = `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/image/upload/c_fill,w_100,h_100/${result.public_id}`;

      const asset = {
        publicId: result.public_id,
        url: result.secure_url,
        thumbnailUrl: thumbnailUrl,
      };

      console.log("Created asset:", asset);
      onChange(asset);
      setIsUploading(false);
    } catch (err) {
      console.error("Error processing upload result:", err);
      setError(`Failed to process upload: ${err instanceof Error ? err.message : "Unknown error"}`);
      setIsUploading(false);
    }
  };

  const uploadToCloudinary = async (file: File) => {
    try {
      setIsUploading(true);
      setError(null);
      
      // Validate file size
      if (file.size > 5000000) { // 5MB
        throw new Error('File size exceeds 5MB limit');
      }
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        throw new Error('Only JPEG and PNG images are supported');
      }
      
      // Create a FormData object
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', cloudinaryConfig.uploadPreset || '');
      formData.append('folder', 'finance-app/receipts');
      
      console.log("Uploading to Cloudinary...");
      
      // Upload to Cloudinary
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Upload failed');
      }
      
      const result = await response.json();
      console.log("Upload successful:", result);
      
      handleUploadSuccess(result);
    } catch (err) {
      console.error("Upload failed:", err);
      setError(err instanceof Error ? err.message : 'Upload failed');
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      console.log(`Selected file: ${file.name}, type: ${file.type}, size: ${file.size}`);
      uploadToCloudinary(file);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        Receipt Image
      </label>

      {error && (
        <div className="p-2 mb-2 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium shadow-sm">
          {error}
        </div>
      )}

      {!value ? (
        <div className="space-y-2">
          {/* Camera input - hidden but used for direct camera access */}
          <input
            type="file"
            ref={cameraInputRef}
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />
          
          {/* Regular file input - hidden but used for file selection */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/jpeg,image/png"
            onChange={handleFileChange}
            className="hidden"
          />
          
          {/* Option buttons - different layouts for mobile and desktop */}
          {isMobile ? (
            // Mobile layout - Two buttons in a grid
            <div className="grid grid-cols-2 gap-2">
              {/* Camera button - only on mobile */}
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                disabled={disabled || isUploading}
                className="flex flex-col items-center justify-center gap-2 py-2.5 px-3 border border-slate-200 rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Camera className="w-5 h-5 text-slate-400" />
                <span className="text-sm text-center text-slate-600">
                  Take Photo
                </span>
              </button>
              
              {/* File selection button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || isUploading}
                className="flex flex-col items-center justify-center gap-2 py-2.5 px-3 border border-slate-200 rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="w-5 h-5 text-slate-400" />
                <span className="text-sm text-center text-slate-600">
                  Upload File
                </span>
              </button>
            </div>
          ) : (
            // Desktop layout - One button centered
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || isUploading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 border border-slate-200 rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="w-5 h-5 text-slate-400" />
                <span className="text-sm text-slate-600">
                  Upload Receipt Image
                </span>
              </button>
            </div>
          )}
          
          {isUploading && (
            <div className="mt-2 flex justify-center">
              <div className="animate-pulse text-green-600 text-sm font-medium">
                Uploading image, please wait...
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="relative rounded-xl overflow-hidden border border-slate-200">
          <div style={{ height: '128px', position: 'relative' }}>
            <Image
              src={value.url}
              alt="Receipt"
              fill
              sizes="(max-width: 768px) 100vw, 400px"
              style={{
                objectFit: 'cover'
              }}
            />
          </div>
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled}
            className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm hover:bg-slate-50 transition-colors disabled:opacity-50 z-10"
          >
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      )}
    </div>
  );
}