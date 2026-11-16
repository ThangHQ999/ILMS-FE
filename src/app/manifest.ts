import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ILMS — Hệ thống quản lý học tập thông minh tích hợp AI',
    short_name: 'ILMS',
    description:
      'Nền tảng học tập thông minh tích hợp Gia sư AI Socratic, Đồ thị Tri thức RAG và Tháp năng lực Bloom.',
    start_url: '/',
    display: 'standalone',
    background_color: '#07173E',
    theme_color: '#0B57D0',
    icons: [
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
