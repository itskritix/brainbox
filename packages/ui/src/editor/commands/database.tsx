import { Database } from 'lucide-react';

import { EditorCommand } from '@brainbox/client/types';

export const DatabaseCommand: EditorCommand = {
  key: 'database',
  name: 'Database - Full Page',
  description: 'Insert a full page database',
  keywords: ['database', 'full', 'page'],
  icon: Database,
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
        },
      })
      .run();
  },
};
