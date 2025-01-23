/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { CldUploadWidget } from 'next-cloudinary';
import { Upload, X } from 'lucide-react';
import { CldImage } from 'next-cloudinary';
import { CloudinaryUploadResult, CloudinaryAsset } from '@/types/cloudinary';

interface ReceiptUploadProps {
  onChange: (asset: CloudinaryAsset | null) => void;
  value?: CloudinaryAsset | null;
  disabled?: boolean;
}

export function ReceiptUpload({ onChange, value, disabled }: ReceiptUploadProps) {
  const [error, setError] = useState<string | null>(null);

  const handleUploadSuccess = (result: CloudinaryUploadResult) => {
    setError(null);
    
    // Create a thumbnail URL using Cloudinary transformations
    const thumbnailUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/c_fill,w_100,h_100/${result.public_id}`;
    
    onChange({
      publicId: result.public_id,
      url: result.secure_url,
      thumbnailUrl
    });
  };

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error);
    setError('Failed to upload image. Please try again.');
  };

  const handleRemove = () => {
    onChange(null);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">
        Receipt Image
      </label>
      
      {error && (
        <div className="text-sm text-red-600">
          {error}
        </div>
      )}

      {!value ? (
        <CldUploadWidget
          uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
          options={{
            maxFiles: 1,
            resourceType: "image",
            folder: "finance-app/receipts",
            clientAllowedFormats: ["png", "jpeg", "jpg"],
            maxFileSize: 5000000, // 5MB
            showUploadMoreButton: false,
            styles: {
              palette: {
                window: "#FFFFFF",
                windowBorder: "#90A0B3",
                tabIcon: "#0078FF",
                menuIcons: "#5A616A",
                textDark: "#000000",
                textLight: "#FFFFFF",
                link: "#0078FF",
                action: "#FF620C",
                inactiveTabIcon: "#0E2F5A",
                error: "#F44235",
                inProgress: "#0078FF",
                complete: "#20B832",
                sourceBg: "#E4EBF1"
              }
            }
          }}
          onSuccess={(result: any) => handleUploadSuccess(result.info)}
          onError={handleUploadError}
        >
          {({ open }) => (
            <button
              type="button"
              onClick={() => open()}
              disabled={disabled}
              className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-200 rounded-xl hover:border-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-5 h-5 text-slate-400" />
              <span className="text-sm text-slate-600">
                Upload receipt image
              </span>
            </button>
          )}
        </CldUploadWidget>
      ) : (
        <div className="relative rounded-xl overflow-hidden">
          <CldImage
            width="400"
            height="300"
            src={value.publicId}
            alt="Receipt"
            className="w-full h-32 object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled}
            className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      )}
    </div>
  );
}