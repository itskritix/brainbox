import { z } from 'zod/v4';

import { hasWorkspaceRole } from '@brainbox/core/lib/permissions';
import { NodeModel, nodeRoleEnum } from '@brainbox/core/registry/nodes/core';

export const chatAttributesSchema = z.object({
  type: z.literal('chat'),
  collaborators: z.record(z.string(), nodeRoleEnum),
});

export type ChatAttributes = z.infer<typeof chatAttributesSchema>;

export const chatModel: NodeModel = {
  type: 'chat',
  attributesSchema: chatAttributesSchema,
  canCreate: (context) => {
    if (!hasWorkspaceRole(context.user.role, 'guest')) {
      return false;
    }

    if (context.attributes.type !== 'chat') {
      return false;
    }

    const collaborators = context.attributes.collaborators;
    const collaboratorIds = Object.keys(collaborators);
    
    // Allow 1 collaborator (self-chat) or 2 collaborators (regular chat)
    if (collaboratorIds.length < 1 || collaboratorIds.length > 2) {
      return false;
    }

    if (!collaborators[context.user.id]) {
      return false;
    }

    // For self-chat (1 collaborator), ensure it's the user themselves
    if (collaboratorIds.length === 1 && collaboratorIds[0] !== context.user.id) {
      return false;
    }

    return true;
  },
  canUpdateAttributes: () => {
    return false;
  },
  canUpdateDocument: () => {
    return false;
  },
  canDelete: () => {
    return false;
  },
  canReact: () => {
    return false;
  },
  extractText: () => {
    return null;
  },
  extractMentions: () => {
    return [];
  },
};
