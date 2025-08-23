export type AccountUpdateMutationInput = {
  type: 'account.update';
  id: string;
  name: string;
  avatar: string | null | undefined;
};

export type AccountUpdateMutationOutput = {
  success: boolean;
};

declare module '@brainbox/client/mutations' {
  interface MutationMap {
    'account.update': {
      input: AccountUpdateMutationInput;
      output: AccountUpdateMutationOutput;
    };
  }
}
