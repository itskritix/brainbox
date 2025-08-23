import { FieldType } from '@brainbox/core';

export type FieldCreateMutationInput = {
  type: 'field.create';
  accountId: string;
  workspaceId: string;
  databaseId: string;
  name: string;
  fieldType: FieldType;
  relationDatabaseId?: string | null;
};

export type FieldCreateMutationOutput = {
  id: string;
};

declare module '@brainbox/client/mutations' {
  interface MutationMap {
    'field.create': {
      input: FieldCreateMutationInput;
      output: FieldCreateMutationOutput;
    };
  }
}
