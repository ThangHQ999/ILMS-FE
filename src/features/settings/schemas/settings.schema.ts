import { z } from 'zod';

export const updateProfileSchema = z.object({
  displayName: z
    .string()
    .min(2, 'Tên hiển thị phải có ít nhất 2 ký tự')
    .max(50, 'Tên hiển thị không quá 50 ký tự'),
  username: z
    .string()
    .min(3, 'Username phải có ít nhất 3 ký tự')
    .max(30, 'Username không quá 30 ký tự')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username chỉ gồm chữ cái, số và dấu gạch dưới'),
  birthDate: z.string().optional().default(''),
  bio: z.string().max(300, 'Tiểu sử không vượt quá 300 ký tự').optional().default(''),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(6, 'Mật khẩu hiện tại phải từ 6 ký tự'),
    newPassword: z.string().min(8, 'Mật khẩu mới phải từ 8 ký tự'),
    confirmPassword: z.string().min(8, 'Xác nhận mật khẩu phải từ 8 ký tự'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

export const confirmDeleteAccountSchema = z.object({
  confirmation: z.string().refine((val) => val === 'XAC NHAN', {
    message: 'Vui lòng nhập chính xác "XAC NHAN" để tiếp tục',
  }),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type ConfirmDeleteAccountFormData = z.infer<typeof confirmDeleteAccountSchema>;
