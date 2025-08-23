import { Table } from '@tiptap/extension-table/table';
import { ReactNodeViewRenderer } from '@tiptap/react';

import { TableNodeView } from '@brainbox/ui/editor/views/table';

export const TableNode = Table.configure({
  allowTableNodeSelection: true,
  cellMinWidth: 100,
}).extend({
  addNodeView() {
    return ReactNodeViewRenderer(TableNodeView, {
      contentDOMElementTag: 'tbody',
    });
  },
});
