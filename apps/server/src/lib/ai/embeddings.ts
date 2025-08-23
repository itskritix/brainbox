import { MessageAttributes } from '@brainbox/core';
import { redis } from '@brainbox/server/data/redis';
import { SelectNode } from '@brainbox/server/data/schema';
import { config } from '@brainbox/server/lib/config';
import { jobService } from '@brainbox/server/services/job-service';

export const fetchEmbeddingCursor = async (
  cursorId: string
): Promise<string> => {
  const cursorStringValue = await redis.get(`embedding_cursor:${cursorId}`);
  if (!cursorStringValue) {
    return '0';
  }

  return cursorStringValue;
};

export const updateEmbeddingCursor = async (
  cursorId: string,
  value: string
) => {
  await redis.set(`embedding_cursor:${cursorId}`, value);
};

export const deleteEmbeddingCursor = async (cursorId: string) => {
  await redis.del(`embedding_cursor:${cursorId}`);
};

export const scheduleNodeEmbedding = async (node: SelectNode) => {
  if (!config.ai.enabled) {
    return;
  }

  if (node.type === 'message') {
    const attributes = node.attributes as MessageAttributes;
    if (attributes.subtype === 'question' || attributes.subtype === 'answer') {
      return;
    }
  }

  const jobOptions: { jobId: string; delay?: number } = {
    jobId: `node.embed.${node.id}`,
  };

  // Only add delay for non-message nodes
  if (node.type !== 'message') {
    jobOptions.delay = config.ai.nodeEmbeddingDelay;
  }

  await jobService.addJob(
    {
      type: 'node.embed',
      nodeId: node.id,
    },
    jobOptions
  );
};

export const scheduleDocumentEmbedding = async (documentId: string) => {
  if (!config.ai.enabled) {
    return;
  }

  await jobService.addJob(
    {
      type: 'document.embed',
      documentId,
    },
    {
      jobId: `document.embed.${documentId}`,
      delay: config.ai.documentEmbeddingDelay,
    }
  );
};
