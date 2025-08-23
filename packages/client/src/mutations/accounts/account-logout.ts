export type AccountLogoutMutationInput = {
  type: 'account.logout';
  accountId: string;
};

export type AccountLogoutMutationOutput = {
  success: boolean;
};

declare module '@brainbox/client/mutations' {
  interface MutationMap {
    'account.logout': {
      input: AccountLogoutMutationInput;
      output: AccountLogoutMutationOutput;
    };
  }
}
