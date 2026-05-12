'use client';

import { Eye } from 'lucide-react';

import { IconTableAction } from '@/components/ui/icon-table-action';

export function TableViewAction({
  href,
  label = 'View application',
}: {
  href: string;
  label?: string;
}) {
  return <IconTableAction href={href} icon={Eye} label={label} />;
}
