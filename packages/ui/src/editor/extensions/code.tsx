import { Code } from '@tiptap/extension-code';

import { defaultClasses } from '@brainbox/ui/editor/classes';

export const CodeMark = Code.configure({
  HTMLAttributes: {
    class: defaultClasses.code,
  },
});
