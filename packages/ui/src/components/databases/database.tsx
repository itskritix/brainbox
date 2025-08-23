import { ReactNode } from 'react';
import { toast } from 'sonner';

import { LocalDatabaseNode } from '@brainbox/client/types';
import { NodeRole, hasNodeRole } from '@brainbox/core';
import { DatabaseContext } from '@brainbox/ui/contexts/database';
import { useWorkspace } from '@brainbox/ui/contexts/workspace';

interface DatabaseProps {
  database: LocalDatabaseNode;
  role: NodeRole;
  children: ReactNode;
}

export const Database = ({ database, role, children }: DatabaseProps) => {
  const workspace = useWorkspace();
  const canEdit = hasNodeRole(role, 'editor');
  const canCreateRecord = hasNodeRole(role, 'editor');

  return (
    <DatabaseContext.Provider
      value={{
        id: database.id,
        name: database.attributes.name,
        nameField: database.attributes.nameField,
        role,
        fields: Object.values(database.attributes.fields),
        canEdit,
        canCreateRecord,
        createField: async (type, name) => {
          if (!canEdit) return;

          const result = await window.brainbox.executeMutation({
            type: 'field.create',
            databaseId: database.id,
            name,
            fieldType: type,
            accountId: workspace.accountId,
            workspaceId: workspace.id,
          });

          if (!result.success) {
            toast.error(result.error.message);
          }
        },
        renameField: async (id, name) => {
          if (!canEdit) return;

          const result = await window.brainbox.executeMutation({
            type: 'field.name.update',
            databaseId: database.id,
            fieldId: id,
            name,
            accountId: workspace.accountId,
            workspaceId: workspace.id,
          });

          if (!result.success) {
            toast.error(result.error.message);
          }
        },
        updateNameField: async (name) => {
          if (!canEdit) return;

          const result = await window.brainbox.executeMutation({
            type: 'database.name.field.update',
            databaseId: database.id,
            name,
            accountId: workspace.accountId,
            workspaceId: workspace.id,
          });

          if (!result.success) {
            toast.error(result.error.message);
          }
        },
        deleteField: async (id) => {
          if (!canEdit) return;

          const result = await window.brainbox.executeMutation({
            type: 'field.delete',
            databaseId: database.id,
            fieldId: id,
            accountId: workspace.accountId,
            workspaceId: workspace.id,
          });

          if (!result.success) {
            toast.error(result.error.message);
          }
        },
        createSelectOption: async (fieldId, name, color) => {
          if (!canEdit) return;

          const result = await window.brainbox.executeMutation({
            type: 'select.option.create',
            databaseId: database.id,
            fieldId,
            name,
            color,
            accountId: workspace.accountId,
            workspaceId: workspace.id,
          });

          if (!result.success) {
            toast.error(result.error.message);
          }
        },
        updateSelectOption: async (fieldId, attributes) => {
          if (!canEdit) return;

          const result = await window.brainbox.executeMutation({
            type: 'select.option.update',
            databaseId: database.id,
            fieldId,
            optionId: attributes.id,
            name: attributes.name,
            color: attributes.color,
            accountId: workspace.accountId,
            workspaceId: workspace.id,
          });

          if (!result.success) {
            toast.error(result.error.message);
          }
        },
        deleteSelectOption: async (fieldId, optionId) => {
          if (!canEdit) return;

          const result = await window.brainbox.executeMutation({
            type: 'select.option.delete',
            databaseId: database.id,
            fieldId,
            optionId,
            accountId: workspace.accountId,
            workspaceId: workspace.id,
          });

          if (!result.success) {
            toast.error(result.error.message);
          }
        },
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
};
