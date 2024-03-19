import { z } from 'zod';

export const validateConfig = (config: unknown) => {
  const parsed = z
    .object({
      DATABASE_URL: z.string().url().min(1),
    })
    .safeParse(config);

  if (!parsed.success) {
    throw new Error('Config validation error');
  }

  return parsed.data;
};
