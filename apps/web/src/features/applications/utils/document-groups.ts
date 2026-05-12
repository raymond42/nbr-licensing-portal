import type { ApplicationDocumentDto } from '@nbr/shared';

export interface DocumentVersionGroup {
  logicalKey: string;
  versions: ApplicationDocumentDto[];
}

export function groupDocumentsByLogicalKey(docs: ApplicationDocumentDto[]): DocumentVersionGroup[] {
  const map = new Map<string, ApplicationDocumentDto[]>();
  for (const d of docs) {
    const list = map.get(d.logicalKey) ?? [];
    list.push(d);
    map.set(d.logicalKey, list);
  }
  return [...map.entries()]
    .map(([logicalKey, versions]) => ({
      logicalKey,
      versions: [...versions].sort((a, b) => b.version - a.version),
    }))
    .sort((a, b) => a.logicalKey.localeCompare(b.logicalKey));
}
