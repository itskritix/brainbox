export type NodeInteractionOpenedMutationInput = {
  type: 'node.interaction.opened';
  accountId: string;
  workspaceId: string;
  nodeId: string;
};

export type NodeInteractionOpenedMutationOutput = {
  success: boolean;
};

declare module '@brainbox/client/mutations' {
  interface MutationMap {
    'node.interaction.opened': {
      input: NodeInteractionOpenedMutationInput;
      output: NodeInteractionOpenedMutationOutput;
    };
  }
}
