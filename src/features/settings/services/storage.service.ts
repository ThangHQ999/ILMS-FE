import { api } from '@/lib/axios';
import { ApiResponse, PaginatedResponse } from '@/types/common';
import {
  storageSummarySchema,
  storageBreakdownSchema,
  storageFileItemSchema,
  type StorageSummary,
  type StorageBreakdown,
  type StorageFileItem,
  type StorageFilesFilter,
} from '../schemas/storage.schema';

const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

const defaultStorageSummary: StorageSummary = {
  usedStorageBytes: 0,
  usedStorageFormatted: '0 B',
  maxStorageBytes: 1073741824,
  maxStorageFormatted: '1.0 GB',
  usagePercentage: 0,
  totalFilesCount: 0,
  planName: 'Gói Cơ bản',
  planCode: 'FREE',
  isStorageNearLimit: false,
  maxUploadFileSizeBytes: 26214400,
  maxUploadFileSizeFormatted: '25.0 MB',
};

const mockBreakdown: StorageBreakdown = {
  byFileType: [
    {
      fileType: 'PDF',
      fileCount: 15,
      totalBytes: 314572800,
      totalBytesFormatted: '300.0 MB',
      percentage: 60.0,
    },
    {
      fileType: 'MP4',
      fileCount: 2,
      totalBytes: 157286400,
      totalBytesFormatted: '150.0 MB',
      percentage: 30.0,
    },
    {
      fileType: 'DOCX',
      fileCount: 7,
      totalBytes: 52428800,
      totalBytesFormatted: '50.0 MB',
      percentage: 10.0,
    },
  ],
  byCourse: [
    {
      courseId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      courseName: 'Lập trình Web nâng cao',
      fileCount: 10,
      totalBytes: 209715200,
      totalBytesFormatted: '200.0 MB',
      percentage: 40.0,
    },
    {
      courseId: '4fa85f64-5717-4562-b3fc-2c963f66afa7',
      courseName: 'Cấu trúc dữ liệu & Giải thuật',
      fileCount: 8,
      totalBytes: 157286400,
      totalBytesFormatted: '150.0 MB',
      percentage: 30.0,
    },
    {
      courseId: '5fa85f64-5717-4562-b3fc-2c963f66afa8',
      courseName: 'Mạng máy tính & Truyền thông',
      fileCount: 6,
      totalBytes: 157286400,
      totalBytesFormatted: '150.0 MB',
      percentage: 30.0,
    },
  ],
};

let mockFiles: StorageFileItem[] = [
  {
    id: 'mat-001',
    name: 'GiaoTrinh_LapTrinhWeb_v2.pdf',
    fileType: 'PDF',
    sizeBytes: 83886080,
    sizeFormatted: '80.0 MB',
    courseId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    courseName: 'Lập trình Web nâng cao',
    uploadedAt: '2026-11-02T10:15:00Z',
  },
  {
    id: 'mat-002',
    name: 'Video_Buoi04_WebSockets_SSE.mp4',
    fileType: 'MP4',
    sizeBytes: 157286400,
    sizeFormatted: '150.0 MB',
    courseId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    courseName: 'Lập trình Web nâng cao',
    uploadedAt: '2026-11-05T14:30:00Z',
  },
  {
    id: 'mat-003',
    name: 'BaiTapLon_DeTaiNhom.docx',
    fileType: 'DOCX',
    sizeBytes: 26214400,
    sizeFormatted: '25.0 MB',
    courseId: '4fa85f64-5717-4562-b3fc-2c963f66afa7',
    courseName: 'Cấu trúc dữ liệu & Giải thuật',
    uploadedAt: '2026-11-08T09:00:00Z',
  },
  {
    id: 'mat-004',
    name: 'Slide_Chuong02_DoThiTriThuc.pdf',
    fileType: 'PDF',
    sizeBytes: 104857600,
    sizeFormatted: '100.0 MB',
    courseId: '5fa85f64-5717-4562-b3fc-2c963f66afa8',
    courseName: 'Mạng máy tính & Truyền thông',
    uploadedAt: '2026-11-10T16:45:00Z',
  },
];

