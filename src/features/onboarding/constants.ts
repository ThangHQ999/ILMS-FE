import { ColorOption, FontFamilyName } from './types';

export const ONBOARDING_STORAGE_KEYS = {
  LAYOUT_MODE: 'ilms_layout_mode',
  AI_PERSONA: 'ilms_ai_persona',
  THEME_MODE: 'ilms_theme_mode',
  COLOR_TOKENS: 'ilms_color_tokens',
  FONT_FAMILY: 'ilms_font_family',
  COMPLETED: 'ilms_onboarding_completed',
} as const;

export const PRIMARY_PALETTE: ColorOption[] = [
  { name: 'Midnight Navy', hex: '#0A192F', rgb: '10 25 47' },
  { name: 'Royal Blue', hex: '#2563EB', rgb: '37 99 235' },
  { name: 'Deep Navy', hex: '#1E3A8A', rgb: '30 58 138' },
  { name: 'Indigo', hex: '#4F46E5', rgb: '79 70 229' },
  { name: 'Emerald', hex: '#059669', rgb: '5 150 105' },
];

export const SECONDARY_PALETTE: ColorOption[] = [
  { name: 'Tech Blue', hex: '#007BFF', rgb: '0 123 255' },
  { name: 'Sky Blue', hex: '#38BDF8', rgb: '56 189 248' },
  { name: 'Purple', hex: '#8B5CF6', rgb: '139 92 246' },
  { name: 'Amber', hex: '#F59E0B', rgb: '245 158 11' },
  { name: 'Rose', hex: '#F43F5E', rgb: '244 63 94' },
];

export const TERTIARY_PALETTE: ColorOption[] = [
  { name: 'Electric Indigo', hex: '#6C5CE7', rgb: '108 92 231' },
  { name: 'Violet', hex: '#7C3AED', rgb: '124 58 237' },
  { name: 'Teal', hex: '#14B8A6', rgb: '20 184 166' },
  { name: 'Orange', hex: '#FB923C', rgb: '251 146 60' },
  { name: 'Pink', hex: '#EC4899', rgb: '236 72 153' },
];

export const NEUTRAL_PALETTE: ColorOption[] = [
  { name: 'Soft Surface', hex: '#F0F4F8', rgb: '240 244 248' },
  { name: 'Slate', hex: '#64748B', rgb: '100 116 139' },
  { name: 'Zinc', hex: '#71717A', rgb: '113 113 122' },
  { name: 'Stone', hex: '#78716C', rgb: '120 113 108' },
];

export const FONTS_LIST: {
  name: FontFamilyName;
  tag: string;
  description: string;
  weights: string;
  badge: string;
}[] = [
  {
    name: 'Plus Jakarta Sans',
    tag: 'Phong cách SaaS hiện đại',
    description: 'Aa Bb Gg 123 • Khởi tạo tư duy logic và trải nghiệm hiện đại.',
    weights: '700 / 600 / 500',
    badge: 'Khuyên dùng',
  },
  {
    name: 'Inter',
    tag: 'Chuẩn UI/UX quốc tế',
    description: 'Aa Bb Gg 123 • Rõ ràng, tối ưu số liệu và mật độ cao.',
    weights: '600 / 500 / 400',
    badge: 'Độ đọc cao',
  },
  {
    name: 'Montserrat',
    tag: 'Hình học, trẻ trung',
    description: 'Aa Bb Gg 123 • Đậm chất hình học phóng khoáng, nổi bật cá tính.',
    weights: '700 / 600 / 400',
    badge: 'Sáng tạo',
  },
  {
    name: 'Be Vietnam Pro',
    tag: 'Tối ưu tiếng Việt chuẩn',
    description: 'Aa Bb Gg 123 • Dấu thanh chuẩn xác, khoảng cách ký tự hoàn hảo.',
    weights: '700 / 500 / 400',
    badge: 'Bản địa hóa',
  },
];
