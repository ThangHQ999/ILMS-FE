import { z } from 'zod';

export const createLessonSessionSchema = z
  .object({
    sessionDate: z.string().min(1, { message: 'Vui lòng chọn ngày học' }),
    startTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Định dạng giờ không hợp lệ (HH:mm)' }),
    endTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Định dạng giờ không hợp lệ (HH:mm)' }),
    startShift: z.coerce.number().min(1).max(12),
    endShift: z.coerce.number().min(1).max(12),
    roomId: z.string().min(1, { message: 'Vui lòng chọn phòng học' }),
    note: z.string().optional(),
    sendEmailNotification: z.boolean().default(true),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: 'Giờ kết thúc phải lớn hơn giờ bắt đầu',
    path: ['endTime'],
  })
  .refine((data) => data.endShift >= data.startShift, {
    message: 'Tiết kết thúc phải lớn hơn hoặc bằng tiết bắt đầu',
    path: ['endShift'],
  });

export type CreateLessonSessionFormValues = z.infer<typeof createLessonSessionSchema>;