export async function getStorageSummary(): Promise<StorageSummary> {
  try {
    const { data } = await api.get<ApiResponse<StorageSummary>>('/storage/summary');
    if (data?.data) return storageSummarySchema.parse(data.data);
  } catch {
    // Fallback
  }
  await delay(50);
  if (typeof window !== 'undefined') {
    try {
      const storedSub = localStorage.getItem('ilms_active_subscription');
      if (storedSub) {
        const parsed = JSON.parse(storedSub);
        const maxBytes = parsed.limits?.maxStorageBytes || defaultStorageSummary.maxStorageBytes;
        const usedBytes = defaultStorageSummary.usedStorageBytes;
        const usagePercentage = Number(((usedBytes / maxBytes) * 100).toFixed(2));
        return storageSummarySchema.parse({
          ...defaultStorageSummary,
          planCode: parsed.planCode || defaultStorageSummary.planCode,
          planName: parsed.planName || defaultStorageSummary.planName,
          maxStorageBytes: maxBytes,
          maxStorageFormatted: parsed.limits?.maxStorageFormatted || defaultStorageSummary.maxStorageFormatted,
          usagePercentage,
          maxUploadFileSizeBytes: parsed.limits?.maxUploadFileSizeBytes || defaultStorageSummary.maxUploadFileSizeBytes,
          maxUploadFileSizeFormatted: parsed.limits?.maxUploadFileSizeFormatted || defaultStorageSummary.maxUploadFileSizeFormatted,
        });
      }
    } catch {}
  }
  return storageSummarySchema.parse(defaultStorageSummary);
}

export async function getStorageBreakdown(): Promise<StorageBreakdown> {
  try {
    const { data } = await api.get<ApiResponse<unknown>>('/storage/breakdown');
    const raw = data?.data ?? data;
    if (raw && typeof raw === 'object') {
      const rec = raw as Record<string, unknown>;
      return storageBreakdownSchema.parse({
        byFileType: Array.isArray(rec.byFileType) ? rec.byFileType : [],
        byCourse: Array.isArray(rec.byCourse) ? rec.byCourse : [],
      });
    }
  } catch {
    // Backend unavailable
  }
  return { byFileType: [], byCourse: [] };
}

function formatBytesFallback(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export async function getStorageFiles(
  filters?: StorageFilesFilter
): Promise<StorageFileItem[]> {
  try {
    const { data } = await api.get<ApiResponse<unknown>>('/storage/files', {
      params: filters,
    });
    const raw = data?.data ?? data;
    const list = Array.isArray(raw)
      ? raw
      : raw && typeof raw === 'object'
        ? (raw as { content?: unknown[]; items?: unknown[]; files?: unknown[] }).content ??
          (raw as { items?: unknown[] }).items ??
          (raw as { files?: unknown[] }).files ??
          []
        : [];

    return list.map((entry, idx) => {
      const rec = entry as Record<string, unknown>;
      const sizeBytes = Number(rec.sizeBytes ?? rec.fileSizeBytes ?? rec.bytes ?? 0);
      const publicId = rec.publicId
        ? String(rec.publicId)
        : rec.fileId
          ? String(rec.fileId)
          : undefined;
      return storageFileItemSchema.parse({
        id: String(rec.id ?? rec.materialId ?? publicId ?? idx + 1),
        publicId,
        fileId: rec.fileId ? String(rec.fileId) : publicId,
        name: String(
          rec.name ?? rec.title ?? rec.originalFilename ?? rec.fileName ?? 'Tệp không tên'
        ),
        fileType: String(rec.fileType ?? rec.format ?? 'OTHER').toUpperCase(),
        sizeBytes,
        sizeFormatted: String(
          rec.sizeFormatted ?? rec.fileSizeFormatted ?? formatBytesFallback(sizeBytes)
        ),
        courseId: rec.courseId ? String(rec.courseId) : undefined,
        courseName: rec.courseName ? String(rec.courseName) : undefined,
        uploadedAt: String(rec.uploadedAt ?? rec.createdAt ?? ''),
        downloadUrl: rec.downloadUrl
          ? String(rec.downloadUrl)
          : rec.fileUrl
            ? String(rec.fileUrl)
            : rec.url
              ? String(rec.url)
              : undefined,
      });
    });
  } catch {
    return [];
  }
}

export async function deleteStorageFile(
  publicIdOrMaterialId: string
): Promise<{ success: boolean; message: string }> {
  const { data } = await api.delete<ApiResponse<{ message?: string }>>('/uploads', {
    params: { publicId: publicIdOrMaterialId },
  });
  return {
    success: true,
    message: data?.message || 'Đã xóa tệp và giải phóng dung lượng thành công',
  };
}
