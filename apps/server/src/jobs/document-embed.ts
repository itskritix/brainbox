import { OpenAIEmbeddings } from '@langchain/openai';
import { sql } from 'kysely';

import { extractDocumentText, getNodeModel } from '@brainbox/core';
import { database } from '@brainbox/server/data/database';
import { CreateDocumentEmbedding } from '@brainbox/server/data/schema';
import { JobHandler } from '@brainbox/server/jobs';
import { chunkText } from '@brainbox/server/lib/ai/chunking';
import { config } from '@brainbox/server/lib/config';
import { fetchNode } from '@brainbox/server/lib/nodes';

export type DocumentEmbedInput = {
  type: 'document.embed';
  documentId: string;
};

declare module '@brainbox/server/jobs' {
  interface JobMap {
    'document.embed': {
      input: DocumentEmbedInput;
    };
  }
}

export const documentEmbedHandler: JobHandler<DocumentEmbedInput> = async (
  input
) => {
  if (!config.ai.enabled) {
    return;
  }

  const { documentId } = input;
  const document = await database
    .selectFrom('documents')
    .select(['id', 'content', 'workspace_id', 'created_at', 'revision'])
    .where('id', '=', documentId)
    .executeTakeFirst();

  if (!document) {
    return;
  }

  const node = await fetchNode(documentId);
  if (!node) {
    return;
  }

  const nodeModel = getNodeModel(node.type);
  if (!nodeModel?.documentSchema) {
    return;
  }

  const text = extractDocumentText(node.id, document.content);
  if (!text || text.trim() === '') {
    await database
      .deleteFrom('document_embeddings')
      .where('document_id', '=', documentId)
      .execute();

    return;
  }

  const embeddings = new OpenAIEmbeddings({
    apiKey: config.ai.embedding.apiKey,
    modelName: config.ai.embedding.modelName,
    dimensions: config.ai.embedding.dimensions,
  });

  const existingEmbeddings = await database
    .selectFrom('document_embeddings')
    .select(['chunk', 'revision', 'text', 'summary'])
    .where('document_id', '=', documentId)
    .execute();

  const revision =
    existingEmbeddings.length > 0 ? existingEmbeddings[0]!.revision : 0n;

  if (revision >= document.revision) {
    return;
  }

  const textChunks = await chunkText(
    text,
    existingEmbeddings.map((e) => ({
      text: e.text,
      summary: e.summary ?? undefined,
    })),
    node.type
  );

  const embeddingsToUpsert: CreateDocumentEmbedding[] = [];
  for (let i = 0; i < textChunks.length; i++) {
    const chunk = textChunks[i];
    if (!chunk) {
      continue;
    }

    const existing = existingEmbeddings.find((e) => e.chunk === i);
    if (existing && existing.text === chunk.text) {
      continue;
    }

    embeddingsToUpsert.push({
      document_id: documentId,
      chunk: i,
      revision: document.revision,
      workspace_id: document.workspace_id,
      text: chunk.text,
      summary: chunk.summary,
      embedding_vector: [],
      created_at: new Date(),
    });
  }

  const batchSize = config.ai.embedding.batchSize;
  for (let i = 0; i < embeddingsToUpsert.length; i += batchSize) {
    const batch = embeddingsToUpsert.slice(i, i + batchSize);
    const textsToEmbed = batch.map((item) =>
      item.summary ? `${item.summary}\n\n${item.text}` : item.text
    );

    const embeddingVectors = await embeddings.embedDocuments(textsToEmbed);
    for (let j = 0; j < batch.length; j++) {
      const vector = embeddingVectors[j];
      const batchItem = batch[j];
      if (batchItem) {
        batchItem.embedding_vector = vector ?? [];
      }
    }
  }

  if (embeddingsToUpsert.length === 0) {
    return;
  }

  await database
    .insertInto('document_embeddings')
    .values(
      embeddingsToUpsert.map((embedding) => ({
        document_id: embedding.document_id,
        chunk: embedding.chunk,
        revision: embedding.revision,
        workspace_id: embedding.workspace_id,
        text: embedding.text,
        summary: embedding.summary,
        embedding_vector: sql.raw(
          `'[${embedding.embedding_vector.join(',')}]'::vector`
        ),
        created_at: embedding.created_at,
      }))
    )
    .onConflict((oc) =>
      oc.columns(['document_id', 'chunk']).doUpdateSet({
        text: sql.ref('excluded.text'),
        summary: sql.ref('excluded.summary'),
        embedding_vector: sql.ref('excluded.embedding_vector'),
        updated_at: new Date(),
      })
    )
    .execute();
};
