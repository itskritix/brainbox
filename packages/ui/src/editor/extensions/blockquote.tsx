import { Blockquote } from '@tiptap/extension-blockquote';

import { defaultClasses } from '@brainbox/ui/editor/classes';

export const BlockquoteNode = Blockquote.configure({
  HTMLAttributes: {
    class: defaultClasses.blockquote,
  },
});
