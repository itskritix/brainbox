import { z } from 'zod/v4';

import { extractNodeRole } from '@colanode/core/lib/nodes';
import { hasNodeRole, hasWorkspaceRole } from '@colanode/core/lib/permissions';
import { NodeAttributes } from '@colanode/core/registry/nodes';
import { NodeModel, nodeRoleEnum } from '@colanode/core/registry/nodes/core';

export const channelAttributesSchema = z.object({
  type: z.literal('channel'),
  name: z.string(),
  avatar: z.string().nullable().optional(),
  parentId: z.string(),
  collaborators: z.record(z.string(), nodeRoleEnum),
});

export type ChannelAttributes = z.infer<typeof channelAttributesSchema>;

export const channelModel: NodeModel = {
  type: 'channel',
  attributesSchema: channelAttributesSchema,
  canCreate: (context) => {
    // Channels can now be created directly under workspaces (tree.length === 0)
    // or under other nodes (tree.length > 0)
    if (context.tree.length === 0) {
      // Direct child of workspace - check workspace role
      return hasWorkspaceRole(context.user.role, 'collaborator');
    }

    // Child of another node - check node role
    const role = extractNodeRole(context.tree, context.user.id);
    if (!role) {
      return false;
    }

    return hasNodeRole(role, 'editor');
  },
  canUpdateAttributes: (context) => {
    // Check if user has node-level permissions in the channel itself
    if (context.tree.length > 0) {
      const role = extractNodeRole(context.tree, context.user.id);
      if (role && hasNodeRole(role, 'editor')) {
        return true;
      }
    }

    // If no node-level role, check workspace role
    return hasWorkspaceRole(context.user.role, 'collaborator');
  },
  canUpdateDocument: () => {
    return false;
  },
  canDelete: (context) => {
    // Check if user has node-level permissions in the channel itself
    if (context.tree.length > 0) {
      const role = extractNodeRole(context.tree, context.user.id);
      if (role && hasNodeRole(role, 'admin')) {
        return true;
      }
    }

    // If no node-level role, check workspace role
    return hasWorkspaceRole(context.user.role, 'admin');
  },
  canReact: () => {
    return false;
  },
  extractText: (_: string, attributes: NodeAttributes) => {
    if (attributes.type !== 'channel') {
      throw new Error('Invalid node type');
    }

    return {
      name: attributes.name,
      attributes: null,
    };
  },
  extractMentions: () => {
    return [];
  },
};
