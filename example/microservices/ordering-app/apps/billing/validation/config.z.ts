import { z } from 'zod';

export const validateConfig = (config: unknown) => {
  const parsed = z
    .object({
      RABBIT_MQ_URI: z.string().url().min(1),
      RABBIT_MQ_BILLING_QUEUE: z.string().default('5000'),
    })
    .safeParse(config);

  if (!parsed.success) {
    throw new Error('Config validation error');
  }

  return parsed.data;
};
