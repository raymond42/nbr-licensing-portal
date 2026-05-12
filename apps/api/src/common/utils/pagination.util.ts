const DEFAULT_TAKE = 20;
const MAX_TAKE = 100;

export function parsePageTake(
  pageRaw?: string,
  takeRaw?: string,
  options?: { defaultTake?: number; maxTake?: number },
): { page: number; take: number } {
  const defaultTake = options?.defaultTake ?? DEFAULT_TAKE;
  const maxTake = options?.maxTake ?? MAX_TAKE;
  const pageNum = pageRaw !== undefined ? Number(pageRaw) : 0;
  const takeNum = takeRaw !== undefined ? Number(takeRaw) : defaultTake;
  const page = Number.isFinite(pageNum) && pageNum >= 0 ? Math.floor(pageNum) : 0;
  let take = Number.isFinite(takeNum) && takeNum >= 1 ? Math.floor(takeNum) : defaultTake;
  take = Math.min(take, maxTake);
  return { page, take };
}
