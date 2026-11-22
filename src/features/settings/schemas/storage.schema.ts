import { z } from 'zod';

export const storageSummarySchema = z.object({
  usedStorageBytes: z.coerce.number().default(0),
  usedStorageFormatted: z.string().default('0 B'),
  maxStorageBytes: z.coerce.number().default(1073741824),
  maxStorageFormatted: z.string().default('1.0 GB'),
  usagePercentage: z.coerce.number().default(0),
  totalFilesCount: z.coerce.number().default(0),
  planName: z.string().default('Gói Cơ bản'),
  planCode: z.string().default('FREE'),
  isStorageNearLimit: z.boolean().default(false),
  maxUploadFileSizeBytes: z.coerce.number().default(26214400),
  maxUploadFileSizeFormatted: z.string().default('25.0 MB'),
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
  byFileType: z.array(storageFileTypeBreakdownSchema).default([]),
  byCourse: z.array(storageCourseBreakdownSchema).default([]),
});

export type StorageBreakdown = z.infer<typeof storageBreakdownSchema>;

export const storageFileItemSchema = z.object({
  id: z.string(),
  publicId: z.string().optional(),
  fileId: z.string().optional(),
  name: z.string(),
  fileType: z.string().default('OTHER'),
  sizeBytes: z.coerce.number().default(0),
  sizeFormatted: z.string().default('0 B'),
  courseId: z.string().optional(),
  courseName: z.string().optional(),
  uploadedAt: z.string().default(''),
  downloadUrl: z.string().optional(),
  url: z.string().optional(),
  fileUrl: z.string().optional(),
  directUrl: z.string().optional(),
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
