export type FolderDeleteMutationInput = {
  type: 'folder.delete';
  accountId: string;
  workspaceId: string;
  folderId: string;
};

export type FolderDeleteMutationOutput = {
  success: boolean;
};

declare module '@brainbox/client/mutations' {
  interface MutationMap {
    'folder.delete': {
      input: FolderDeleteMutationInput;
      output: FolderDeleteMutationOutput;
    };
  }
}
