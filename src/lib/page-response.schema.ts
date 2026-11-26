import { z } from 'zod';

export function pageResponseSchema<Item extends z.ZodType>(item: Item) {
  return z.object({
    items: z.array(item),
    pageNumber: z.number(),
    pageSize: z.number(),
    totalElements: z.number(),
    totalPages: z.number(),
    last: z.boolean(),
  }).transform(({ last, ...page }) => ({ ...page, isLast: last }));
}
