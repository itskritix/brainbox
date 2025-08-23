import { assistantRespondHandler } from '@brainbox/server/jobs/assistant-response';
import { documentEmbedHandler } from '@brainbox/server/jobs/document-embed';
import { documentEmbedScanHandler } from '@brainbox/server/jobs/document-embed-scan';
import { documentUpdatesMergeHandler } from '@brainbox/server/jobs/document-updates-merge';
import { emailPasswordResetSendHandler } from '@brainbox/server/jobs/email-password-reset-sent';
import { emailVerifySendHandler } from '@brainbox/server/jobs/email-verify-send';
import { nodeCleanHandler } from '@brainbox/server/jobs/node-clean';
import { nodeEmbedHandler } from '@brainbox/server/jobs/node-embed';
import { nodeEmbedScanHandler } from '@brainbox/server/jobs/node-embed-scan';
import { nodeUpdatesMergeHandler } from '@brainbox/server/jobs/node-updates-merge';
import { uploadsCleanHandler } from '@brainbox/server/jobs/uploads-clean';
import { workspaceCleanHandler } from '@brainbox/server/jobs/workspace-clean';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface JobMap {}

export type JobInput = JobMap[keyof JobMap]['input'];

export type JobHandler<T extends JobInput> = (input: T) => Promise<void>;

type JobHandlerMap = {
  [K in keyof JobMap]: JobHandler<JobMap[K]['input']>;
};

export const jobHandlerMap: JobHandlerMap = {
  'email.verify.send': emailVerifySendHandler,
  'email.password.reset.send': emailPasswordResetSendHandler,
  'workspace.clean': workspaceCleanHandler,
  'node.clean': nodeCleanHandler,
  'node.embed': nodeEmbedHandler,
  'document.embed': documentEmbedHandler,
  'assistant.respond': assistantRespondHandler,
  'node.embed.scan': nodeEmbedScanHandler,
  'document.embed.scan': documentEmbedScanHandler,
  'node.updates.merge': nodeUpdatesMergeHandler,
  'document.updates.merge': documentUpdatesMergeHandler,
  'uploads.clean': uploadsCleanHandler,
};
