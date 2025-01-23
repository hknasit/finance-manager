export interface CloudinaryUploadResult {
    asset_id: string;
    public_id: string;
    version: number;
    version_id: string;
    signature: string;
    width: number;
    height: number;
    format: string;
    resource_type: string;
    created_at: string;
    tags: string[];
    bytes: number;
    type: string;
    etag: string;
    placeholder: boolean;
    url: string;
    secure_url: string;
    original_filename: string;
    api_key: string;
  }
  
  export interface CloudinaryAsset {
    publicId: string;
    url: string;
    thumbnailUrl: string;
    width?: number;
    height?: number;
    format?: string;
  }