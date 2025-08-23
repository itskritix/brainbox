export type SpaceChildReorderMutationInput = {
  type: 'space.child.reorder';
  accountId: string;
  workspaceId: string;
  spaceId: string;
  childId: string;
  after: string | null;
};

export type SpaceChildReorderMutationOutput = {
  success: boolean;
};

declare module '@brainbox/client/mutations' {
  interface MutationMap {
    'space.child.reorder': {
      input: SpaceChildReorderMutationInput;
      output: SpaceChildReorderMutationOutput;
    };
  }
}
