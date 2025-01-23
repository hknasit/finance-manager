// lib/config/cloudinary.ts
export const cloudinaryConfig = {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
    apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    folder: 'finance-app',
    allowedFormats: ['jpg', 'jpeg', 'png', 'heic'],
    maxFileSize: 5000000, // 5MB
    transformation: {
      quality: 'auto',
      fetchFormat: 'auto',
      responsive: true,
    },
    uploadOptions: {
      maxFiles: 1,
      resourceType: 'image',
      clientAllowedFormats: ['jpg', 'jpeg', 'png', 'heic'],
      maxFileSize: 5000000,
      sources: ['local', 'camera'],
      styles: {
        palette: {
          window: '#FFFFFF',
          sourceBg: '#F8F9FA',
          windowBorder: '#E2E8F0',
          tabIcon: '#16A34A',
          inactiveTabIcon: '#94A3B8',
          menuIcons: '#475569',
          link: '#16A34A',
          action: '#16A34A',
          inProgress: '#0284C7',
          complete: '#16A34A',
          error: '#EF4444',
          textDark: '#1E293B',
          textLight: '#F8F9FA'
        }
      }
    }
  } as const;