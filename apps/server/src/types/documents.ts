import { DocumentContent } from '@brainbox/core';
import { SelectDocument } from '@brainbox/server/data/schema';

export type CreateDocumentInput = {
  nodeId: string;
  content: DocumentContent;
  userId: string;
  workspaceId: string;
};

export type CreateDocumentOutput = {
  document: SelectDocument;
};
