import { z } from 'zod';
import { api } from '@/lib/axios';
import type { ApiResponse } from '@/types/common';

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB per docs/api-spec.md §14

export const fileUploadResponseSchema = z.object({
  publicId: z.string().optional(),
  fileId: z.string().optional(),
  materialId: z.string().optional(),
  url: z.string().url().optional(),
  secureUrl: z.string().url().optional(),
  fileUrl: z.string().url().optional(),
  directUrl: z.string().url().optional(),
  downloadUrl: z.string().url().optional(),
  format: z.string().optional(),
  fileType: z.string().optional(),
  resourceType: z.string().optional(),
  bytes: z.number().optional(),
  fileSizeBytes: z.number().optional(),
  fileSizeFormatted: z.string().optional(),
  originalFilename: z.string().optional(),
});

export type FileUploadResponse = z.infer<typeof fileUploadResponseSchema>;

export interface UploadedImageResult {
  url: string;
  publicId?: string;
  originalFilename?: string;
}

/**
 * Uploads an image file to Cloudinary via POST /api/v1/uploads/image.
 */
export async function uploadImage(
  file: File,
  folder = 'ilms/classes',
  signal?: AbortSignal
): Promise<UploadedImageResult> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Vui lòng chọn tệp hình ảnh hợp lệ (PNG, JPG, WEBP).');
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error('Kích thước ảnh vượt quá giới hạn tối đa 10 MB.');
  }

  const formData = new FormData();
  formData.append('file', file);
  if (folder) {
    formData.append('folder', folder);
  }

  const { data } = await api.post<ApiResponse<unknown>>('/uploads/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 30_000,
    signal,
  });

  const parsed = fileUploadResponseSchema.parse(data?.data ?? data);
  const resolvedUrl = parsed.secureUrl || parsed.url;

  if (!resolvedUrl) {
    throw new Error('Máy chủ không trả về đường dẫn ảnh sau khi tải lên.');
  }

  return {
    url: resolvedUrl,
    publicId: parsed.publicId,
    originalFilename: parsed.originalFilename,
  };
}

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25MB

export interface UploadedFileResult {
  url: string;
  publicId?: string;
  originalFilename: string;
  bytes?: number;
  format?: string;
}

/**
 * Uploads a file using the appropriate Unified Google Drive endpoint per api-spec.md §14:
 * - Images -> POST /api/v1/uploads/image
 * - Videos -> POST /api/v1/uploads/video
 * - All other files (PDF, Word, PPTX, archives, etc.) -> POST /api/v1/uploads/drive
 */
export async function uploadFile(
  file: File,
  folder = 'ilms/announcements',
  signal?: AbortSignal
): Promise<UploadedFileResult> {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error('Kích thước tệp vượt quá giới hạn tối đa 25 MB.');
  }

  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');
  const endpoint = isImage
    ? '/uploads/image'
    : isVideo
      ? '/uploads/video'
      : '/uploads/drive';

  const formData = new FormData();
  formData.append('file', file);
  if (!isImage && !isVideo) {
    formData.append('title', file.name);
  }
  if (folder) {
    formData.append('folder', folder);
  }

  const { data } = await api.post<ApiResponse<unknown>>(endpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 60_000,
    signal,
  });

  const parsed = fileUploadResponseSchema.parse(data?.data ?? data);
  const resolvedUrl = isImage
    ? parsed.directUrl || parsed.secureUrl || parsed.url || parsed.fileUrl
    : parsed.fileUrl || parsed.url || parsed.downloadUrl || parsed.directUrl || parsed.secureUrl;

  if (!resolvedUrl) {
    throw new Error('Máy chủ không trả về đường dẫn tệp sau khi tải lên.');
  }

  return {
    url: resolvedUrl,
    publicId: parsed.publicId || parsed.fileId,
    originalFilename: parsed.originalFilename || file.name,
    bytes: parsed.fileSizeBytes ?? parsed.bytes ?? file.size,
    format: parsed.format || parsed.fileType,
  };
}
