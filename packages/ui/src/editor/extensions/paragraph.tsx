import { Paragraph } from '@tiptap/extension-paragraph';

import { defaultClasses } from '@brainbox/ui/editor/classes';

export const ParagraphNode = Paragraph.configure({
  HTMLAttributes: {
    class: defaultClasses.paragraph,
  },
});
