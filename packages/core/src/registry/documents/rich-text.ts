import { z } from 'zod/v4';

import { blockSchema } from '@brainbox/core/registry/block';

export const richTextContentSchema = z.object({
  type: z.literal('rich_text'),
  blocks: z.record(z.string(), blockSchema),
});

export type RichTextContent = z.infer<typeof richTextContentSchema>;
