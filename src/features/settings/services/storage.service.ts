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
  usedStorageBytes: 52428800,
  usedStorageFormatted: '50.0 MB',
  maxStorageBytes: 1073741824,
  maxStorageFormatted: '1.0 GB',
  usagePercentage: 4.88,
  totalFilesCount: 4,
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
    const { data } = await api.get<ApiResponse<StorageBreakdown>>('/storage/breakdown');
    if (data?.data) return storageBreakdownSchema.parse(data.data);
  } catch {
    // Fallback
  }
  await delay(80);
  return storageBreakdownSchema.parse(mockBreakdown);
}

export async function getStorageFiles(
  filters?: StorageFilesFilter
): Promise<StorageFileItem[]> {
  try {
    const { data } = await api.get<ApiResponse<PaginatedResponse<StorageFileItem> | StorageFileItem[]>>(
      '/storage/files',
      { params: filters }
    );
    if (data?.data) {
      const items = Array.isArray(data.data) ? data.data : data.data.items;
      return items.map((f) => storageFileItemSchema.parse(f));
    }
  } catch {
    // Fallback
  }
  await delay(100);
  let filtered = [...mockFiles];
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    filtered = filtered.filter(
      (f) => f.name.toLowerCase().includes(q) || f.courseName?.toLowerCase().includes(q)
    );
  }
  if (filters?.fileType && filters.fileType !== 'ALL') {
    filtered = filtered.filter((f) => f.fileType === filters.fileType);
  }
  return filtered.map((f) => storageFileItemSchema.parse(f));
}

export async function deleteStorageFile(materialId: string): Promise<{ success: boolean; message: string }> {
  try {
    const { data } = await api.delete<ApiResponse<{ message: string }>>(`/storage/files/${materialId}`);
    mockFiles = mockFiles.filter((f) => f.id !== materialId);
    return { success: true, message: data?.message || 'Xóa tệp thành công' };
  } catch {
    // Fallback
  }
  await delay(150);
  mockFiles = mockFiles.filter((f) => f.id !== materialId);
  return { success: true, message: 'Đã xóa tệp để giải phóng dung lượng' };
}
