import { z } from 'zod';

export const validateConfig = (config: unknown) => {
  const parsed = z
    .object({
      DATABASE_URL: z.string().url().min(1),
      PORT: z.string().default('5000'),
    })
    .safeParse(config);

  if (!parsed.success) {
    throw new Error('Config validation error');
  }

  return parsed.data;
};
