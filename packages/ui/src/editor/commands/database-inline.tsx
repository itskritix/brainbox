import { DatabaseZap } from 'lucide-react';

import { EditorCommand } from '@brainbox/client/types';

export const DatabaseInlineCommand: EditorCommand = {
  key: 'database-inline',
  name: 'Database - Inline',
  description: 'Insert a database inline in the current document',
  keywords: ['database', 'inline'],
  icon: DatabaseZap,
  disabled: false,
  async handler({ editor, range, context }) {
    if (context == null) {
      return;
    }

    const { accountId, workspaceId, documentId } = context;
    const output = await window.brainbox.executeMutation({
      type: 'database.create',
      name: 'Untitled',
      accountId,
      workspaceId,
      parentId: documentId,
    });

    if (!output.success) {
      return;
    }

    editor
      .chain()
      .focus()
      .deleteRange(range)
      .insertContent({
        type: 'database',
        attrs: {
          id: output.output.id,
          inline: true,
        },
      })
      .run();
  },
};
