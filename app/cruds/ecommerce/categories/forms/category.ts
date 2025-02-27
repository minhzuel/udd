import { z } from 'zod';

export const CategorySchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters long.' })
    .max(50, { message: 'Name must not exceed 50 characters.' }),
  slug: z
    .string()
    .min(2, { message: 'Slug must be at least 2 characters long.' })
    .regex(/^[a-z0-9-]+$/, {
      message: 'Slug can only contain lowercase letters, numbers, and hyphens.',
    }),
  description: z
    .string()
    .max(200, { message: 'Description must not exceed 200 characters.' })
    .optional(),
});

export type CategorySchemaType = z.infer<typeof CategorySchema>;
