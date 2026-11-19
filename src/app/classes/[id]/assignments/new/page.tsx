'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ClassNewAssignmentPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);

  useEffect(() => {
    router.replace(`/classes/${id}?tab=assignments&action=create`);
  }, [id, router]);

  return null;
}
