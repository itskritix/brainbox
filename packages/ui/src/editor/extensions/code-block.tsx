import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { ReactNodeViewRenderer } from '@tiptap/react';

import { defaultClasses } from '@brainbox/ui/editor/classes';
import { CodeBlockNodeView } from '@brainbox/ui/editor/views';
import { lowlight } from '@brainbox/ui/lib/lowlight';

export const CodeBlockNode = CodeBlockLowlight.extend({
  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockNodeView, {
      as: 'code-block',
    });
  },
}).configure({
  lowlight,
  defaultLanguage: 'plaintext',
  HTMLAttributes: {
    class: defaultClasses.codeBlock,
  },
});
