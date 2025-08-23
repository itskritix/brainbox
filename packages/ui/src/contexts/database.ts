import { createContext, useContext } from 'react';

import {
  DatabaseNameFieldAttributes,
  FieldAttributes,
  FieldType,
  NodeRole,
  SelectOptionAttributes,
} from '@brainbox/core';

interface DatabaseContext {
  id: string;
  name: string;
  nameField: DatabaseNameFieldAttributes | null | undefined;
  fields: FieldAttributes[];
  canEdit: boolean;
  canCreateRecord: boolean;
  role: NodeRole;
  createField: (type: FieldType, name: string) => void;
  renameField: (id: string, name: string) => void;
  updateNameField: (name: string) => void;
  deleteField: (id: string) => void;
  createSelectOption: (fieldId: string, name: string, color: string) => void;
  updateSelectOption: (
    fieldId: string,
    attributes: SelectOptionAttributes
  ) => void;
  deleteSelectOption: (fieldId: string, optionId: string) => void;
}

export const DatabaseContext = createContext<DatabaseContext>(
  {} as DatabaseContext
);

export const useDatabase = () => useContext(DatabaseContext);
