/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, X, Camera, Smartphone } from "lucide-react";
import { CldImage } from "next-cloudinary";
import { CloudinaryUploadResult, CloudinaryAsset } from "@/types/cloudinary";
import { cloudinaryConfig } from "@/lib/config/cloudinary";
import { CldUploadWidget } from "next-cloudinary";

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
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [browserInfo, setBrowserInfo] = useState({ name: "", version: "", os: "" });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Detect browser and device
  useEffect(() => {
    const detectEnvironment = () => {
      const userAgent = navigator.userAgent || navigator.vendor;
      
      // Detect if mobile
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      setIsMobileDevice(isMobile);
      
      // Detect browser
      let browserName = "Unknown";
      let browserVersion = "Unknown";
      let os = "Unknown";
      
      // OS detection
      if (/Android/i.test(userAgent)) {
        os = "Android";
      } else if (/iPad|iPhone|iPod/.test(userAgent)) {
        os = "iOS";
      } else if (/Windows/.test(userAgent)) {
        os = "Windows";
      } else if (/Mac OS X/.test(userAgent)) {
        os = "MacOS";
      } else if (/Linux/.test(userAgent)) {
        os = "Linux";
      }
      
      // Browser detection
      if (/MSIE|Trident/.test(userAgent)) {
        browserName = "Internet Explorer";
      } else if (/Edg/.test(userAgent)) {
        browserName = "Edge";
      } else if (/Chrome/.test(userAgent) && !/Chromium|Edg/.test(userAgent)) {
        browserName = "Chrome";
      } else if (/Firefox/.test(userAgent)) {
        browserName = "Firefox";
      } else if (/Safari/.test(userAgent) && !/Chrome/.test(userAgent)) {
        browserName = "Safari";
      } else if (/Opera|OPR/.test(userAgent)) {
        browserName = "Opera";
      }
      
      // Try to get version
      const versionMatch = userAgent.match(/(version|chrome|firefox|safari|opr|edge|msie|rv:)[\s\/:](\d+(\.\d+)?)/i);
      if (versionMatch && versionMatch[2]) {
        browserVersion = versionMatch[2];
      }
      
      setBrowserInfo({
        name: browserName,
        version: browserVersion,
        os: os
      });
      
      console.log(`Environment: ${os}, ${browserName} ${browserVersion}, Mobile: ${isMobile}`);
    };
    
    detectEnvironment();
  }, []);

  // Process upload result
  const processUploadResult = (result: any) => {
    setError(null);
    try {
      // Create a thumbnail URL using Cloudinary transformations
      const thumbnailUrl = `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/image/upload/c_fill,w_100,h_100/${result.public_id}`;

      onChange({
        publicId: result.public_id,
        url: result.secure_url,
        thumbnailUrl,
        width: result.width,
        height: result.height,
        format: result.format
      });
    } catch (err) {
      console.error("Error processing upload result:", err);
      setError("Failed to process upload. Please try again.");
    }
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

  // Mobile-optimized camera start
  const startCamera = async () => {
    setIsCapturing(true);
    setError(null);

    try {
      // Check if running in a secure context
      if (!window.isSecureContext) {
        throw new Error(
          "Camera access requires HTTPS. Please use a secure connection."
        );
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          "Your browser doesn't support camera access. Please try file upload instead."
        );
      }

      // Different constraints for iOS vs Android
      let constraints: MediaStreamConstraints = { video: true };
      
      if (isMobileDevice) {
        if (browserInfo.os === "iOS") {
          // iOS requires simpler constraints
          constraints = { 
            video: true,
            audio: false
          };
        } else {
          // Android can use more specific constraints
          constraints = {
            video: { 
              facingMode: "environment",
              width: { ideal: 1280 },
              height: { ideal: 720 }
            },
            audio: false
          };
        }
      }
      
      console.log("Using constraints:", JSON.stringify(constraints));

      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          
          // Use the play promise pattern to catch errors with autoplay
          videoRef.current.onloadedmetadata = () => {
            if (videoRef.current) {
              const playPromise = videoRef.current.play();
              if (playPromise !== undefined) {
                playPromise
                  .then(() => console.log("Video playback started successfully"))
                  .catch(e => {
                    console.error("Error playing video:", e);
                    setError("Failed to start video preview. Please try again or use file upload.");
                  });
              }
            }
          };
        } else {
          throw new Error("Video element not found");
        }
      } catch (initialErr) {
        console.warn("Initial camera access failed, trying fallback:", initialErr);
        
        // Fallback to basic constraints
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          
          videoRef.current.onloadedmetadata = () => {
            if (videoRef.current) {
              videoRef.current.play().catch(e => {
                console.error("Error playing fallback video:", e);
                setError("Failed to start video preview. Please use file upload.");
              });
            }
          };
        } else {
          throw new Error("Video element not found");
        }
      }
    } catch (err) {
      console.error("Camera error details:", err);
      
      if (err instanceof Error) {
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setError("Camera permission denied. Please allow camera access and try again.");
        } else if (err.name === "NotReadableError") {
          setError("Camera is in use by another app. Please close other camera apps and try again.");
        } else if (err.name === "OverconstrainedError") {
          setError("Your device doesn't support the requested camera settings. Please use file upload.");
        } else {
          setError(`Camera error: ${err.message}. Please try file upload instead.`);
        }
      } else {
        setError("Failed to access camera. Please try file upload instead.");
      }
      
      setIsCapturing(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCapturing(false);
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) {
      setError("Cannot capture image. Video feed not available.");
      return;
    }
    
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      // Draw video frame to canvas
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Canvas context not available");
      }
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to blob
      canvas.toBlob(
        async (blob) => {
          if (blob) {
            try {
              // Create a File object from the blob
              const file = new File([blob], "camera-capture.jpg", {
                type: "image/jpeg",
              });

              // Upload to Cloudinary
              await uploadToCloudinary(file);
              stopCamera();
            } catch (err) {
              console.error("Error processing capture:", err);
              setError("Failed to process captured image. Please try again.");
            }
          } else {
            setError("Failed to capture image. Please try again or use file upload.");
          }
        },
        "image/jpeg",
        0.9
      );
    } catch (err) {
      console.error("Error capturing image:", err);
      setError("Failed to capture image. Please try file upload instead.");
    }
  };

  const uploadToCloudinary = async (file: File) => {
    try {
      // Validate file size and type
      if (file.size > cloudinaryConfig.maxFileSize) {
        throw new Error(`File too large (max: ${cloudinaryConfig.maxFileSize / 1000000}MB)`);
      }

      const validTypes = ["image/png", "image/jpeg", "image/jpg"];
      if (!validTypes.includes(file.type)) {
        throw new Error("Only PNG and JPEG images are allowed");
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "upload_preset",
        cloudinaryConfig.uploadPreset || ""
      );
      formData.append("folder", `${cloudinaryConfig.folder}/receipts`);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error.message);
      }

      processUploadResult(result);
    } catch (error) {
      handleUploadError("Failed to upload image: " + (error as Error).message);
    }
  };

  const handleDirectFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      uploadToCloudinary(file);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">
        Receipt Image
      </label>

      {error && (
        <div className="p-2 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      {isCapturing ? (
        <div className="space-y-4">
          {/* Camera UI */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-64 bg-slate-100 rounded-xl object-cover"
          />
          
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={captureImage}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
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
          
          <canvas ref={canvasRef} className="hidden" />
        </div>
      ) : !value ? (
        <div className="space-y-2">
          {/* Options when no image is selected */}
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

          {/* Cloudinary Widget - the most reliable option for mobile */}
          <CldUploadWidget
            uploadPreset={cloudinaryConfig.uploadPreset}
            options={{
              maxFiles: 1,
              sources: ["local", "camera", "url"],
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
                <Smartphone className="w-5 h-5 text-slate-400" />
                <span className="text-sm text-slate-600">
                  Use Cloudinary Uploader (Best for Mobile)
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