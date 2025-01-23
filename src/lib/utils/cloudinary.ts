import { CloudinaryAsset, CloudinaryUploadResult } from '@/types/cloudinary';
import { cloudinaryConfig } from '@/lib/config/cloudinary';

export const generateThumbnailUrl = (publicId: string): string => {
  return `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/image/upload/c_fill,w_100,h_100/${publicId}`;
};

export const formatCloudinaryResult = (result: CloudinaryUploadResult): CloudinaryAsset => {
  return {
    publicId: result.public_id,
    url: result.secure_url,
    thumbnailUrl: generateThumbnailUrl(result.public_id),
    width: result.width,
    height: result.height,
    format: result.format
  };
};