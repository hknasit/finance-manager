/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef } from "react";
import { CldUploadWidget } from "next-cloudinary";
import { Upload, X, Camera } from "lucide-react";
import { CldImage } from "next-cloudinary";
import { CloudinaryUploadResult, CloudinaryAsset } from "@/types/cloudinary";

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
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Create a CloudinaryAsset from upload result
  const processUploadResult = (result: any) => {
    setError(null);

    // Create a thumbnail URL using Cloudinary transformations
    const thumbnailUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/c_fill,w_100,h_100/${result.public_id}`;

    onChange({
      publicId: result.public_id,
      url: result.secure_url,
      thumbnailUrl,
    });
  };

  const handleUploadSuccess = (result: CloudinaryUploadResult) => {
    processUploadResult(result);
  };

  const handleUploadError = (error: string) => {
    console.error("Upload error:", error);
    setError("Failed to upload image. Please try again.");
  };

  const handleRemove = () => {
    onChange(null);
  };

  const startCamera = async () => {
    setIsCapturing(true);
    setError(null);

    try {
      console.log("Checking camera support...");
      // First check if the browser supports getUserMedia
      if (!navigator.mediaDevices) {
        console.error("mediaDevices not available");
        throw new Error(
          "Your browser does not support camera access (mediaDevices API missing)"
        );
      }

      if (!navigator.mediaDevices.getUserMedia) {
        console.error("getUserMedia not available");
        throw new Error(
          "Your browser does not support camera access (getUserMedia missing)"
        );
      }

      console.log("Requesting camera access...");
      // Log the origin to verify if it's secure
      console.log("Current origin:", window.location.origin);
      console.log("Is secure context:", window.isSecureContext);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      console.log("Camera access granted!", stream.getVideoTracks());

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Detailed camera error:", err);
      // Log every property of the error object
      if (err instanceof Error) {
        console.log("Error name:", err.name);
        console.log("Error message:", err.message);
        console.log("Error stack:", err.stack);
      }

      // More specific error handling...
      setError(
        "Failed to access camera. Please check permissions and browser console for details."
      );
      setIsCapturing(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCapturing(false);
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert canvas to blob
        canvas.toBlob(
          async (blob) => {
            if (blob) {
              // Create a File object from the blob
              const file = new File([blob], "camera-capture.jpg", {
                type: "image/jpeg",
              });

              // Upload to Cloudinary directly
              uploadToCloudinary(file);
            }
          },
          "image/jpeg",
          0.9
        );
      }

      // Stop camera after capturing
      stopCamera();
    }
  };

  const uploadToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || ""
    );
    formData.append("folder", "finance-app/receipts");

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error.message);
      }

      // Process the upload result instead of trying to cast it to CloudinaryUploadResult
      processUploadResult(result);
    } catch (error) {
      handleUploadError("Failed to upload image: " + (error as Error).message);
    }
  };

  const handleDirectFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      // Validate file size
      if (file.size > 5000000) {
        // 5MB
        setError("File size exceeds 5MB limit");
        return;
      }

      // Validate file type
      const validTypes = ["image/png", "image/jpeg", "image/jpg"];
      if (!validTypes.includes(file.type)) {
        setError("Only PNG and JPEG images are allowed");
        return;
      }

      uploadToCloudinary(file);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">
        Receipt Image
      </label>

      {error && <div className="text-sm text-red-600">{error}</div>}

      {isCapturing ? (
        <div className="space-y-4">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-64 bg-slate-100 rounded-xl object-cover"
          />
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={captureImage}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Capture
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
            >
              Cancel
            </button>
          </div>
          {/* Hidden canvas for processing the image */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      ) : !value ? (
        <div className="space-y-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={startCamera}
              disabled={disabled}
              className="flex-1 flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-200 rounded-xl hover:border-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Camera className="w-5 h-5 text-slate-400" />
              <span className="text-sm text-slate-600">Use Camera</span>
            </button>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/png,image/jpeg,image/jpg"
              onChange={handleDirectFileUpload}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="flex-1 flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-200 rounded-xl hover:border-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-5 h-5 text-slate-400" />
              <span className="text-sm text-slate-600">Select File</span>
            </button>
          </div>

          <CldUploadWidget

            uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
            options={{
              maxFiles: 1,
              sources: ["local", "camera"],
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
                  sourceBg: "#E4EBF1",
                },
              },
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
                  Use Cloudinary Widget
                </span>
              </button>
            )}
          </CldUploadWidget>
        </div>
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
