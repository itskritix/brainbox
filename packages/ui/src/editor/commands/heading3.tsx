import { Heading3 } from 'lucide-react';

import { EditorCommand } from '@brainbox/client/types';

export const Heading3Command: EditorCommand = {
  key: 'heading3',
  name: 'Heading 3',
  description: 'Insert a heading 3 element',
  keywords: ['heading', 'heading3', 'h3'],
  icon: Heading3,
  disabled: false,
  handler: ({ editor, range }) => {
    editor.chain().focus().deleteRange(range).setNode('heading3').run();
  },
};
