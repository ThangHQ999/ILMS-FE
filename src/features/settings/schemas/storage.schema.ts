import { z } from 'zod';

export const storageSummarySchema = z.object({
  usedStorageBytes: z.number(),
  usedStorageFormatted: z.string(),
  maxStorageBytes: z.number(),
  maxStorageFormatted: z.string(),
  usagePercentage: z.number(),
  totalFilesCount: z.number(),
  planName: z.string(),
  planCode: z.string(),
  isStorageNearLimit: z.boolean(),
  maxUploadFileSizeBytes: z.number(),
  maxUploadFileSizeFormatted: z.string(),
});

export type StorageSummary = z.infer<typeof storageSummarySchema>;

export const storageFileTypeBreakdownSchema = z.object({
  fileType: z.string(),
  fileCount: z.number(),
  totalBytes: z.number(),
  totalBytesFormatted: z.string(),
  percentage: z.number(),
});

export const storageCourseBreakdownSchema = z.object({
  courseId: z.string(),
  courseName: z.string(),
  fileCount: z.number(),
  totalBytes: z.number(),
  totalBytesFormatted: z.string(),
  percentage: z.number(),
});

export const storageBreakdownSchema = z.object({
  byFileType: z.array(storageFileTypeBreakdownSchema),
  byCourse: z.array(storageCourseBreakdownSchema),
});

export type StorageBreakdown = z.infer<typeof storageBreakdownSchema>;

export const storageFileItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  fileType: z.string(),
  sizeBytes: z.number(),
  sizeFormatted: z.string(),
  courseId: z.string().optional(),
  courseName: z.string().optional(),
  uploadedAt: z.string(),
  downloadUrl: z.string().optional(),
});

export type StorageFileItem = z.infer<typeof storageFileItemSchema>;

export const storageFilesFilterSchema = z.object({
  courseId: z.string().optional(),
  fileType: z.string().optional(),
  search: z.string().optional(),
  page: z.number().optional().default(0),
  size: z.number().optional().default(10),
});

export type StorageFilesFilter = z.input<typeof storageFilesFilterSchema>;
