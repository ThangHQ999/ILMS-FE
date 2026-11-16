import type { Metadata } from 'next';
import { DesignSystemSettings } from '@/components/DesignSystemSettings';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Design System',
  description: 'ILMS Design System Customizer & Settings.',
  path: '/design-system',
  noIndex: true,
});

export default function DesignSystemPage() {
  return <DesignSystemSettings />;
}
